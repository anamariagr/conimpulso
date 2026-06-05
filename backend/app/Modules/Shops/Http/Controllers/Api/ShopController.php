<?php

namespace App\Modules\Shops\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Shops\Models\Shop;
use App\Modules\Shops\Models\Category;
use App\Modules\Shops\Models\ShopReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Shop::with(['user', 'categories', 'tags'])
            ->active()
            ->withCount(['products', 'services']);

        // Filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('city')) {
            $query->byCity($request->city);
        }

        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->boolean('verified')) {
            $query->verified();
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('order', 'desc');
        $allowedSorts = ['name', 'created_at', 'views', 'followers'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->get('per_page', 20), 100);
        $shops = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $shops->items(),
            'meta' => [
                'current_page' => $shops->currentPage(),
                'last_page' => $shops->lastPage(),
                'per_page' => $shops->perPage(),
                'total' => $shops->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Shop::class);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'history' => ['nullable', 'string', 'max:10000'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
            'video' => ['nullable', 'string', 'max:500'],
            'gallery' => ['nullable', 'array'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'longitude' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'schedule' => ['nullable', 'array'],
            'social_media' => ['nullable', 'array'],
            'certifications' => ['nullable', 'array'],
            'payment_methods' => ['nullable', 'array'],
            'shipping_methods' => ['nullable', 'array'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shop = new Shop($validator->validated());
        $shop->user_id = $request->user()->id;
        $shop->status = 'pending';
        $shop->save();

        // Attach categories
        if ($request->has('category_ids')) {
            $shop->categories()->attach($request->category_ids);
        }

        // Create tags
        if ($request->has('tags')) {
            foreach ($request->tags as $tag) {
                $shop->tags()->create(['tag' => $tag]);
            }
        }

        $shop->load(['categories', 'tags', 'user']);

        return $this->successResponse($shop, 'Tienda creada exitosamente. Pendiente de aprobación.', 201);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $shop = Shop::where('slug', $slug)
            ->with(['user', 'categories', 'tags', 'reviews' => function ($q) {
                $q->visible()->latest()->take(10);
            }])
            ->withCount(['products', 'services'])
            ->firstOrFail();

        // Increment views
        $shop->increment('views');

        return response()->json([
            'success' => true,
            'data' => [
                'shop' => $shop,
                'rating' => $shop->average_rating,
                'total_sales' => $shop->total_sales,
                'is_owner' => $request->user() ? $shop->isOwnedBy($request->user()) : false,
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $shop = Shop::findOrFail($id);

        $this->authorize('update', $shop);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'history' => ['nullable', 'string', 'max:10000'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
            'video' => ['nullable', 'string', 'max:500'],
            'gallery' => ['nullable', 'array'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'longitude' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'schedule' => ['nullable', 'array'],
            'social_media' => ['nullable', 'array'],
            'certifications' => ['nullable', 'array'],
            'payment_methods' => ['nullable', 'array'],
            'shipping_methods' => ['nullable', 'array'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shop->fill($validator->validated());

        // Only update status if admin or if it's a re-submission
        if ($request->has('status') && $request->user()->hasRole(['super_admin', 'admin'])) {
            $shop->status = $request->status;
        }

        $shop->save();

        // Sync categories
        if ($request->has('category_ids')) {
            $shop->categories()->sync($request->category_ids);
        }

        // Update tags
        if ($request->has('tags')) {
            $shop->tags()->delete();
            foreach ($request->tags as $tag) {
                $shop->tags()->create(['tag' => $tag]);
            }
        }

        $shop->load(['categories', 'tags']);

        return $this->successResponse($shop, 'Tienda actualizada exitosamente');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $shop = Shop::findOrFail($id);

        $this->authorize('delete', $shop);

        $shop->delete();

        return $this->successResponse(null, 'Tienda eliminada exitosamente');
    }

    // Admin methods
    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Shop::class);

        $query = Shop::with(['user', 'categories'])
            ->withCount(['products', 'services']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');

        $perPage = min($request->get('per_page', 20), 100);
        $shops = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $shops->items(),
            'meta' => [
                'current_page' => $shops->currentPage(),
                'last_page' => $shops->lastPage(),
                'per_page' => $shops->perPage(),
                'total' => $shops->total(),
            ],
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $this->authorize('approve', Shop::class);

        $shop = Shop::findOrFail($id);
        $shop->status = 'active';
        $shop->save();

        return $this->successResponse($shop, 'Tienda aprobada exitosamente');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $this->authorize('reject', Shop::class);

        $validator = Validator::make($request->all(), [
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shop = Shop::findOrFail($id);
        $shop->status = 'rejected';
        $shop->rejection_reason = $request->reason;
        $shop->save();

        return $this->successResponse($shop, 'Tienda rechazada');
    }

    public function suspend(Request $request, int $id): JsonResponse
    {
        $this->authorize('suspend', Shop::class);

        $shop = Shop::findOrFail($id);
        $shop->status = 'suspended';
        $shop->save();

        return $this->successResponse($shop, 'Tienda suspendida');
    }

    public function toggleFeatured(int $id): JsonResponse
    {
        $this->authorize('toggleFeatured', Shop::class);

        $shop = Shop::findOrFail($id);
        $shop->is_featured = !$shop->is_featured;
        $shop->save();

        return $this->successResponse($shop, $shop->is_featured ? 'Tienda destacada' : 'Tienda ya no está destacada');
    }

    public function toggleVerified(int $id): JsonResponse
    {
        $this->authorize('toggleVerified', Shop::class);

        $shop = Shop::findOrFail($id);
        $shop->is_verified = !$shop->is_verified;
        $shop->save();

        return $this->successResponse($shop, $shop->is_verified ? 'Tienda verificada' : 'Verificación removida');
    }

    // Categories
    public function categories(): JsonResponse
    {
        $categories = Category::with(['children' => function ($q) {
            $q->active();
        }])
            ->root()
            ->active()
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function createReview(Request $request, int $shopId): JsonResponse
    {
        $shop = Shop::findOrFail($shopId);

        $validator = Validator::make($request->all(), [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'order_id' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        // Check if user already reviewed this shop for this order
        $existingReview = ShopReview::where('shop_id', $shopId)
            ->where('user_id', $request->user()->id)
            ->when($request->order_id, fn($q) => $q->where('order_id', $request->order_id))
            ->first();

        if ($existingReview) {
            return $this->errorResponse('Ya has dejado una reseña para esta tienda', 422);
        }

        $review = ShopReview::create([
            'shop_id' => $shopId,
            'user_id' => $request->user()->id,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_visible' => true,
        ]);

        return $this->successResponse($review, 'Reseña creada exitosamente', 201);
    }

    // Featured shops for homepage
    public function featured(): JsonResponse
    {
        $shops = Shop::active()
            ->featured()
            ->with(['user', 'categories'])
            ->withCount(['products', 'services'])
            ->take(12)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $shops,
        ]);
    }
}