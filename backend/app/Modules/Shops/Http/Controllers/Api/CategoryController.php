<?php

namespace App\Modules\Shops\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Shops\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with(['parent', 'children' => function ($q) {
            $q->active()->orderBy('order');
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

    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $query = Category::with(['parent', 'children', 'shops']);

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        $categories = $query->orderBy('order')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $category = Category::create($validator->validated());

        return $this->successResponse($category, 'Categoría creada', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $this->authorize('update', $category);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $category->update($validator->validated());

        return $this->successResponse($category, 'Categoría actualizada');
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $this->authorize('delete', $category);

        // Check if has children or products
        if ($category->children()->count() > 0) {
            return $this->errorResponse('No se puede eliminar. La categoría tiene subcategorías.', 422);
        }

        if ($category->products()->count() > 0 || $category->services()->count() > 0) {
            return $this->errorResponse('No se puede eliminar. La categoría tiene productos asociados.', 422);
        }

        $category->delete();

        return $this->successResponse(null, 'Categoría eliminada');
    }
}