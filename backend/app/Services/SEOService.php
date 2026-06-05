<?php

namespace App\Services;

use App\Modules\Products\Models\Product;
use App\Modules\Shops\Models\Shop;

class SEOService
{
    public function generateMetaTags(Product $product): array
    {
        $shop = $product->shop;

        return [
            'title' => $this->generateProductTitle($product),
            'description' => $this->generateProductDescription($product),
            'keywords' => $this->generateKeywords($product),
            'og_image' => $product->images->first() ?? null,
            'canonical_url' => url("/products/{$product->id}"),
        ];
    }

    public function generateShopMetaTags(Shop $shop): array
    {
        return [
            'title' => $this->generateShopTitle($shop),
            'description' => $this->generateShopDescription($shop),
            'keywords' => $this->generateShopKeywords($shop),
            'og_image' => $shop->banner ?? null,
            'canonical_url' => url("/stores/{$shop->slug}"),
        ];
    }

    private function generateProductTitle(Product $product): string
    {
        $parts = [
            $product->name,
            $product->shop->name,
            config('app.name'),
        ];

        return implode(' | ', array_filter($parts));
    }

    private function generateProductDescription(Product $product): string
    {
        $description = $product->description ?? '';
        $description = strip_tags($description);

        if (strlen($description) > 160) {
            $description = substr($description, 0, 157) . '...';
        }

        if (empty($description)) {
            $description = "Compra {$product->name} en {$product->shop->name}. ";
            $description .= "Precio: $" . number_format($product->price, 0);
        }

        return $description;
    }

    private function generateKeywords(Product $product): string
    {
        $keywords = [];

        // Product name words
        $words = explode(' ', $product->name);
        $keywords = array_merge($keywords, array_slice($words, 0, 5));

        // Category
        if ($product->categories->count() > 0) {
            $keywords[] = $product->categories->first()->name;
        }

        // Shop name
        $keywords[] = $product->shop->name;

        // Location
        if ($product->shop->city) {
            $keywords[] = $product->shop->city;
        }

        return implode(', ', array_filter(array_unique($keywords)));
    }

    private function generateShopTitle(Shop $shop): string
    {
        return "{$shop->name} | {$shop->city} | " . config('app.name');
    }

    private function generateShopDescription(Shop $shop): string
    {
        $description = $shop->description ?? '';
        $description = strip_tags($description);

        if (strlen($description) > 160) {
            $description = substr($description, 0, 157) . '...';
        }

        if (empty($description)) {
            $description = "Visita {$shop->name} en " . config('app.name') . ". ";
            $description .= "Productos de calidad en {$shop->city}.";
        }

        return $description;
    }

    private function generateShopKeywords(Shop $shop): string
    {
        $keywords = [$shop->name, $shop->city];

        if ($shop->categories->count() > 0) {
            foreach ($shop->categories->take(3) as $category) {
                $keywords[] = $category->name;
            }
        }

        return implode(', ', array_filter(array_unique($keywords)));
    }

    public function generateStructuredData(Product $product): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => strip_tags($product->description ?? ''),
            'image' => $product->images->first(),
            'offers' => [
                '@type' => 'Offer',
                'priceCurrency' => 'COP',
                'price' => $product->price,
                'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            ],
            'brand' => [
                '@type' => 'Brand',
                'name' => $product->shop->name,
            ],
            'seller' => [
                '@type' => 'Organization',
                'name' => $product->shop->name,
            ],
        ];
    }

    public function generateSitemapIndex(): array
    {
        $urls = [];

        // Static pages
        $urls[] = ['loc' => url('/'), 'priority' => '1.0', 'changefreq' => 'daily'];

        // Products
        Product::active()->chunk(100, function ($products) use (&$urls) {
            foreach ($products as $product) {
                $urls[] = [
                    'loc' => url("/products/{$product->id}"),
                    'priority' => '0.8',
                    'changefreq' => 'weekly',
                    'lastmod' => $product->updated_at->toDateString(),
                ];
            }
        });

        // Shops
        Shop::active()->chunk(100, function ($shops) use (&$urls) {
            foreach ($shops as $shop) {
                $urls[] = [
                    'loc' => url("/stores/{$shop->slug}"),
                    'priority' => '0.9',
                    'changefreq' => 'daily',
                    'lastmod' => $shop->updated_at->toDateString(),
                ];
            }
        });

        return $urls;
    }
}