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
        $notesEnabled = (bool) $product->shop->manufacturing_notes_enabled;

        if ($notesEnabled) {
            $product->makeVisible('manufacturing_notes');
        }

        return $this->successResponse([
            'supplies_total' => $product->total_supplies_cost,
            'time_total' => $product->total_time_cost,
            'total_cost' => $product->total_cost,
            'profit_margin' => (float) $product->profit_margin,
            'suggested_price' => $product->suggested_price,
            'current_price' => (float) $product->price,
            'manufacturing_notes_enabled' => $notesEnabled,
            'manufacturing_notes' => $notesEnabled ? $product->manufacturing_notes : null,
        ]);
    }

    // Vendor: free-text notes on how the product is made. Only usable when the
    // shop has this enabled — an admin-only toggle (see ShopController::toggleManufacturingNotes).
    public function manufacturingNotesUpdate(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        if (!$product->shop->manufacturing_notes_enabled) {
            return $this->errorResponse('Tu tienda no tiene habilitada esta sección. Pídele a un administrador que la active.', 403);
        }

        $validator = Validator::make($request->all(), [
            'manufacturing_notes' => ['nullable', 'string', 'max:20000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $product->manufacturing_notes = $request->input('manufacturing_notes');
        $product->save();
        $product->makeVisible('manufacturing_notes');

        return $this->successResponse([
            'manufacturing_notes' => $product->manufacturing_notes,
        ], 'Notas guardadas');
    }

    // Vendor: units sold and revenue per month, based on real orders (not the
    // unused Product::sales_count counter). "Vendido" = order reached at least
    // 'confirmed' status — pending/failed/cancelled orders don't count.
    public function salesSummary(Request $request, int $productId): JsonResponse
    {
        $product = $this->findOwnedProduct($request, $productId);

        $soldStatuses = ['confirmed', 'ordered_producer', 'shipped', 'delivered'];

        $rows = \App\Modules\Products\Models\ProductOrder::where('product_id', $product->id)
            ->whereIn('status', $soldStatuses)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(quantity) as units, SUM(total_amount) as revenue")
            ->groupBy('month')
            ->orderByDesc('month')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'units' => (int) $row->units,
                'revenue' => (float) $row->revenue,
            ]);

        $currentMonth = now()->format('Y-m');
        $current = $rows->firstWhere('month', $currentMonth) ?? ['month' => $currentMonth, 'units' => 0, 'revenue' => 0.0];

        return $this->successResponse([
            'current_month' => $current,
            'history' => $rows->values(),
        ]);
    }
}
