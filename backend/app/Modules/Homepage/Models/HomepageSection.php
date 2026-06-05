<?php

namespace App\Modules\Homepage\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'key',
        'name',
        'type', // hero, featured_products, categories, stores, slider, cards_grid, banner, testimonials, newsletter
        'title',
        'subtitle',
        'configuration', // JSON for section-specific settings
        'items', // JSON array of item IDs or data
        'layout', // grid, slider, list, masonry
        'columns', // number of columns
        'is_active',
        'order',
        'background_color',
        'padding_top',
        'padding_bottom',
    ];

    protected $casts = [
        'configuration' => 'array',
        'items' => 'array',
        'is_active' => 'boolean',
        'columns' => 'integer',
        'padding_top' => 'integer',
        'padding_bottom' => 'integer',
    ];

    const TYPE_HERO = 'hero';
    const TYPE_FEATURED_PRODUCTS = 'featured_products';
    const TYPE_CATEGORIES = 'categories';
    const TYPE_STORES = 'stores';
    const TYPE_SLIDER = 'slider';
    const TYPE_CARDS_GRID = 'cards_grid';
    const TYPE_BANNER = 'banner';
    const TYPE_TESTIMONIALS = 'testimonials';
    const TYPE_NEWSLETTER = 'newsletter';
    const TYPE_CUSTOM_HTML = 'custom_html';

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order');
    }

    public function getConfig(string $key, $default = null)
    {
        return $this->configuration[$key] ?? $default;
    }
}