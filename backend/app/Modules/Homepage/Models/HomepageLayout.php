<?php

namespace App\Modules\Homepage\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageLayout extends Model
{
    protected $fillable = [
        'name',
        'is_default',
        'sections_order', // JSON array of section keys in order
        'settings', // JSON for global homepage settings
        'header_config', // JSON for header customization
        'footer_config', // JSON for footer customization
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'sections_order' => 'array',
        'settings' => 'array',
        'header_config' => 'array',
        'footer_config' => 'array',
    ];

    public static function getDefaultLayout()
    {
        return self::where('is_default', true)->first();
    }

    public function getSectionsOrder(): array
    {
        return $this->sections_order ?? [];
    }

    // Relationship for layout() method - returns all layouts
    public function sections()
    {
        return HomepageSection::where('is_active', true)->orderBy('order');
    }
}