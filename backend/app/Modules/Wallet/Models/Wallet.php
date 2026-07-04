<?php

namespace App\Modules\Wallet\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class, 'wallet_id');
    }

    public function topUps()
    {
        return $this->hasMany(WalletTopUp::class, 'wallet_id');
    }

    public function canDebit(float $amount): bool
    {
        return (float) $this->balance >= $amount;
    }

    public function credit(float $amount, ?string $description = null, string $type = 'credit', array $metadata = []): WalletTransaction
    {
        $this->increment('balance', $amount);

        return $this->transactions()->create([
            'user_id' => $this->user_id,
            'type' => $type,
            'amount' => $amount,
            'description' => $description,
            'balance_after' => $this->fresh()->balance,
            'status' => 'completed',
            'metadata' => $metadata,
        ]);
    }

    public function debit(float $amount, ?string $description = null, string $type = 'debit', array $metadata = []): WalletTransaction
    {
        $this->decrement('balance', $amount);

        return $this->transactions()->create([
            'user_id' => $this->user_id,
            'type' => $type,
            'amount' => -$amount,
            'description' => $description,
            'balance_after' => $this->fresh()->balance,
            'status' => 'completed',
            'metadata' => $metadata,
        ]);
    }
}
