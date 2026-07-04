<?php

namespace App\Modules\Blog\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Blog\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    // ── Public ──────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::published()->orderByDesc('published_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('excerpt', 'like', "%{$s}%");
            });
        }

        $perPage = min($request->get('per_page', 12), 50);
        $posts   = $query->paginate($perPage);

        // Fill missing cover_images from the related entity on-the-fly
        $items = collect($posts->items())->map(function ($post) {
            if (!$post->cover_image && $post->related_id) {
                if ($post->related_type === 'shop') {
                    $shop = \App\Modules\Shops\Models\Shop::select('logo')->find($post->related_id);
                    $post->cover_image = $shop?->logo;
                } elseif ($post->related_type === 'product') {
                    $product = \App\Modules\Products\Models\Product::select('images')->find($post->related_id);
                    $images = $product?->images;
                    $post->cover_image = is_array($images) ? ($images[0] ?? null) : null;
                }
            }
            return $post;
        })->values()->all();

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)->where('status', 'published')->firstOrFail();

        // Load related product/shop data for stock and extra info
        $related = null;
        if ($post->related_id && $post->related_type === 'product') {
            $related = \App\Modules\Products\Models\Product::with(['shop' => function ($q) {
                $q->select('id', 'name', 'slug', 'city', 'logo', 'gallery', 'status');
            }])
                ->select('id', 'name', 'price', 'stock', 'status', 'images', 'slug', 'shop_id')
                ->find($post->related_id);
        } elseif ($post->related_id && $post->related_type === 'shop') {
            $related = \App\Modules\Shops\Models\Shop::with('user')
                ->select('id', 'name', 'slug', 'city', 'logo', 'gallery', 'description', 'status')
                ->find($post->related_id);
        }

        return response()->json([
            'success' => true,
            'data'    => $post,
            'related' => $related,
        ]);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public function adminIndex(Request $request): JsonResponse
    {
        $query = BlogPost::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $posts = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $posts->items(),
            'meta'    => ['current_page' => $posts->currentPage(), 'last_page' => $posts->lastPage(), 'total' => $posts->total()],
        ]);
    }

    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title'   => ['sometimes', 'string', 'max:255'],
            'excerpt' => ['sometimes', 'nullable', 'string'],
            'content' => ['sometimes', 'string'],
            'status'  => ['sometimes', 'in:published,draft,archived'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $post->fill($request->only(['title', 'excerpt', 'content', 'status']));
        if ($request->has('status') && $request->status === 'published' && !$post->published_at) {
            $post->published_at = now();
        }
        $post->save();

        return $this->successResponse($post, 'Post actualizado');
    }

    public function adminCreate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'status'  => ['sometimes', 'in:published,draft'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $post = BlogPost::create([
            'title'        => $request->title,
            'slug'         => BlogPost::generateUniqueSlug($request->title),
            'excerpt'      => $request->excerpt,
            'content'      => $request->content,
            'type'         => 'article',
            'status'       => $request->get('status', 'draft'),
            'published_at' => $request->get('status') === 'published' ? now() : null,
        ]);

        return $this->successResponse($post, 'Post creado', 201);
    }

    public function adminDelete(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'archived']);
        return $this->successResponse(null, 'Post archivado');
    }
}
