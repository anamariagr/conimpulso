<?php

namespace App\Modules\Logistics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Logistics\Services\LogisticsAdditionalServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogisticsAdditionalController extends Controller
{
    public function __construct(
        private LogisticsAdditionalServices $services
    ) {}

    public function getServices(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->services->getAvailableServices(),
        ]);
    }

    public function calculateInsurance(Request $request): JsonResponse
    {
        $declaredValue = (float) $request->declared_value;

        if ($declaredValue <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Declared value must be greater than 0',
            ], 422);
        }

        $premium = $this->services->calculateShippingInsurance($declaredValue);

        return response()->json([
            'success' => true,
            'data' => [
                'declared_value' => $declaredValue,
                'premium' => $premium,
                'premium_rate' => 0.02,
            ],
        ]);
    }

    public function calculatePackaging(Request $request): JsonResponse
    {
        $type = $request->type;

        $packaging = $this->services->calculateSpecialPackaging($type);

        if (!$packaging) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid packaging type',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $packaging,
        ]);
    }

    public function calculateSecurityBag(Request $request): JsonResponse
    {
        $declaredValue = (float) $request->declared_value;

        if ($declaredValue <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Declared value must be greater than 0',
            ], 422);
        }

        $price = $this->services->calculateSecurityBag($declaredValue);

        return response()->json([
            'success' => true,
            'data' => [
                'declared_value' => $declaredValue,
                'price' => $price,
            ],
        ]);
    }

    public function sendNotification(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:500',
            'type' => 'nullable|in:shipment_created,shipment_in_transit,delivered,pickup_scheduled',
        ]);

        $result = $this->services->sendWhatsAppNotification(
            $request->phone,
            $request->message
        );

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => [
                'phone' => $result['phone'] ?? null,
                'timestamp' => $result['timestamp'] ?? null,
            ],
        ]);
    }
}