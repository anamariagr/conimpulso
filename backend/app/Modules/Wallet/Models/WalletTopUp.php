<?php

namespace App\Modules\Wallet\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTopUp extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'amount',
        'coins_credited',
        'payment_method',
        'payment_reference',
        'payment_proof_url',
        'reference',
        'wompi_transaction_id',
        'status',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'coins_credited' => 'decimal:2',
            'verified_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }

    public function verifier()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'verified_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
