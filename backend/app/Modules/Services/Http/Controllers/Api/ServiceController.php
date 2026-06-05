<?php

namespace App\Modules\Services\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceRequest;
use App\Modules\Services\Models\ServiceReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::with(['shop', 'categories'])->active();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        if ($request->has('category')) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $request->category));
        }

        $query->orderBy('created_at', 'desc');

        $perPage = min($request->get('per_page', 20), 100);
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $service = Service::where('slug', $slug)
            ->with(['shop', 'categories', 'reviews' => fn($q) => $q->visible()->latest()->take(5)])
            ->firstOrFail();

        $service->increment('views');

        return response()->json([
            'success' => true,
            'data' => [
                'service' => $service,
                'rating' => $service->average_rating,
                'is_owner' => $request->user() ? $service->shop->isOwnedBy($request->user()) : false,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Service::class);

        $validator = Validator::make($request->all(), [
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'portfolio' => ['nullable', 'array'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'price_type' => ['nullable', 'in:fixed,hourly,quote'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'duration_days' => ['nullable', 'integer'],
            'coverage_area' => ['nullable', 'string'],
            'attributes' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,active,inactive'],
            'allow_quotation' => ['nullable', 'boolean'],
            'allow_custom_request' => ['nullable', 'boolean'],
            'category_ids' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $categoryIds = $data['category_ids'] ?? [];
        unset($data['category_ids']);

        $service = new Service($data);
        $service->shop_id = $request->shop_id;
        $service->status = $data['status'] ?? 'draft';
        $service->save();

        if (!empty($categoryIds)) {
            $service->categories()->attach($categoryIds);
        }

        $service->load(['categories', 'shop']);

        return $this->successResponse($service, 'Servicio creado exitosamente', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->authorize('update', $service);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'portfolio' => ['nullable', 'array'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'price_type' => ['nullable', 'in:fixed,hourly,quote'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'duration_days' => ['nullable', 'integer'],
            'coverage_area' => ['nullable', 'string'],
            'attributes' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,active,inactive'],
            'allow_quotation' => ['nullable', 'boolean'],
            'allow_custom_request' => ['nullable', 'boolean'],
            'category_ids' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);

        $service->fill($data);
        $service->save();

        if ($categoryIds !== null) {
            $service->categories()->sync($categoryIds);
        }

        return $this->successResponse($service, 'Servicio actualizado exitosamente');
    }

    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $this->authorize('delete', $service);
        $service->delete();

        return $this->successResponse(null, 'Servicio eliminado exitosamente');
    }

    // Service Requests
    public function requestService(Request $request, int $serviceId): JsonResponse
    {
        $service = Service::findOrFail($serviceId);

        $validator = Validator::make($request->all(), [
            'client_name' => ['required', 'string', 'max:255'],
            'client_email' => ['required', 'email'],
            'client_phone' => ['nullable', 'string', 'max:20'],
            'description' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $request_data = $validator->validated();
        $request_data['user_id'] = $request->user()->id;
        $request_data['service_id'] = $serviceId;

        $serviceRequest = ServiceRequest::create($request_data);

        return $this->successResponse($serviceRequest, 'Solicitud enviada exitosamente', 201);
    }

    // Admin methods
    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Service::class);

        $query = Service::with(['shop', 'categories']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $query->orderBy('created_at', 'desc');
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }
}