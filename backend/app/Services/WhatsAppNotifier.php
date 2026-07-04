<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotifier
{
    public static function send(?string $phone, string $text): bool
    {
        $phone = self::normalizePhone($phone);

        if (!$phone) {
            Log::info('WhatsApp notification skipped: no phone number');
            return false;
        }

        $baseUrl = config('services.whatsapp_gateway.url');
        $apiKey  = config('services.whatsapp_gateway.api_key');
        $session = config('services.whatsapp_gateway.session', 'default');

        if (!$baseUrl) {
            Log::info('WhatsApp notification skipped: WHATSAPP_GATEWAY_URL not set');
            return false;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders(array_filter(['X-Api-Key' => $apiKey]))
                ->post(rtrim($baseUrl, '/') . '/api/sendText', [
                    'session' => $session,
                    'chatId'  => $phone . '@c.us',
                    'text'    => $text,
                ]);

            if (!$response->successful()) {
                Log::warning('WhatsApp notification failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('WhatsApp notification failed: ' . $e->getMessage());
            return false;
        }
    }

    protected static function normalizePhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $digits = preg_replace('/\D/', '', $phone);

        if (!$digits) {
            return null;
        }

        // Local Colombian mobile numbers (10 digits, e.g. 3115728858) need the country code.
        if (strlen($digits) === 10 && $digits[0] === '3') {
            $digits = '57' . $digits;
        }

        return $digits;
    }
}
