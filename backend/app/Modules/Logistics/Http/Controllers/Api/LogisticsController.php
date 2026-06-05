<?php

namespace App\Modules\Logistics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Logistics\Models\ShippingQuote;
use App\Modules\Logistics\Models\Shipment;
use App\Modules\Logistics\Models\TrackingEvent;
use App\Modules\Logistics\Models\PickupRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LogisticsController extends Controller
{
    public function getQuote(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'origin_city' => ['required', 'string', 'max:100'],
            'origin_department' => ['required', 'string', 'max:100'],
            'destination_city' => ['required', 'string', 'max:100'],
            'destination_department' => ['required', 'string', 'max:100'],
            'weight' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'dimensions' => ['nullable', 'array'],
            'declared_value' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        // Calculate mock quotes from different carriers
        $weight = (float) $request->weight;
        $declaredValue = (float) ($request->declared_value ?? 0);

        $quotes = [];

        // Standard carriers (mock calculation)
        $baseRate = 5 + ($weight * 2);

        $quotes[] = [
            'carrier' => 'Servientrega',
            'service_type' => 'Estándar',
            'price' => round($baseRate * 1.2, 2),
            'delivery_days' => rand(3, 5),
        ];

        $quotes[] = [
            'carrier' => 'Interrapidisimo',
            'service_type' => 'Express',
            'price' => round($baseRate * 1.8, 2),
            'delivery_days' => rand(1, 2),
        ];

        $quotes[] = [
            'carrier' => 'Coordinadora',
            'service_type' => 'Economy',
            'price' => round($baseRate * 0.9, 2),
            'delivery_days' => rand(5, 7),
        ];

        // Save quotes to database
        foreach ($quotes as $quote) {
            ShippingQuote::create([
                'user_id' => $request->user()->id,
                'origin_city' => $request->origin_city,
                'origin_department' => $request->origin_department,
                'destination_city' => $request->destination_city,
                'destination_department' => $request->destination_department,
                'weight' => $weight,
                'dimensions' => $request->dimensions,
                'declared_value' => $declaredValue,
                'carrier' => $quote['carrier'],
                'service_type' => $quote['service_type'],
                'price' => $quote['price'],
                'delivery_days' => $quote['delivery_days'],
                'valid_until' => now()->addHours(24),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $quotes,
        ]);
    }

    public function myShipments(Request $request): JsonResponse
    {
        $query = Shipment::with('events')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $shipments = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $shipments->items(),
            'meta' => [
                'current_page' => $shipments->currentPage(),
                'last_page' => $shipments->lastPage(),
                'per_page' => $shipments->perPage(),
                'total' => $shipments->total(),
            ],
        ]);
    }

    public function createShipment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'carrier' => ['required', 'string', 'max:100'],
            'service_type' => ['nullable', 'string', 'max:50'],
            'origin_address' => ['required', 'array'],
            'destination_address' => ['required', 'array'],
            'sender_name' => ['required', 'string', 'max:255'],
            'receiver_name' => ['required', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0.1'],
            'dimensions' => ['nullable', 'array'],
            'declared_value' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shipment = Shipment::create([
            'user_id' => $request->user()->id,
            'tracking_number' => 'TRK' . strtoupper(Str::random(10)),
            'carrier' => $request->carrier,
            'service_type' => $request->service_type,
            'origin_address' => $request->origin_address,
            'destination_address' => $request->destination_address,
            'sender_name' => $request->sender_name,
            'receiver_name' => $request->receiver_name,
            'weight' => $request->weight ?? 1,
            'dimensions' => $request->dimensions,
            'declared_value' => $request->declared_value,
            'shipping_cost' => $request->shipping_cost,
            'status' => 'created',
            'estimated_delivery' => now()->addDays(rand(2, 7)),
        ]);

        // Add initial tracking event
        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status' => 'created',
            'description' => 'Envío creado. Esperando recolección.',
            'location' => $request->origin_address['city'] ?? 'Origen',
            'event_timestamp' => now(),
        ]);

        return $this->successResponse($shipment, 'Envío creado', 201);
    }

    public function trackShipment(string $trackingNumber): JsonResponse
    {
        $shipment = Shipment::with('events')
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$shipment) {
            return $this->errorResponse('Shipment not found', 404);
        }

        return response()->json([
            'success' => true,
            'data' => $shipment,
        ]);
    }

    public function updateShipmentStatus(Request $request, int $id): JsonResponse
    {
        $shipment = Shipment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:created,picked_up,in_transit,out_for_delivery,delivered,returned,cancelled'],
            'description' => ['required', 'string', 'max:500'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shipment->update(['status' => $request->status]);

        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status' => $request->status,
            'description' => $request->description,
            'location' => $request->location,
            'event_timestamp' => now(),
        ]);

        if ($request->status === 'delivered') {
            $shipment->update(['delivered_at' => now()]);
        }

        return $this->successResponse($shipment, 'Estado actualizado');
    }

    // Pickup Requests
    public function createPickupRequest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scheduled_date' => ['required', 'date', 'after:today'],
            'address' => ['required', 'array'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $pickup = PickupRequest::create([
            'user_id' => $request->user()->id,
            'scheduled_date' => $request->scheduled_date,
            'address' => $request->address,
            'contact_name' => $request->contact_name,
            'contact_phone' => $request->contact_phone,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return $this->successResponse($pickup, 'Solicitud de recogida creada', 201);
    }

    public function myPickupRequests(Request $request): JsonResponse
    {
        $requests = PickupRequest::with('shipment')
            ->where('user_id', $request->user()->id)
            ->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
        ]);
    }

    // Admin: All shipments
    public function adminShipments(Request $request): JsonResponse
    {
        $query = Shipment::with(['user', 'shop', 'events'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('carrier')) {
            $query->where('carrier', $request->carrier);
        }

        $shipments = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $shipments->items(),
        ]);
    }

    public function adminPendingPickups(): JsonResponse
    {
        $pickups = PickupRequest::with(['user', 'shop'])
            ->whereIn('status', ['pending', 'scheduled'])
            ->orderBy('scheduled_date', 'asc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $pickups->items(),
        ]);
    }

    public function assignPickup(Request $request, int $id): JsonResponse
    {
        $pickup = PickupRequest::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'action' => ['required', 'in:schedule,cancel'],
            'scheduled_date' => ['required_if:action,schedule', 'date', 'after:today'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        if ($request->action === 'schedule') {
            $pickup->update([
                'status' => 'scheduled',
                'scheduled_date' => $request->scheduled_date,
            ]);
            return $this->successResponse($pickup, 'Recogida programada');
        } else {
            $pickup->update(['status' => 'cancelled']);
            return $this->successResponse($pickup, 'Recogida cancelada');
        }
    }
}