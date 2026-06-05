<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'business_type',
        'tax_id',
        'address',
        'phone',
        'email',
        'description',
        'website',
        'employees_count',
        'annual_revenue',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'employees_count' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function connections()
    {
        return $this->hasMany(B2BConnection::class, 'requester_id');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('business_type', $type);
    }
}
