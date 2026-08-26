<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\ProductOrder;
use App\Modules\Wallet\Models\WalletTopUp;
use App\Services\ProductOrderService;
use App\Services\WalletTopUpService;
use App\Services\WompiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WompiWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $payload['signature'] ?? [];
        $properties = $signature['properties'] ?? [];
        $checksum = $signature['checksum'] ?? '';
        $timestamp = (string) ($payload['timestamp'] ?? '');

        if (!$checksum || !WompiService::verifyWebhookSignature($payload['data'] ?? [], $properties, $timestamp, $checksum)) {
            Log::warning('Wompi webhook: invalid or missing signature');
            return response()->json(['success' => false], 401);
        }

        $transaction = $payload['data']['transaction'] ?? null;

        if ($transaction && !empty($transaction['reference'])) {
            $reference = $transaction['reference'];
            $status = $transaction['status'] ?? '';
            $transactionId = $transaction['id'] ?? '';

            if (str_starts_with($reference, 'CI-')) {
                $topUp = WalletTopUp::where('reference', $reference)->first();
                $topUp
                    ? WalletTopUpService::resolveFromWompi($topUp, $status, $transactionId)
                    : Log::warning('Wompi webhook: no matching top-up for reference ' . $reference);
            } elseif (str_starts_with($reference, 'PO-')) {
                ProductOrder::where('reference', $reference)->exists()
                    ? ProductOrderService::resolveGroupFromWompi($reference, $status, $transactionId)
                    : Log::warning('Wompi webhook: no matching product order for reference ' . $reference);
            } elseif (str_starts_with($reference, 'COMM-')) {
                ProductOrderService::resolveCommissionFromWompi($reference, $status, $transactionId);
            } else {
                Log::warning('Wompi webhook: unrecognized reference prefix ' . $reference);
            }
        }

        return response()->json(['success' => true]);
    }
}
