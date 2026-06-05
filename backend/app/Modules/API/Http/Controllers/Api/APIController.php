<?php

namespace App\Modules\API\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\API\Models\ApiKey;
use App\Modules\API\Models\ApiLog;
use App\Modules\API\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class APIController extends Controller
{
    public function info(): JsonResponse
    {
        return response()->json([
            'name' => 'NexusLab API',
            'version' => 'v1',
            'status' => 'active',
            'endpoints' => [
                'products' => '/api/v1/products',
                'shops' => '/api/v1/shops',
                'categories' => '/api/v1/categories',
            ],
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $query = \App\Modules\Products\Models\Product::with('shop')
            ->where('status', 'active');

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
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

    public function productDetail(int $id): JsonResponse
    {
        $product = \App\Modules\Products\Models\Product::with('shop', 'variants')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function shops(Request $request): JsonResponse
    {
        $query = \App\Modules\Shops\Models\Shop::with('user')
            ->where('status', 'approved');

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $perPage = min($request->get('per_page', 20), 100);
        $shops = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $shops->items(),
        ]);
    }

    public function shopDetail(string $slug): JsonResponse
    {
        $shop = \App\Modules\Shops\Models\Shop::with('user')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $shop,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = \App\Modules\Shops\Models\Category::with('parent')
            ->whereNull('parent_id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('shop');

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    // API Keys Management
    public function myApiKeys(Request $request): JsonResponse
    {
        $keys = ApiKey::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $keys,
        ]);
    }

    public function createApiKey(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'rate_limit' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $apiKey = ApiKey::generate(
            $request->name,
            $request->permissions ?? [],
            $request->rate_limit ?? 100
        );

        if ($request->expires_at) {
            $apiKey->expires_at = $request->expires_at;
            $apiKey->save();
        }

        return $this->successResponse($apiKey, 'API Key created', 201);
    }

    public function deleteApiKey(Request $request, int $id): JsonResponse
    {
        $key = ApiKey::where('user_id', $request->user()->id)->findOrFail($id);
        $key->delete();

        return $this->successResponse(null, 'API Key deleted');
    }

    public function apiKeyStats(int $id): JsonResponse
    {
        $key = ApiKey::findOrFail($id);

        $stats = ApiLog::where('api_key_id', $id)
            ->selectRaw('COUNT(*) as total_requests, AVG(response_time) as avg_response_time')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total_requests' => $stats->total_requests ?? 0,
                'avg_response_time' => round($stats->avg_response_time ?? 0, 2),
                'last_used' => $key->last_used_at,
            ],
        ]);
    }

    // Webhooks Management
    public function myWebhooks(Request $request): JsonResponse
    {
        $webhooks = Webhook::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $webhooks,
        ]);
    }

    public function registerWebhook(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'events' => ['required', 'array'],
            'headers' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $webhook = Webhook::register(
            $request->name,
            $request->url,
            $request->events,
            $request->headers ?? []
        );

        return $this->successResponse($webhook, 'Webhook registered', 201);
    }

    public function deleteWebhook(Request $request, int $id): JsonResponse
    {
        $webhook = Webhook::where('user_id', $request->user()->id)->findOrFail($id);
        $webhook->delete();

        return $this->successResponse(null, 'Webhook deleted');
    }

    public function testWebhook(int $id): JsonResponse
    {
        $webhook = Webhook::findOrFail($id);

        // Fire a test event
        $webhook->fire('test', ['message' => 'This is a test webhook delivery']);

        return $this->successResponse(null, 'Test webhook fired');
    }
}