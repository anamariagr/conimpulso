<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheInvalidationService
{
    public function invalidateModel(string $model, int $modelId, array $tags = []): void
    {
        $tags[] = $model;

        foreach ($tags as $tag) {
            Cache::tags([$tag, "{$tag}:{$modelId}"])->flush();
        }
    }

    public function invalidatePattern(string $pattern): void
    {
        $keys = Redis::keys($pattern);
        foreach ($keys as $key) {
            $key = str_replace(config('database.redis.options.prefix'), '', $key);
            Cache::forget($key);
        }
    }

    public function invalidateUser(int $userId): void
    {
        Cache::tags(['users', "user:{$userId}"])->flush();
    }

    public function invalidateShop(int $shopId): void
    {
        Cache::tags(['shops', "shop:{$shopId}"])->flush();
        $this->invalidateModel('products', $shopId, ['products']);
    }

    public function invalidateProduct(int $productId): void
    {
        Cache::tags(['products', "product:{$productId}"])->flush();
    }

    public function invalidateCategory(int $categoryId): void
    {
        Cache::tags(['categories', "category:{$categoryId}"])->flush();
        $this->invalidatePattern('trending:*');
        $this->invalidatePattern('recommendations:*');
    }

    public function invalidateB2B(int $businessProfileId): void
    {
        Cache::tags(['b2b', "b2b:{$businessProfileId}"])->flush();
    }

    public function invalidateCampaign(int $campaignId): void
    {
        Cache::tags(['advertising', "campaign:{$campaignId}"])->flush();
    }

    public function invalidateWallet(int $userId): void
    {
        Cache::tags(['wallet', "wallet:{$userId}"])->flush();
    }

    public function invalidateAll(): void
    {
        Cache::flush();
    }
}