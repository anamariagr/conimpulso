<?php

namespace App\Modules\Logistics\Services;

use App\Models\User;

class LogisticsAdditionalServices
{
    public function calculateShippingInsurance(float $declaredValue, float $basePremium = 0.02): float
    {
        // 2% of declared value, minimum $5, maximum $500
        $premium = $declaredValue * $basePremium;
        return max(5, min(500, $premium));
    }

    public function calculateSpecialPackaging(string $type): array
    {
        $packagingOptions = [
            'fragile' => [
                'name' => 'Empaque Frágil',
                'description' => 'Caja reforzada con protección especial',
                'price' => 15.00,
            ],
            'temperature' => [
                'name' => 'Empaque Térmico',
                'description' => 'Caja con control de temperatura',
                'price' => 25.00,
            ],
            'gift' => [
                'name' => 'Empaque para Regalo',
                'description' => 'Caja premium con envoltura',
                'price' => 12.00,
            ],
            'eco' => [
                'name' => 'Empaque Ecológico',
                'description' => 'Materiales 100% biodegradables',
                'price' => 8.00,
            ],
        ];

        return $packagingOptions[$type] ?? null;
    }

    public function calculateSecurityBag(float $declaredValue): float
    {
        // Security bag fee based on declared value tiers
        if ($declaredValue <= 100) {
            return 5.00;
        } elseif ($declaredValue <= 500) {
            return 12.00;
        } elseif ($declaredValue <= 1000) {
            return 20.00;
        } else {
            return 35.00; // For high-value items
        }
    }

    public function sendWhatsAppNotification(string $phone, string $message): array
    {
        // Mock WhatsApp notification - would integrate with WhatsApp Business API
        if (empty($phone)) {
            return [
                'success' => false,
                'message' => 'Phone number is required',
            ];
        }

        // Format phone number
        $formattedPhone = $this->formatPhoneNumber($phone);

        return [
            'success' => true,
            'message' => 'WhatsApp notification queued',
            'phone' => $formattedPhone,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    private function formatPhoneNumber(string $phone): string
    {
        // Remove non-numeric characters
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Add country code if not present (assumes Colombia +57)
        if (strlen($clean) === 10) {
            return '+57' . $clean;
        }

        if (strlen($clean) === 11 && substr($clean, 0, 1) === '1') {
            return '+1' . $clean;
        }

        return '+' . $clean;
    }

    public function getAvailableServices(): array
    {
        return [
            'insurance' => [
                'name' => 'Seguro de Envío',
                'description' => 'Protección ante pérdida o daño',
                'base_premium_rate' => 0.02,
                'min_price' => 5.00,
                'max_price' => 500.00,
            ],
            'special_packaging' => [
                'name' => 'Empaque Especial',
                'description' => 'Opciones de empaque especializado',
                'types' => ['fragile', 'temperature', 'gift', 'eco'],
            ],
            'security_bag' => [
                'name' => 'Bolso de Seguridad',
                'description' => 'Contenedor sellado anti-manipulación',
                'tiers' => [
                    ['max_value' => 100, 'price' => 5.00],
                    ['max_value' => 500, 'price' => 12.00],
                    ['max_value' => 1000, 'price' => 20.00],
                    ['max_value' => null, 'price' => 35.00],
                ],
            ],
            'whatsapp_notifications' => [
                'name' => 'Notificaciones WhatsApp',
                'description' => 'Alertas en tiempo real por WhatsApp',
                'events' => ['shipment_created', 'shipment_in_transit', 'delivered', 'pickup_scheduled'],
            ],
        ];
    }
}