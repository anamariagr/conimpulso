<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

class CachedQueryService
{
    public function getProductsByCategory(int $categoryId, int $ttl = 3600): Collection
    {
        return Cache::remember("products:category:{$categoryId}", $ttl, function () use ($categoryId) {
            return \App\Modules\Products\Models\Product::where('category_id', $categoryId)
                ->active()
                ->with(['shop', 'images'])
                ->get();
        });
    }

    public function getTrendingProducts(int $limit = 20, int $ttl = 1800): Collection
    {
        return Cache::remember("products:trending:{$limit}", $ttl, function () use ($limit) {
            return \App\Modules\Products\Models\Product::active()
                ->with(['shop', 'images'])
                ->orderByDesc('views')
                ->limit($limit)
                ->get();
        });
    }

    public function getShopsByCategory(int $categoryId, int $ttl = 3600): Collection
    {
        return Cache::remember("shops:category:{$categoryId}", $ttl, function () use ($categoryId) {
            return \App\Modules\Shops\Models\Shop::whereHas('categories', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })->active()->get();
        });
    }

    public function getCategoriesWithProducts(int $ttl = 7200): array
    {
        return Cache::remember('categories:with_products', $ttl, function () {
            return \App\Modules\Shops\Models\Category::withCount('products')
                ->orderBy('order')
                ->get()
                ->toArray();
        });
    }

    public function getProductRecommendations(int $productId, int $limit = 10, int $ttl = 3600): Collection
    {
        return Cache::remember("products:similar:{$productId}:{$limit}", $ttl, function () use ($productId, $limit) {
            $product = \App\Modules\Products\Models\Product::find($productId);
            if (!$product) {
                return collect();
            }

            return \App\Modules\Products\Models\Product::active()
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $productId)
                ->with(['shop', 'images'])
                ->limit($limit)
                ->get();
        });
    }

    public function getUserStats(int $userId, int $ttl = 300): array
    {
        return Cache::remember("user:stats:{$userId}", $ttl, function () use ($userId) {
            $user = \App\Modules\Auth\Models\User::find($userId);
            return [
                'products_count' => $user->products()->count(),
                'shops_count' => $user->shops()->count(),
                'orders_count' => $user->orders()->count(),
                'leads_count' => $user->leads()->count(),
            ];
        });
    }

    public function getShopStats(int $shopId, int $ttl = 300): array
    {
        return Cache::remember("shop:stats:{$shopId}", $ttl, function () use ($shopId) {
            $shop = \App\Modules\Shops\Models\Shop::find($shopId);
            return [
                'products_count' => $shop->products()->count(),
                'views' => $shop->views ?? 0,
                'followers' => $shop->followers ?? 0,
                'rating' => $shop->rating ?? 0,
            ];
        });
    }

    public function getB2BProfiles(string $type = null, int $ttl = 1800): Collection
    {
        $cacheKey = $type ? "b2b:profiles:{$type}" : "b2b:profiles:all";

        return Cache::remember($cacheKey, $ttl, function () use ($type) {
            $query = \App\Modules\B2B\Models\BusinessProfile::verified()
                ->active();

            if ($type) {
                $query->byType($type);
            }

            return $query->with(['user'])->get();
        });
    }
}