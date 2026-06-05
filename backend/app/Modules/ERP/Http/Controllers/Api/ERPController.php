<?php

namespace App\Modules\ERP\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\ERP\Models\ERPConnection;
use App\Modules\ERP\Models\ERPSyncLog;
use App\Modules\ERP\Services\Connectors\OdooConnector;
use App\Modules\ERP\Services\Connectors\SAPConnector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ERPController extends Controller
{
    public function connections(): JsonResponse
    {
        $connections = ERPConnection::active()->get();

        return response()->json([
            'success' => true,
            'data' => $connections,
        ]);
    }

    public function createConnection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'erp_type' => 'required|in:sap,odoo,netsuite,custom',
            'api_endpoint' => 'required|url',
            'api_key' => 'required|string',
            'api_secret' => 'required|string',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $connection = ERPConnection::create([
            'name' => $request->name,
            'erp_type' => $request->erp_type,
            'api_endpoint' => $request->api_endpoint,
            'api_key' => $request->api_key,
            'api_secret' => encrypt($request->api_secret),
            'settings' => $request->settings,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $connection,
            'message' => 'Connection created successfully',
        ], 201);
    }

    public function testConnection(int $id): JsonResponse
    {
        $connection = ERPConnection::findOrFail($id);

        $connector = $this->getConnector($connection);
        $result = $connector->testConnection();

        $connection->update([
            'sync_status' => $result ? 'connected' : 'failed',
        ]);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Connection successful' : 'Connection failed',
        ]);
    }

    public function syncData(Request $request, int $id): JsonResponse
    {
        $connection = ERPConnection::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:products,orders,inventory',
            'direction' => 'required|in:import,export',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $connector = $this->getConnector($connection);
        $entityType = $request->entity_type;
        $direction = $request->direction;

        $syncLog = ERPSyncLog::create([
            'connection_id' => $connection->id,
            'entity_type' => $entityType,
            'direction' => $direction,
            'status' => ERPSyncLog::STATUS_RUNNING,
            'started_at' => now(),
        ]);

        try {
            $records = [];
            $count = 0;

            if ($direction === ERPSyncLog::DIRECTION_IMPORT) {
                $records = match ($entityType) {
                    'products' => $connector->fetchProducts(),
                    'orders' => $connector->fetchOrders(),
                    'inventory' => $connector->fetchInventory(),
                    default => [],
                };
                $count = count($records);
            } else {
                // Export - would need to get local data to push
                $count = 0;
            }

            $syncLog->update([
                'records_count' => $count,
                'status' => ERPSyncLog::STATUS_SUCCESS,
                'completed_at' => now(),
            ]);

            $connection->markSynced('success');

            return response()->json([
                'success' => true,
                'message' => "Sync completed: {$count} records",
                'data' => [
                    'records_count' => $count,
                    'duration' => $syncLog->durationInSeconds(),
                ],
            ]);
        } catch (\Exception $e) {
            $syncLog->update([
                'status' => ERPSyncLog::STATUS_FAILED,
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            $connection->markSynced('failed');

            return response()->json([
                'success' => false,
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function syncLogs(int $id): JsonResponse
    {
        $connection = ERPConnection::findOrFail($id);
        $logs = $connection->syncLogs()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function availableERPs(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'type' => 'odoo',
                    'name' => 'Odoo',
                    'description' => 'Open source ERP',
                    'fields' => ['database', 'email', 'api_secret'],
                ],
                [
                    'type' => 'sap',
                    'name' => 'SAP Business One',
                    'description' => 'Enterprise ERP',
                    'fields' => ['client_id', 'api_key', 'api_secret'],
                ],
                [
                    'type' => 'netsuite',
                    'name' => 'NetSuite',
                    'description' => 'Oracle NetSuite',
                    'fields' => ['account_id', 'consumer_key', 'consumer_secret'],
                ],
                [
                    'type' => 'custom',
                    'name' => 'Custom API',
                    'description' => 'Connect to any REST API',
                    'fields' => ['api_endpoint', 'api_key', 'api_secret'],
                ],
            ],
        ]);
    }

    private function getConnector(ERPConnection $connection)
    {
        return match ($connection->erp_type) {
            ERPConnection::ERP_ODOO => new OdooConnector($connection),
            ERPConnection::ERP_SAP => new SAPConnector($connection),
            default => throw new \Exception("Unsupported ERP type: {$connection->erp_type}"),
        };
    }
}