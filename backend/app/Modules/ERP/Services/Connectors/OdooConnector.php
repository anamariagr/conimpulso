<?php

namespace App\Modules\ERP\Services\Connectors;

use App\Modules\ERP\Services\BaseERPConnector;
use App\Modules\ERP\Models\ERPConnection;

class OdooConnector extends BaseERPConnector
{
    private string $database;
    private int $userId;

    public function __construct(ERPConnection $connection)
    {
        parent::__construct($connection);
        $this->database = $this->config['database'] ?? '';
        $this->userId = 0;
    }

    public function authenticate(): bool
    {
        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'common',
                'method' => 'login',
                'args' => [
                    $this->database,
                    $this->config['email'] ?? '',
                    $this->connection->api_secret,
                ],
            ],
        ]);

        if ($response['success'] && isset($response['data']['result'])) {
            $this->userId = $response['data']['result'];
            return $this->userId > 0;
        }

        return false;
    }

    public function testConnection(): bool
    {
        return $this->authenticate();
    }

    public function fetchProducts(int $page = 1, int $perPage = 100): array
    {
        $offset = ($page - 1) * $perPage;

        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'product.product',
                    'search_read',
                    [],
                    ['fields' => ['name', 'default_code', 'list_price', 'qty_available'], 'offset' => $offset, 'limit' => $perPage],
                ],
            ],
        ]);

        if ($response['success'] && isset($response['data']['result'])) {
            return $response['data']['result'];
        }

        return [];
    }

    public function fetchOrders(int $page = 1, int $perPage = 100): array
    {
        $offset = ($page - 1) * $perPage;

        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'sale.order',
                    'search_read',
                    [['state', '=', 'sale']],
                    ['fields' => ['name', 'date_order', 'partner_id', 'amount_total'], 'offset' => $offset, 'limit' => $perPage],
                ],
            ],
        ]);

        if ($response['success'] && isset($response['data']['result'])) {
            return $response['data']['result'];
        }

        return [];
    }

    public function fetchInventory(): array
    {
        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'stock.quant',
                    'search_read',
                    [],
                    ['fields' => ['product_id', 'location_id', 'qty']],
                ],
            ],
        ]);

        if ($response['success'] && isset($response['data']['result'])) {
            return $response['data']['result'];
        }

        return [];
    }

    public function pushProduct(array $product): bool
    {
        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'product.product',
                    'create',
                    [$product],
                ],
            ],
        ]);

        return $response['success'] && isset($response['data']['result']);
    }

    public function pushOrder(array $order): bool
    {
        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'sale.order',
                    'create',
                    [$order],
                ],
            ],
        ]);

        return $response['success'] && isset($response['data']['result']);
    }

    public function pushInventoryUpdate(array $inventory): bool
    {
        $response = $this->makeRequest('POST', 'jsonrpc', [
            'jsonrpc' => '2.0',
            'method' => 'call',
            'params' => [
                'service' => 'object',
                'method' => 'execute',
                'args' => [
                    $this->database,
                    $this->userId,
                    $this->connection->api_secret,
                    'stock.quant',
                    'create',
                    [$inventory],
                ],
            ],
        ]);

        return $response['success'] && isset($response['data']['result']);
    }
}