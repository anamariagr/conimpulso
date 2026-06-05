<?php

namespace App\Modules\AI\Services;

class AIContentModerationService
{
    private array $spamPatterns = [
        'buy now' => 0.3,
        'click here' => 0.2,
        'limited time offer' => 0.25,
        'act now' => 0.3,
        'free money' => 0.8,
        'congratulations you won' => 0.9,
        'make money fast' => 0.7,
        'weight loss' => 0.4,
        'casino' => 0.6,
        'crypto' => 0.3,
        'lottery' => 0.8,
        'bitcoin giveaway' => 0.9,
        'wire transfer' => 0.5,
        'western union' => 0.5,
        'http://' => 0.1,
        'https://' => 0.1,
        'www.' => 0.1,
    ];

    private array $blockedWords = [
        'escort', 'viagra', 'cialis', 'gambling', 'casino',
        'moneygram', 'forex', 'trading signals',
    ];

    public function moderateContent(string $content, string $type = 'general'): array
    {
        $contentLower = strtolower($content);
        $totalScore = 0;
        $patternsFound = [];

        foreach ($this->spamPatterns as $pattern => $score) {
            if (str_contains($contentLower, $pattern)) {
                $totalScore += $score;
                $patternsFound[] = $pattern;
            }
        }

        foreach ($this->blockedWords as $word) {
            if (str_contains($contentLower, $word)) {
                $totalScore += 0.5;
                $patternsFound[] = "blocked_word:{$word}";
            }
        }

        $finalScore = min($totalScore / count($this->spamPatterns), 1.0);
        $action = $this->determineAction($finalScore, $type);

        return [
            'score' => round($finalScore, 3),
            'is_approved' => $action === 'approve',
            'action' => $action,
            'patterns_found' => $patternsFound,
            'flags' => $this->generateFlags($finalScore, $patternsFound),
            'confidence' => $this->calculateConfidence($finalScore),
        ];
    }

    public function moderateImage(array $imageData): array
    {
        return [
            'is_safe' => true,
            'score' => 0.1,
            'flags' => [],
            'categories' => [],
        ];
    }

    private function determineAction(float $score, string $type): string
    {
        if ($score < 0.3) return 'approve';
        if ($score < 0.6) return 'review';
        return 'reject';
    }

    private function generateFlags(float $score, array $patterns): array
    {
        $flags = [];
        if ($score >= 0.5) $flags[] = 'high_spam_probability';
        if ($score >= 0.3 && $score < 0.5) $flags[] = 'medium_spam_probability';
        if (count($patterns) > 3) $flags[] = 'multiple_spam_patterns';
        foreach ($patterns as $pattern) {
            if (str_starts_with($pattern, 'blocked_word:')) {
                $flags[] = 'contains_blocked_content';
            }
        }
        return $flags;
    }

    private function calculateConfidence(float $score): float
    {
        if ($score < 0.2 || $score > 0.8) return 0.95;
        if ($score < 0.4 || $score > 0.6) return 0.85;
        return 0.75;
    }

    public function analyzeUserBehavior(array $events): array
    {
        $riskScore = 0;
        $flags = [];

        $rapidActions = 0;
        $lastTime = null;

        foreach ($events as $event) {
            if ($lastTime && abs($event['timestamp'] - $lastTime) < 1) {
                $rapidActions++;
            }
            $lastTime = $event['timestamp'];
        }

        if ($rapidActions > 10) {
            $riskScore += 0.3;
            $flags[] = 'rapid_action_burst';
        }

        $hour = date('H');
        if ($hour >= 2 && $hour <= 5) {
            $riskScore += 0.1;
            $flags[] = 'unusual_activity_hours';
        }

        return [
            'risk_score' => min($riskScore, 1.0),
            'risk_level' => $riskScore < 0.3 ? 'low' : ($riskScore < 0.6 ? 'medium' : 'high'),
            'flags' => $flags,
            'recommendations' => $this->getRecommendations($riskScore, $flags),
        ];
    }

    private function getRecommendations(float $riskScore, array $flags): array
    {
        $recommendations = [];
        if ($riskScore > 0.5) $recommendations[] = 'require_additional_verification';
        if (in_array('rapid_action_burst', $flags)) $recommendations[] = 'implement_rate_limiting';
        if (count($flags) > 2) $recommendations[] = 'flag_for_manual_review';
        return $recommendations;
    }
}