<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductVariant;
use App\Modules\Products\Models\ProductReview;
use App\Modules\Blog\Services\BlogPostGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['shop', 'categories', 'variants'])
            ->active()
            ->withCount(['reviews']);

        // Filters
        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('min_price') || $request->has('max_price')) {
            $min = $request->get('min_price', 0);
            $max = $request->get('max_price', PHP_FLOAT_MAX);
            $query->byPriceRange($min, $max);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Location filter
        if ($request->has('city')) {
            $query->whereHas('shop', function ($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%');
            });
        }

        if ($request->has('region')) {
            $query->whereHas('shop', function ($q) use ($request) {
                $q->where('region', $request->region);
            });
        }

        // Vendor type filter
        if ($request->has('vendor_type')) {
            $query->whereHas('shop', function ($q) use ($request) {
                $q->where('vendor_type', $request->vendor_type);
            });
        }

        // Verified sellers only
        if ($request->boolean('verified_only')) {
            $query->whereHas('shop', function ($q) {
                $q->where('is_verified', true);
            });
        }

        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'popular':
                    $query->orderBy('sales_count', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'rating':
                    $query->orderByRaw('rating_sum / NULLIF(rating_count, 0) DESC');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min($request->get('per_page', 20), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $validator = Validator::make($request->all(), [
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['string', 'max:500'],
            'videos' => ['nullable', 'array'],
            'videos.*' => ['string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_wholesale' => ['nullable', 'numeric', 'min:0'],
            'minimum_quantity' => ['nullable', 'integer', 'min:1'],
            'minimum_wholesale_quantity' => ['nullable', 'integer', 'min:1'],
            'volume_discounts' => ['nullable', 'array'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'inactive', 'out_of_stock'])],
            'fabrication_time' => ['nullable', 'integer'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'dimensions' => ['nullable', 'array'],
            'attributes' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_featured' => ['nullable', 'boolean'],
            'allow_quotation' => ['nullable', 'boolean'],
            'allow_custom_order' => ['nullable', 'boolean'],
            'story' => ['required', 'array'],
            'story.materials' => ['required', 'string', 'max:200'],
            'story.process' => ['required', 'string', 'max:100'],
            'story.time' => ['required', 'string', 'max:50'],
            'story.ideal_for' => ['required', 'string', 'max:200'],
            'story.unique' => ['required', 'string', 'max:300'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required_with:variants', 'string'],
            'variants.*.sku' => ['nullable', 'string'],
            'variants.*.price_modifier' => ['nullable', 'numeric'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.attributes' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $categoryIds = $data['category_ids'] ?? [];
        $variants    = $data['variants'] ?? [];
        $story       = $data['story'] ?? [];
        unset($data['category_ids'], $data['variants'], $data['story']);

        $product = new Product($data);
        $product->shop_id = $request->shop_id;
        $product->status  = $data['status'] ?? 'draft';
        $product->story   = $story;
        $product->save();

        // Attach categories
        if (!empty($categoryIds)) {
            $product->categories()->attach($categoryIds);
        }

        // Create variants
        foreach ($variants as $variantData) {
            $product->variants()->create($variantData);
        }

        $product->load(['categories', 'variants', 'shop']);

        // Auto-generate blog post
        try {
            $coverImage = !empty($product->images) ? $product->images[0] : null;
            (new BlogPostGeneratorService())->generateForProduct([
                'id'          => $product->id,
                'name'        => $product->name,
                'price'       => $product->price,
                'stock'       => $product->stock,
                'city'        => $product->shop?->city,
                'cover_image' => $coverImage,
            ], $story);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Blog post generation failed for product', ['id' => $product->id, 'error' => $e->getMessage()]);
        }

        return $this->successResponse($product, 'Producto creado exitosamente', 201);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->with([
                'shop',
                'categories',
                'variants' => fn($q) => $q->where('is_active', true),
                'reviews' => fn($q) => $q->visible()->latest()->take(10),
            ])
            ->withCount(['reviews'])
            ->firstOrFail();

        $product->increment('views');

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'rating' => $product->average_rating,
                'is_owner' => ($user = Auth::guard('sanctum')->user()) && $product->shop
                    ? (int)$product->shop->user_id === (int)$user->id
                    : false,
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $this->authorize('update', $product);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'images' => ['nullable', 'array', 'max:10'],
            'videos' => ['nullable', 'array'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'price_wholesale' => ['nullable', 'numeric', 'min:0'],
            'minimum_quantity' => ['nullable', 'integer', 'min:1'],
            'minimum_wholesale_quantity' => ['nullable', 'integer', 'min:1'],
            'volume_discounts' => ['nullable', 'array'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku,' . $id],
            'status' => ['nullable', Rule::in(['draft', 'active', 'inactive', 'out_of_stock'])],
            'fabrication_time' => ['nullable', 'integer'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'dimensions' => ['nullable', 'array'],
            'attributes' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'is_featured' => ['nullable', 'boolean'],
            'allow_quotation' => ['nullable', 'boolean'],
            'allow_custom_order' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);

        $product->fill($data);
        $product->save();

        if ($categoryIds !== null) {
            $product->categories()->sync($categoryIds);
        }

        $product->load(['categories', 'variants', 'shop']);

        return $this->successResponse($product, 'Producto actualizado exitosamente');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $this->authorize('delete', $product);

        $product->delete();

        return $this->successResponse(null, 'Producto eliminado exitosamente');
    }

    public function myProducts(Request $request): JsonResponse
    {
        $shop = \App\Modules\Shops\Models\Shop::where('user_id', $request->user()->id)->first();

        if (!$shop) {
            return response()->json(['success' => true, 'data' => [], 'meta' => ['total' => 0]]);
        }

        $query = Product::where('shop_id', $shop->id)
            ->orderBy('created_at', 'desc');

        $perPage = min($request->get('per_page', 50), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    // Admin methods
    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::with(['shop', 'categories']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');

        $perPage = min($request->get('per_page', 20), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function toggleFeatured(int $id): JsonResponse
    {
        $this->authorize('toggleFeatured', Product::class);

        $product = Product::findOrFail($id);
        $product->is_featured = !$product->is_featured;
        $product->save();

        return $this->successResponse($product, $product->is_featured ? 'Producto destacado' : 'Producto ya no está destacado');
    }

    // Variants
    public function addVariant(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $this->authorize('update', $product);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'unique:product_variants,sku'],
            'price_modifier' => ['nullable', 'numeric'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'attributes' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $variant = $product->variants()->create($validator->validated());

        return $this->successResponse($variant, 'Variante agregada', 201);
    }

    public function updateVariant(Request $request, int $productId, int $variantId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $this->authorize('update', $product);

        $variant = $product->variants()->findOrFail($variantId);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'unique:product_variants,sku,' . $variantId],
            'price_modifier' => ['nullable', 'numeric'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'attributes' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $variant->update($validator->validated());

        return $this->successResponse($variant, 'Variante actualizada');
    }

    public function deleteVariant(int $productId, int $variantId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $this->authorize('update', $product);

        $variant = $product->variants()->findOrFail($variantId);
        $variant->delete();

        return $this->successResponse(null, 'Variante eliminada');
    }

    // Reviews
    public function createReview(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $validator = Validator::make($request->all(), [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'order_id' => ['nullable', 'integer'],
            'images' => ['nullable', 'array', 'max:5'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        // Check if user already reviewed
        $existingReview = ProductReview::where('product_id', $productId)
            ->where('user_id', $request->user()->id)
            ->when($request->order_id, fn($q) => $q->where('order_id', $request->order_id))
            ->first();

        if ($existingReview) {
            return $this->errorResponse('Ya has dejado una reseña para este producto', 422);
        }

        $review = ProductReview::create([
            'product_id' => $productId,
            'user_id' => $request->user()->id,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'images' => $request->images,
            'is_visible' => true,
        ]);

        // Update product rating
        $product->rating_sum += $request->rating;
        $product->rating_count += 1;
        $product->save();

        return $this->successResponse($review, 'Reseña creada exitosamente', 201);
    }

    // Featured products
    public function featured(): JsonResponse
    {
        $products = Product::active()
            ->featured()
            ->with(['shop', 'categories'])
            ->withCount(['reviews'])
            ->take(12)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }
}