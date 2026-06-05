<?php

namespace App\Modules\AI\Services;

class ProductRecommendationService
{
    public function getSimilarProducts(int $productId, int $limit = 10): array
    {
        $product = \App\Modules\Products\Models\Product::find($productId);

        if (!$product) {
            return [];
        }

        return \App\Modules\Products\Models\Product::where('category_id', $product->category_id)
            ->where('id', '!=', $productId)
            ->where('status', 'active')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getRelatedProducts(int $productId, int $limit = 5): array
    {
        $product = \App\Modules\Products\Models\Product::with('shop')->find($productId);

        if (!$product) {
            return [];
        }

        return \App\Modules\Products\Models\Product::where('shop_id', $product->shop_id)
            ->where('id', '!=', $productId)
            ->where('status', 'active')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getTrendingProducts(int $limit = 10): array
    {
        return \App\Modules\Products\Models\Product::with('shop')
            ->where('status', 'active')
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getPersonalizedRecommendations(int $userId, int $limit = 10): array
    {
        $user = \App\Modules\Auth\Models\User::find($userId);

        if (!$user || !$user->shop) {
            return $this->getTrendingProducts($limit);
        }

        $shopCategories = $user->shop->products()->pluck('category_id')->toArray();

        return \App\Modules\Products\Models\Product::with('shop')
            ->whereIn('category_id', array_unique($shopCategories))
            ->where('shop_id', '!=', $user->shop_id)
            ->where('status', 'active')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}