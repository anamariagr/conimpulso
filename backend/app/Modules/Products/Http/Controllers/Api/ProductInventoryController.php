<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductInventoryController extends Controller
{
    private function findOwnedProduct(Request $request, int $productId): Product
    {
        return Product::whereHas('shop', fn($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($productId);
    }

    public function suppliesIndex(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        $supplies = $product->supplies()->orderBy('id')->get();

        return $this->successResponse($supplies);
    }

    public function suppliesStore(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'time_entry_id' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();

        if (!empty($data['time_entry_id'])) {
            $product->timeEntries()->findOrFail($data['time_entry_id']);
        }

        $supply = $product->supplies()->create($data);

        return $this->successResponse($supply, 'Suministro agregado', 201);
    }

    public function suppliesUpdate(Request $request, int $productId, int $supplyId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);
        $supply = $product->supplies()->findOrFail($supplyId);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'quantity' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string'],
            'unit_cost' => ['sometimes', 'required', 'numeric', 'min:0'],
            'time_entry_id' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();

        if (!empty($data['time_entry_id'])) {
            $product->timeEntries()->findOrFail($data['time_entry_id']);
        }

        $supply->update($data);

        return $this->successResponse($supply, 'Suministro actualizado');
    }

    public function suppliesDestroy(Request $request, int $productId, int $supplyId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);
        $supply = $product->supplies()->findOrFail($supplyId);

        $supply->delete();

        return $this->successResponse(null, 'Suministro eliminado');
    }

    public function timeEntriesIndex(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        $entries = $product->timeEntries()->orderBy('id')->get();

        return $this->successResponse($entries);
    }

    public function timeEntriesStore(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        $validator = Validator::make($request->all(), [
            'description' => ['required', 'string', 'max:255'],
            'minutes' => ['required', 'integer', 'min:1'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $entry = $product->timeEntries()->create($validator->validated());

        return $this->successResponse($entry, 'Entrada de tiempo agregada', 201);
    }

    public function timeEntriesUpdate(Request $request, int $productId, int $entryId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);
        $entry = $product->timeEntries()->findOrFail($entryId);

        $validator = Validator::make($request->all(), [
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'minutes' => ['sometimes', 'required', 'integer', 'min:1'],
            'hourly_rate' => ['sometimes', 'required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $entry->update($validator->validated());

        return $this->successResponse($entry, 'Entrada de tiempo actualizada');
    }

    public function timeEntriesDestroy(Request $request, int $productId, int $entryId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);
        $entry = $product->timeEntries()->findOrFail($entryId);

        $entry->delete();

        return $this->successResponse(null, 'Entrada de tiempo eliminada');
    }

    public function costSummary(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        return $this->successResponse([
            'supplies_total' => $product->total_supplies_cost,
            'time_total' => $product->total_time_cost,
            'total_cost' => $product->total_cost,
            'profit_margin' => (float) $product->profit_margin,
            'suggested_price' => $product->suggested_price,
            'current_price' => (float) $product->price,
        ]);
    }
}
