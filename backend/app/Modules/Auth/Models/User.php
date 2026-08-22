<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'document_id',
        'address',
        'avatar',
        'status',
        'email_verified_at',
        'google_id',
        'messaging_enabled',
        'messaging_disabled_reason',
        'messaging_disabled_at',
        'messaging_disabled_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $guard_name = 'web';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'messaging_enabled' => 'boolean',
            'messaging_disabled_at' => 'datetime',
        ];
    }

    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    protected function getDefaultGuardName(): string
    {
        return 'web';
    }

    public function guardName(): string
    {
        return 'web';
    }

    public function shops()
    {
        return $this->hasMany(\App\Modules\Shops\Models\Shop::class);
    }

    public function wallet()
    {
        return $this->hasOne(\App\Modules\Wallet\Models\Wallet::class);
    }

    public function messagingDisabledBy()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'messaging_disabled_by');
    }

    public function disableMessaging(?int $byUserId = null, ?string $reason = null): void
    {
        $this->forceFill([
            'messaging_enabled' => false,
            'messaging_disabled_at' => now(),
            'messaging_disabled_by' => $byUserId,
            'messaging_disabled_reason' => $reason,
        ])->save();
    }

    public function enableMessaging(): void
    {
        $this->forceFill([
            'messaging_enabled' => true,
            'messaging_disabled_at' => null,
            'messaging_disabled_by' => null,
            'messaging_disabled_reason' => null,
        ])->save();
    }

    public function canReceiveMessages(): bool
    {
        return (bool) $this->messaging_enabled;
    }

    public function canSendMessages(): bool
    {
        return (bool) $this->messaging_enabled;
    }
}