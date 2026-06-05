<?php

namespace App\Modules\ERP\Services\Connectors;

use App\Modules\ERP\Services\BaseERPConnector;
use App\Modules\ERP\Models\ERPConnection;

class SAPConnector extends BaseERPConnector
{
    private string $clientId;

    public function __construct(ERPConnection $connection)
    {
        parent::__construct($connection);
        $this->clientId = $this->config['client_id'] ?? '';
    }

    public function testConnection(): bool
    {
        $response = $this->makeRequest('GET', 'sap/opportunity/ping');

        return $response['success'];
    }

    public function fetchProducts(int $page = 1, int $perPage = 100): array
    {
        $skip = ($page - 1) * $perPage;

        $response = $this->makeRequest(
            'GET',
            "api/materials?\$skip={$skip}&\$top={$perPage}&\$filter=MaterialType eq 'FERT'"
        );

        if ($response['success'] && isset($response['data']['d']['results'])) {
            return $response['data']['d']['results'];
        }

        return [];
    }

    public function fetchOrders(int $page = 1, int $perPage = 100): array
    {
        $skip = ($page - 1) * $perPage;

        $response = $this->makeRequest(
            'GET',
            "api/salesorders?\$skip={$skip}&\$top={$perPage}"
        );

        if ($response['success'] && isset($response['data']['d']['results'])) {
            return $response['data']['d']['results'];
        }

        return [];
    }

    public function fetchInventory(): array
    {
        $response = $this->makeRequest('GET', 'api/stock/balance');

        if ($response['success'] && isset($response['data']['d']['results'])) {
            return $response['data']['d']['results'];
        }

        return [];
    }

    public function pushProduct(array $product): bool
    {
        $response = $this->makeRequest('POST', 'api/materials', $product);

        return $response['success'];
    }

    public function pushOrder(array $order): bool
    {
        $response = $this->makeRequest('POST', 'api/salesorders', $order);

        return $response['success'];
    }

    public function pushInventoryUpdate(array $inventory): bool
    {
        $response = $this->makeRequest('PATCH', "api/stock/{$inventory['MaterialID']}", $inventory);

        return $response['success'];
    }
}