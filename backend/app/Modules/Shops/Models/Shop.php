<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Shop extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'history',
        'logo',
        'banner',
        'video',
        'gallery',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'latitude',
        'longitude',
        'schedule',
        'social_media',
        'certifications',
        'payment_methods',
        'shipping_methods',
        'is_verified',
        'is_featured',
        'status',
        'rejection_reason',
        'views',
        'followers',
        'settings',
        'story',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'schedule' => 'array',
            'social_media' => 'array',
            'certifications' => 'array',
            'payment_methods' => 'array',
            'shipping_methods' => 'array',
            'settings' => 'array',
            'story' => 'array',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'views' => 'integer',
            'followers' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shop) {
            if (empty($shop->slug)) {
                $shop->slug = static::generateUniqueSlug($shop->name);
            }
        });

        static::updating(function ($shop) {
            if ($shop->isDirty('name') && !$shop->isDirty('slug')) {
                $shop->slug = static::generateUniqueSlug($shop->name, $shop->id);
            }
        });
    }

    public static function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        $query = static::withTrashed()->where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            $query = static::withTrashed()->where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'shop_categories');
    }

    public function tags()
    {
        return $this->hasMany(ShopTag::class);
    }

    public function products()
    {
        return $this->hasMany(\App\Modules\Products\Models\Product::class);
    }

    public function services()
    {
        return $this->hasMany(\App\Modules\Services\Models\Service::class);
    }

    public function reviews()
    {
        return $this->hasMany(\App\Modules\Shops\Models\ShopReview::class);
    }

    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalSalesAttribute(): int
    {
        return (int) $this->products()->sum('sales_count') + (int) $this->services()->sum('bookings_count');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function canBeEditedBy(User $user): bool
    {
        return $this->isOwnedBy($user) || $user->hasRole(['super_admin', 'admin']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('city', $city);
    }
}