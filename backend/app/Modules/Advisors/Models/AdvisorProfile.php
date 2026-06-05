<?php

namespace App\Modules\Advisors\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialty',
        'bio',
        'experience_years',
        'success_rate',
        'total_sales',
        'total_leads',
        'rating',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'success_rate' => 'float',
            'rating' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}
