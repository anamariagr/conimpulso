<?php

namespace App\Services;

use App\Modules\Wallet\Models\Wallet;
use App\Modules\Wallet\Models\WalletTopUp;

class WalletTopUpService
{
    public static function coinRate(): float
    {
        return (float) SiteSettings::get('wallet_coin_value_cop', 3000);
    }

    public static function approve(WalletTopUp $topUp, ?int $verifiedBy = null): void
    {
        if ($topUp->status !== 'pending') {
            return;
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $topUp->user_id],
            ['balance' => 0, 'currency' => 'USD']
        );

        $coins = round((float) $topUp->amount / self::coinRate(), 2);

        $wallet->credit($coins, 'Recarga aprobada: ' . ($topUp->payment_reference ?: $topUp->reference), 'deposit');

        $topUp->update([
            'status' => 'approved',
            'wallet_id' => $wallet->id,
            'coins_credited' => $coins,
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
    }

    public static function reject(WalletTopUp $topUp, ?int $verifiedBy = null): void
    {
        if ($topUp->status !== 'pending') {
            return;
        }

        $topUp->update([
            'status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
    }

    public static function resolveFromWompi(WalletTopUp $topUp, string $wompiStatus, string $transactionId): void
    {
        if ($topUp->status !== 'pending') {
            return;
        }

        $topUp->update(['wompi_transaction_id' => $transactionId]);

        if ($wompiStatus === 'APPROVED') {
            self::approve($topUp->fresh());
        } elseif (in_array($wompiStatus, ['DECLINED', 'VOIDED', 'ERROR'], true)) {
            self::reject($topUp->fresh());
        }
    }
}
