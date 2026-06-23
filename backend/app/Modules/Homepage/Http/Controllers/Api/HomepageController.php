<?php

namespace App\Modules\Homepage\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Homepage\Models\HomepageBanner;
use App\Modules\Homepage\Models\HomepageSection;
use App\Modules\Homepage\Models\HomepageLayout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class HomepageController extends Controller
{
    // ==================== BANNERS ====================

    public function banners(): JsonResponse
    {
        $banners = HomepageBanner::orderBy('position')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    public function activeBanners(): JsonResponse
    {
        $banners = HomepageBanner::active()
            ->orderBy('position')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    public function createBanner(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'media_type' => 'required|in:image,video,gif',
            'media_url' => 'nullable|string|max:2048',
            'position' => 'required|in:hero,floating_left,floating_right,sidebar,between_sections,popup',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $banner = HomepageBanner::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'media_type' => $request->media_type,
            'media_url' => $request->media_url,
            'mobile_media_url' => $request->mobile_media_url,
            'link_url' => $request->link_url,
            'link_text' => $request->link_text,
            'position' => $request->position,
            'is_active' => $request->is_active ?? false,
            'starts_at' => $request->starts_at,
            'expires_at' => $request->expires_at,
            'order' => $request->order ?? 0,
            'target_audience' => $request->target_audience ?? 'all',
        ]);

        return response()->json([
            'success' => true,
            'data' => $banner,
            'message' => 'Banner created successfully',
        ], 201);
    }

    public function updateBanner(Request $request, int $id): JsonResponse
    {
        $banner = HomepageBanner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title'               => 'nullable|string|max:255',
            'subtitle'            => 'nullable|string|max:255',
            'media_type'          => 'nullable|in:image,video,gif',
            'position'            => 'nullable|in:hero,floating_left,floating_right,sidebar,between_sections,popup',
            'vendor_title'        => 'nullable|string|max:255',
            'vendor_description'  => 'nullable|string',
            'buyer_title'         => 'nullable|string|max:255',
            'buyer_description'   => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $banner->update($request->only([
            'title', 'subtitle', 'media_type', 'media_url', 'mobile_media_url',
            'link_url', 'link_text', 'position', 'is_active', 'starts_at',
            'expires_at', 'order', 'target_audience',
            'vendor_title', 'vendor_description', 'buyer_title', 'buyer_description',
        ]));

        return response()->json([
            'success' => true,
            'data' => $banner->fresh(),
            'message' => 'Banner updated successfully',
        ]);
    }

    public function deleteBanner(int $id): JsonResponse
    {
        $banner = HomepageBanner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully',
        ]);
    }

    // ==================== SECTIONS ====================

    public function sections(): JsonResponse
    {
        $sections = HomepageSection::orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    public function activeSections(): JsonResponse
    {
        $sections = HomepageSection::active()->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    public function createSection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:hero,featured_products,categories,stores,slider,cards_grid,banner,testimonials,newsletter,custom_html',
            'title' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $section = HomepageSection::create([
            'key' => Str::slug($request->name),
            'name' => $request->name,
            'type' => $request->type,
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'configuration' => $request->configuration ?? [],
            'items' => $request->items ?? [],
            'layout' => $request->layout ?? 'grid',
            'columns' => $request->columns ?? 4,
            'is_active' => $request->is_active ?? false,
            'order' => $request->order ?? 0,
            'background_color' => $request->background_color ?? '#ffffff',
            'padding_top' => $request->padding_top ?? 16,
            'padding_bottom' => $request->padding_bottom ?? 16,
        ]);

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section created successfully',
        ], 201);
    }

    public function updateSection(Request $request, int $id): JsonResponse
    {
        $section = HomepageSection::findOrFail($id);

        $section->update($request->only([
            'name', 'type', 'title', 'subtitle', 'configuration',
            'items', 'layout', 'columns', 'is_active', 'order',
            'background_color', 'padding_top', 'padding_bottom',
        ]));

        return response()->json([
            'success' => true,
            'data' => $section->fresh(),
            'message' => 'Section updated successfully',
        ]);
    }

    public function reorderSections(Request $request): JsonResponse
    {
        $order = $request->input('order', []);

        foreach ($order as $index => $sectionId) {
            HomepageSection::where('id', $sectionId)->update(['order' => $index]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sections reordered successfully',
        ]);
    }

    public function deleteSection(int $id): JsonResponse
    {
        $section = HomepageSection::findOrFail($id);
        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully',
        ]);
    }

    // ==================== LAYOUT ====================

    public function layout(): JsonResponse
    {
        $layouts = HomepageLayout::all();

        return response()->json([
            'success' => true,
            'data' => $layouts,
        ]);
    }

    public function activeLayout(): JsonResponse
    {
        $layout = HomepageLayout::getDefaultLayout();

        // Fetch real data for sections
        $featuredProducts = \App\Modules\Products\Models\Product::featured()
            ->active()
            ->with('shop:id,name,logo')
            ->limit(8)
            ->get(['id', 'name', 'slug', 'images', 'price', 'price_wholesale', 'shop_id', 'rating_count', 'sales_count', 'is_featured']);

        $categories = \App\Modules\Shops\Models\Category::active()
            ->root()
            ->orderBy('order')
            ->limit(12)
            ->get(['id', 'name', 'slug', 'icon']);

        $featuredShops = \App\Modules\Shops\Models\Shop::featured()
            ->active()
            ->verified()
            ->limit(6)
            ->get(['id', 'name', 'slug', 'logo', 'city', 'address', 'is_verified']);

        $promotions = [];
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('shop_promotions')) {
                $promotions = \App\Modules\Shops\Models\ShopPromotion::active()
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->with('shop:id,name,logo')
                    ->limit(5)
                    ->get(['id', 'shop_id', 'title', 'description', 'discount_type', 'discount_value', 'code', 'start_date', 'end_date']);
            }
        } catch (\Exception $e) {
            $promotions = [];
        }

        if (!$layout) {
            return response()->json([
                'success' => true,
                'data' => [
                    'sections' => HomepageSection::active()->get(),
                    'banners' => HomepageBanner::active()->get(),
                    'featured_products' => $featuredProducts,
                    'categories' => $categories,
                    'featured_shops' => $featuredShops,
                    'promotions' => $promotions,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'layout' => $layout,
                'sections' => HomepageSection::active()->get(),
                'banners' => HomepageBanner::active()->get(),
                'featured_products' => $featuredProducts,
                'categories' => $categories,
                'featured_shops' => $featuredShops,
                'promotions' => $promotions,
            ],
        ]);
    }

    public function updateLayout(Request $request): JsonResponse
    {
        $layout = HomepageLayout::firstOrCreate(
            ['is_default' => true],
            ['name' => 'Default Layout']
        );

        $layout->update($request->only(['settings', 'header_config', 'footer_config']));

        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Layout updated successfully',
        ]);
    }

    public function updateLayoutSections(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sections_order' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $layout = HomepageLayout::firstOrCreate(
            ['is_default' => true],
            ['name' => 'Default Layout']
        );

        $layout->update(['sections_order' => $request->sections_order]);

        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Layout sections updated successfully',
        ]);
    }

    // ==================== AVAILABLE TYPES ====================

    public function availableTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'banner_types' => [
                    ['value' => 'hero', 'label' => 'Hero Banner (Principal)'],
                    ['value' => 'sidebar', 'label' => 'Banner Lateral'],
                    ['value' => 'between_sections', 'label' => 'Banner entre Secciones'],
                    ['value' => 'popup', 'label' => 'Popup / Modal'],
                ],
                'section_types' => [
                    ['value' => 'hero', 'label' => 'Hero con Slider'],
                    ['value' => 'featured_products', 'label' => 'Productos Destacados'],
                    ['value' => 'categories', 'label' => 'Categorías'],
                    ['value' => 'stores', 'label' => 'Tiendas Destacadas'],
                    ['value' => 'slider', 'label' => 'Slider de Contenido'],
                    ['value' => 'cards_grid', 'label' => 'Grid de Cards'],
                    ['value' => 'banner', 'label' => 'Banner Promocional'],
                    ['value' => 'testimonials', 'label' => 'Testimonios'],
                    ['value' => 'newsletter', 'label' => 'Newsletter / Suscripción'],
                    ['value' => 'custom_html', 'label' => 'HTML Personalizado'],
                ],
                'layouts' => [
                    ['value' => 'grid', 'label' => 'Cuadrícula'],
                    ['value' => 'slider', 'label' => 'Slider/Carousel'],
                    ['value' => 'list', 'label' => 'Lista Vertical'],
                    ['value' => 'masonry', 'label' => 'Masonry'],
                ],
            ],
        ]);
    }
}