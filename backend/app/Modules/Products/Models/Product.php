<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shop_id',
        'name',
        'slug',
        'description',
        'images',
        'videos',
        'price',
        'price_wholesale',
        'minimum_quantity',
        'minimum_wholesale_quantity',
        'volume_discounts',
        'stock',
        'sku',
        'status',
        'fabrication_time',
        'weight',
        'dimensions',
        'attributes',
        'tags',
        'views',
        'sales_count',
        'rating_sum',
        'rating_count',
        'is_featured',
        'allow_quotation',
        'allow_custom_order',
        'settings',
        'story',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'videos' => 'array',
            'volume_discounts' => 'array',
            'dimensions' => 'array',
            'attributes' => 'array',
            'tags' => 'array',
            'settings' => 'array',
            'story' => 'array',
            'price' => 'decimal:2',
            'price_wholesale' => 'decimal:2',
            'weight' => 'decimal:2',
            'is_featured' => 'boolean',
            'allow_quotation' => 'boolean',
            'allow_custom_order' => 'boolean',
            'views' => 'integer',
            'sales_count' => 'integer',
            'rating_sum' => 'integer',
            'rating_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                $product->slug = static::generateUniqueSlug($product->name, $product->id);
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

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function categories()
    {
        return $this->belongsToMany(
            \App\Modules\Shops\Models\Category::class,
            'product_categories'
        )->withPivot('is_primary');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function getAverageRatingAttribute(): float
    {
        if ($this->rating_count === 0) return 0;
        return round($this->rating_sum / $this->rating_count, 1);
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->price_wholesale || $this->price <= 0) return null;
        return round((($this->price - $this->price_wholesale) / $this->price) * 100);
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('stock', '>', 0);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('categories.id', $categoryId);
        });
    }

    public function scopeByPriceRange($query, float $min = 0, float $max = PHP_FLOAT_MAX)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }
}