<?php

namespace App\Modules\ERP\Services;

use App\Modules\ERP\Models\ERPConnection;
use App\Modules\ERP\Models\ERPSyncLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class BaseERPConnector
{
    protected ERPConnection $connection;
    protected array $config;

    abstract public function testConnection(): bool;
    abstract public function fetchProducts(int $page = 1, int $perPage = 100): array;
    abstract public function fetchOrders(int $page = 1, int $perPage = 100): array;
    abstract public function fetchInventory(): array;
    abstract public function pushProduct(array $product): bool;
    abstract public function pushOrder(array $order): bool;
    abstract public function pushInventoryUpdate(array $inventory): bool;

    public function __construct(ERPConnection $connection)
    {
        $this->connection = $connection;
        $this->config = $connection->settings ?? [];
    }

    protected function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $url = rtrim($this->connection->api_endpoint, '/') . '/' . ltrim($endpoint, '/');

        try {
            $headers = [
                'Authorization' => 'Bearer ' . $this->connection->api_key,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ];

            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->{strtolower($method)}($url, $data);

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'data' => $response->json() ?? [],
                'error' => $response->failed() ? $response->body() : null,
            ];
        } catch (\Exception $e) {
            Log::error('ERP request failed', [
                'connection' => $this->connection->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'status' => 0,
                'data' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function logSync(
        string $entityType,
        string $direction,
        int $recordsCount,
        string $status,
        ?string $errorMessage = null,
        ?array $requestData = null,
        ?array $responseData = null
    ): ERPSyncLog {
        return ERPSyncLog::create([
            'connection_id' => $this->connection->id,
            'entity_type' => $entityType,
            'direction' => $direction,
            'records_count' => $recordsCount,
            'status' => $status,
            'started_at' => now(),
            'completed_at' => now(),
            'error_message' => $errorMessage,
            'request_data' => $requestData,
            'response_data' => $responseData,
        ]);
    }
}