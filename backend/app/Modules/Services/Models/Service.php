<?php

namespace App\Modules\Services\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shop_id',
        'name',
        'slug',
        'description',
        'requirements',
        'images',
        'portfolio',
        'base_price',
        'price_type',
        'min_price',
        'max_price',
        'duration_days',
        'coverage_area',
        'attributes',
        'tags',
        'status',
        'views',
        'bookings_count',
        'rating_sum',
        'rating_count',
        'is_featured',
        'allow_quotation',
        'allow_custom_request',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'portfolio' => 'array',
            'attributes' => 'array',
            'tags' => 'array',
            'settings' => 'array',
            'base_price' => 'decimal:2',
            'min_price' => 'decimal:2',
            'max_price' => 'decimal:2',
            'is_featured' => 'boolean',
            'allow_quotation' => 'boolean',
            'allow_custom_request' => 'boolean',
            'views' => 'integer',
            'bookings_count' => 'integer',
            'rating_sum' => 'integer',
            'rating_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($service) {
            if (empty($service->slug)) {
                $service->slug = static::generateUniqueSlug($service->name);
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

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }

    public function categories()
    {
        return $this->belongsToMany(
            \App\Modules\Shops\Models\Category::class,
            'service_categories'
        );
    }

    public function reviews()
    {
        return $this->hasMany(ServiceReview::class);
    }

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function getAverageRatingAttribute(): float
    {
        if ($this->rating_count === 0) return 0;
        return round($this->rating_sum / $this->rating_count, 1);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}

class ServiceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'user_id',
        'booking_id',
        'rating',
        'comment',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
    public function user() { return $this->belongsTo(\App\Modules\Auth\Models\User::class); }
}

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'user_id',
        'client_name',
        'client_email',
        'client_phone',
        'description',
        'attachments',
        'status',
        'quoted_price',
        'quote_notes',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'quoted_price' => 'decimal:2',
            'is_visible' => 'boolean',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
    public function user() { return $this->belongsTo(\App\Modules\Auth\Models\User::class); }
}