<?php

namespace App\Services;

use App\Modules\Auth\Models\User;
use App\Models\UserRiskScore;
use Illuminate\Support\Facades\Cache;

class FraudDetectionService
{
    private array $highRiskPatterns = [
        'multiple_accounts_same_ip',
        'rapid_transaction_velocity',
        'unusual_order_patterns',
        'address_mismatch',
        'phone_number_discrepancy',
        'email_domain_suspicion',
        'shipping_vs_billing_mismatch',
    ];

    public function assessUserRisk(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['risk_level' => 'unknown', 'score' => 0, 'flags' => []];
        }

        $flags = [];
        $score = 0;

        // Check account age
        $accountAge = now()->diffInDays($user->created_at);
        if ($accountAge < 1) {
            $flags[] = 'new_account_24h';
            $score += 20;
        } elseif ($accountAge < 7) {
            $flags[] = 'new_account_7d';
            $score += 10;
        }

        // Check transaction velocity
        $recentOrders = $user->orders()->where('created_at', '>=', now()->subHours(24))->count();
        if ($recentOrders > 10) {
            $flags[] = 'high_transaction_velocity';
            $score += 30;
        } elseif ($recentOrders > 5) {
            $flags[] = 'elevated_transaction_velocity';
            $score += 15;
        }

        // Check failed payment rate
        $failedPayments = $user->paymentAttempts()->where('status', 'failed')
            ->where('created_at', '>=', now()->subDays(7))->count();
        if ($failedPayments > 3) {
            $flags[] = 'high_failed_payment_rate';
            $score += 25;
        }

        // Check for suspicious IP patterns (multiple accounts from same IP)
        $ipAddress = request()->ip();
        $accountsOnIp = User::where('ip_address', $ipAddress)->count();
        if ($accountsOnIp > 3) {
            $flags[] = 'multiple_accounts_same_ip';
            $score += 40;
        }

        // Check order value anomalies
        $avgOrderValue = $user->orders()->avg('total') ?? 0;
        $recentOrdersValue = $user->orders()->where('created_at', '>=', now()->subDays(7))->avg('total') ?? 0;
        if ($recentOrdersValue > $avgOrderValue * 5 && $avgOrderValue > 0) {
            $flags[] = 'order_value_anomaly';
            $score += 20;
        }

        // Check shipping/billing address mismatch
        $lastOrder = $user->orders()->latest()->first();
        if ($lastOrder && $lastOrder->shipping_address !== $lastOrder->billing_address) {
            $flags[] = 'address_mismatch';
            $score += 15;
        }

        // Determine risk level
        $riskLevel = match (true) {
            $score >= 70 => 'critical',
            $score >= 50 => 'high',
            $score >= 30 => 'medium',
            $score >= 10 => 'low',
            default => 'minimal',
        };

        // Save risk score
        UserRiskScore::updateOrCreate(
            ['user_id' => $userId],
            [
                'score' => $score,
                'risk_level' => $riskLevel,
                'flags' => $flags,
                'assessed_at' => now(),
            ]
        );

        return [
            'risk_level' => $riskLevel,
            'score' => $score,
            'flags' => $flags,
            'recommendation' => $this->getRecommendation($riskLevel),
        ];
    }

    public function isActionAllowed(int $userId, string $action): bool
    {
        $riskAssessment = $this->assessUserRisk($userId);

        if ($riskAssessment['risk_level'] === 'critical') {
            return false;
        }

        if ($riskAssessment['risk_level'] === 'high' && in_array($action, ['high_value_order', 'withdrawal', 'new_address'])) {
            return false;
        }

        return true;
    }

    private function getRecommendation(string $riskLevel): string
    {
        return match ($riskLevel) {
            'critical' => 'Block all transactions and require manual verification',
            'high' => 'Require additional verification for high-value actions',
            'medium' => 'Monitor closely and add friction to critical actions',
            'low' => 'Standard monitoring',
            default => 'No action required',
        };
    }

    public function getRiskScore(int $userId): ?array
    {
        return Cache::remember("user_risk:{$userId}", 3600, function () use ($userId) {
            $riskScore = UserRiskScore::where('user_id', $userId)->first();
            return $riskScore ? $riskScore->toArray() : null;
        });
    }
}