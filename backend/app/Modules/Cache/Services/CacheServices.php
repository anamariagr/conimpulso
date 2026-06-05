<?php

namespace App\Modules\Cache\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    private const DEFAULT_TTL = 3600; // 1 hour

    public function remember(string $key, callable $callback, int $ttl = null)
    {
        return Cache::remember($key, $ttl ?? self::DEFAULT_TTL, $callback);
    }

    public function rememberForever(string $key, callable $callback)
    {
        return Cache::forever($key, $callback);
    }

    public function getOrSet(string $key, callable $callback, array $tags = [], int $ttl = null)
    {
        $value = Cache::get($key);

        if ($value !== null) {
            return $value;
        }

        $value = $callback();
        $ttl = $ttl ?? self::DEFAULT_TTL;

        if (!empty($tags)) {
            // Use cache tags if supported
            Cache::tags($tags)->put($key, $value, $ttl);
        } else {
            Cache::put($key, $value, $ttl);
        }

        return $value;
    }

    public function invalidate(string $key): bool
    {
        return Cache::forget($key);
    }

    public function invalidateTags(array $tags): bool
    {
        return Cache::tags($tags)->flush();
    }

    public function getStats(): array
    {
        try {
            $redis = Redis::connection();
            $info = $redis->info();

            return [
                'used_memory' => $info['used_memory_human'] ?? 'N/A',
                'connected_clients' => $info['connected_clients'] ?? 0,
                'total_commands' => $info['total_commands_processed'] ?? 0,
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                'hit_rate' => $this->calculateHitRate($info),
            ];
        } catch (\Exception $e) {
            return ['error' => 'Redis not available'];
        }
    }

    private function calculateHitRate(array $info): float
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;

        if ($total === 0) {
            return 0.0;
        }

        return round(($hits / $total) * 100, 2);
    }
}

class SearchService
{
    public function search(string $query, array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $cacheKey = "search:" . md5($query . serialize($filters) . $page);

        return Cache::remember($cacheKey, 300, function () use ($query, $filters, $page, $perPage) {
            // In production, this would use Meilisearch, Elasticsearch, or similar
            // For now, we do a basic search with LIKE

            $results = [
                'products' => $this->searchProducts($query, $filters, $page, $perPage),
                'shops' => $this->searchShops($query, $page, $perPage),
                'total' => 0,
            ];

            $results['total'] = count($results['products']) + count($results['shops']);

            return $results;
        });
    }

    private function searchProducts(string $query, array $filters, int $page, int $perPage): array
    {
        $productModel = \App\Modules\Products\Models\Product::with('shop')
            ->where('status', 'active');

        if (!empty($query)) {
            $productModel->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            });
        }

        return $productModel
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->toArray();
    }

    private function searchShops(string $query, int $page, int $perPage): array
    {
        $shopModel = \App\Modules\Shops\Models\Shop::with('user')
            ->where('status', 'approved');

        if (!empty($query)) {
            $shopModel->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            });
        }

        return $shopModel
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->toArray();
    }

    public function indexProduct(int $productId): void
    {
        $product = \App\Modules\Products\Models\Product::with('shop')->find($productId);

        if ($product) {
            Cache::forget("search:product:{$productId}");
        }
    }

    public function indexShop(int $shopId): void
    {
        $shop = \App\Modules\Shops\Models\Shop::with('user')->find($shopId);

        if ($shop) {
            Cache::forget("search:shop:{$shopId}");
        }
    }
}

class QueueService
{
    public function dispatchJob($job, string $queue = 'default'): void
    {
        dispatch($job)->onQueue($queue);
    }

    public function dispatchAfterResponse($job): void
    {
        dispatch($job)->afterResponse();
    }

    public function getQueueStats(): array
    {
        // This would connect to Redis/Horizon in production
        return [
            'pending' => 0,
            'processing' => 0,
            'completed' => 0,
            'failed' => 0,
        ];
    }
}