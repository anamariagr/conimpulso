<?php

namespace App\Services;

use App\Modules\Homepage\Models\HomepageLayout;

class SiteSettings
{
    protected static ?array $cached = null;

    public static function all(): array
    {
        if (self::$cached === null) {
            $layout = HomepageLayout::where('is_default', true)->first();
            self::$cached = $layout?->settings ?? [];
        }

        return self::$cached;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::all()[$key] ?? $default;
    }
}
