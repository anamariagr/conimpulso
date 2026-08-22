<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WompiService
{
    public static function isSandbox(): bool
    {
        return str_contains((string) config('services.wompi.private_key'), '_test_');
    }

    public static function apiBaseUrl(): string
    {
        return self::isSandbox() ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';
    }

    public static function checkoutParams(string $reference, float $amountCop, string $redirectUrl): array
    {
        $amountInCents = (int) round($amountCop * 100);
        $currency = 'COP';

        $signature = hash(
            'sha256',
            $reference . $amountInCents . $currency . config('services.wompi.integrity_secret')
        );

        return [
            'public-key' => config('services.wompi.public_key'),
            'currency' => $currency,
            'amount-in-cents' => $amountInCents,
            'reference' => $reference,
            'signature:integrity' => $signature,
            'redirect-url' => $redirectUrl,
        ];
    }

    public static function verifyWebhookSignature(array $payload, array $properties, string $timestamp, string $checksum): bool
    {
        $concatenated = '';
        foreach ($properties as $propertyPath) {
            $concatenated .= data_get($payload, $propertyPath);
        }
        $concatenated .= $timestamp;
        $concatenated .= config('services.wompi.events_secret');

        return hash_equals(hash('sha256', $concatenated), $checksum);
    }

    public static function fetchTransaction(string $transactionId): ?array
    {
        $response = Http::withToken(config('services.wompi.private_key'))
            ->get(self::apiBaseUrl() . "/transactions/{$transactionId}");

        if (!$response->successful()) {
            return null;
        }

        return $response->json('data');
    }
}
