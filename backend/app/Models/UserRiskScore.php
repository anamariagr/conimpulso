<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRiskScore extends Model
{
    protected $fillable = [
        'user_id',
        'score',
        'risk_level',
        'flags',
        'assessed_at',
    ];

    protected function casts(): array
    {
        return [
            'flags' => 'array',
            'assessed_at' => 'datetime',
        ];
    }

    public const RISK_CRITICAL = 'critical';
    public const RISK_HIGH = 'high';
    public const RISK_MEDIUM = 'medium';
    public const RISK_LOW = 'low';
    public const RISK_MINIMAL = 'minimal';

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function isHighRisk(): bool
    {
        return in_array($this->risk_level, [self::RISK_CRITICAL, self::RISK_HIGH]);
    }
}