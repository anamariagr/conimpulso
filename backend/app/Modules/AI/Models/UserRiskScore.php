<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRiskScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'risk_level',
        'risk_score',
        'factors',
        'last_updated',
    ];

    protected function casts(): array
    {
        return [
            'risk_score' => 'float',
            'factors' => 'array',
            'last_updated' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}
