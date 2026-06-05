<?php

namespace App\Modules\Homepage\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageBanner extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'media_type', // image, video, gif
        'media_url',
        'mobile_media_url',
        'link_url',
        'link_text',
        'position', // hero, sidebar, between_sections, popup
        'slot', // slot identifier for placement
        'is_active',
        'starts_at',
        'expires_at',
        'order',
        'target_audience', // all, vendors, buyers
        'clicks_count',
        'impressions_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'clicks_count' => 'integer',
        'impressions_count' => 'integer',
    ];

    const POSITION_HERO = 'hero';
    const POSITION_SIDEBAR = 'sidebar';
    const POSITION_BETWEEN_SECTIONS = 'between_sections';
    const POSITION_POPUP = 'popup';

    const MEDIA_IMAGE = 'image';
    const MEDIA_VIDEO = 'video';
    const MEDIA_GIF = 'gif';

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            });
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position)->orderBy('order');
    }
}