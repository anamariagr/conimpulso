<?php

namespace App\Modules\Admin\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Shops\Models\Shop;
use App\Modules\Shops\Models\Category;
use App\Modules\Products\Models\Product;
use App\Modules\Auth\Models\User;
use App\Modules\Homepage\Models\HomepageBanner;
use App\Modules\Homepage\Models\HomepageSection;
use App\Modules\Wallet\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    public function stats(Request $request): JsonResponse
    {
        $now = now();

        $totalShops = Shop::count();
        $activeShops = Shop::where('status', 'active')->count();
        $verifiedShops = Shop::where('is_verified', true)->count();
        $featuredShops = Shop::where('is_featured', true)->count();
        $pendingShops = Shop::where('status', 'pending')->count();

        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'active')->count();
        $inactiveProducts = Product::where('status', 'inactive')->count();
        $lowStockProducts = Product::where('stock', '<=', 10)->count();
        $totalStockUnits = (int) Product::sum('stock');
        $inventoryValue = (float) Product::sum(DB::raw('price * stock'));

        $totalUsers = User::count();
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        $newUsersThisMonth = User::where('created_at', '>=', $now->copy()->startOfMonth())->count();
        $newUsersLastMonth = User::whereBetween('created_at', [
            $now->copy()->subMonth()->startOfMonth(),
            $now->copy()->subMonth()->endOfMonth(),
        ])->count();

        $roleBreakdown = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('COUNT(*) as total'))
            ->groupBy('roles.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total])
            ->values();

        $totalCategories = Category::count();

        $activeBanners = HomepageBanner::where('is_active', true)->count();
        $totalBanners = HomepageBanner::count();
        $activeSections = HomepageSection::where('is_active', true)->count();
        $totalSections = HomepageSection::count();

        $totalWallets = Wallet::count();
        $totalWalletBalance = (float) Wallet::sum('balance');

        $newShopsThisMonth = Shop::where('created_at', '>=', $now->copy()->startOfMonth())->count();
        $newProductsThisMonth = Product::where('created_at', '>=', $now->copy()->startOfMonth())->count();

        $shopsChange = $this->percentChange($newShopsThisMonth, Shop::whereBetween('created_at', [
            $now->copy()->subMonth()->startOfMonth(),
            $now->copy()->subMonth()->endOfMonth(),
        ])->count());

        $productsChange = $this->percentChange($newProductsThisMonth, Product::whereBetween('created_at', [
            $now->copy()->subMonth()->startOfMonth(),
            $now->copy()->subMonth()->endOfMonth(),
        ])->count());

        $usersChange = $this->percentChange($newUsersThisMonth, $newUsersLastMonth);

        $platformStats = [
            ['key' => 'shops', 'label' => 'Total Tiendas', 'value' => $totalShops, 'change' => $shopsChange['text'], 'up' => $shopsChange['up'], 'icon' => 'store'],
            ['key' => 'products', 'label' => 'Total Productos', 'value' => $totalProducts, 'change' => $productsChange['text'], 'up' => $productsChange['up'], 'icon' => 'package'],
            ['key' => 'users', 'label' => 'Total Usuarios', 'value' => $totalUsers, 'change' => $usersChange['text'], 'up' => $usersChange['up'], 'icon' => 'users'],
            ['key' => 'categories', 'label' => 'Categorías', 'value' => $totalCategories, 'change' => null, 'up' => null, 'icon' => 'grid'],
        ];

        $salesByMonth = $this->salesChart(6);

        $topProducts = Product::with('shop:id,name')
            ->orderByDesc('views')
            ->orderByDesc('stock')
            ->limit(5)
            ->get(['id', 'name', 'shop_id', 'price', 'stock', 'views', 'status'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'shop' => $p->shop?->name ?? '—',
                'price' => (float) $p->price,
                'stock' => (int) $p->stock,
                'views' => (int) ($p->views ?? 0),
                'status' => $p->status,
            ]);

        $latestShops = Shop::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'status', 'is_verified', 'is_featured', 'created_at'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'status' => $s->status,
                'is_verified' => (bool) $s->is_verified,
                'is_featured' => (bool) $s->is_featured,
                'created_at' => $s->created_at?->toIso8601String(),
            ]);

        $latestUsers = User::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        $productStatusBreakdown = [
            ['status' => 'active', 'label' => 'Activos', 'value' => $activeProducts, 'color' => '#10B981'],
            ['status' => 'inactive', 'label' => 'Inactivos', 'value' => $inactiveProducts, 'color' => '#F59E0B'],
        ];

        return response()->json([
            'data' => [
                'platform_stats' => $platformStats,
                'sales_by_month' => $salesByMonth,
                'top_products' => $topProducts,
                'latest_shops' => $latestShops,
                'latest_users' => $latestUsers,
                'product_status_breakdown' => $productStatusBreakdown,
                'role_breakdown' => $roleBreakdown,
                'health' => [
                    'shops' => [
                        'total' => $totalShops,
                        'active' => $activeShops,
                        'pending' => $pendingShops,
                        'verified' => $verifiedShops,
                        'featured' => $featuredShops,
                    ],
                    'products' => [
                        'total' => $totalProducts,
                        'active' => $activeProducts,
                        'inactive' => $inactiveProducts,
                        'low_stock' => $lowStockProducts,
                        'total_units' => $totalStockUnits,
                        'inventory_value' => round($inventoryValue, 2),
                    ],
                    'users' => [
                        'total' => $totalUsers,
                        'verified' => $verifiedUsers,
                        'new_this_month' => $newUsersThisMonth,
                    ],
                    'homepage' => [
                        'banners_total' => $totalBanners,
                        'banners_active' => $activeBanners,
                        'sections_total' => $totalSections,
                        'sections_active' => $activeSections,
                    ],
                    'wallet' => [
                        'wallets_total' => $totalWallets,
                        'balance_total' => round($totalWalletBalance, 2),
                    ],
                ],
            ],
        ]);
    }

    private function salesChart(int $months): array
    {
        $labels = [];
        $shopSeries = [];
        $productSeries = [];
        $userSeries = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $start = now()->subMonths($i)->startOfMonth();
            $end = now()->subMonths($i)->endOfMonth();
            $labels[] = ucfirst($start->translatedFormat('M'));

            $shopSeries[] = Shop::whereBetween('created_at', [$start, $end])->count();
            $productSeries[] = Product::whereBetween('created_at', [$start, $end])->count();
            $userSeries[] = User::whereBetween('created_at', [$start, $end])->count();
        }

        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Tiendas', 'data' => $shopSeries, 'color' => '#3B82F6'],
                ['label' => 'Productos', 'data' => $productSeries, 'color' => '#10B981'],
                ['label' => 'Usuarios', 'data' => $userSeries, 'color' => '#A855F7'],
            ],
        ];
    }

    private function percentChange(int $current, int $previous): array
    {
        if ($current === 0 && $previous === 0) {
            return ['text' => 'Sin datos', 'up' => null];
        }
        if ($previous === 0) {
            return ['text' => '+' . $current . ' nuevos', 'up' => true];
        }
        if ($current === 0) {
            return ['text' => '0 este mes', 'up' => false];
        }
        $diff = (($current - $previous) / $previous) * 100;
        $rounded = round($diff, 1);
        return [
            'text' => ($rounded >= 0 ? '+' : '') . $rounded . '%',
            'up' => $diff >= 0,
        ];
    }
}
