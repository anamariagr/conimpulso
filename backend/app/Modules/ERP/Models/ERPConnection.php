<?php

namespace App\Modules\ERP\Models;

use Illuminate\Database\Eloquent\Model;

class ERPConnection extends Model
{
    protected $fillable = [
        'name',
        'erp_type',
        'api_endpoint',
        'api_key',
        'api_secret',
        'settings',
        'is_active',
        'last_sync_at',
        'sync_status',
        'metadata',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
        'metadata' => 'array',
    ];

    const ERP_SAP = 'sap';
    const ERP_ODOO = 'odoo';
    const ERP_NETSUITE = 'netsuite';
    const ERP_CUSTOM = 'custom';

    public function syncLogs()
    {
        return $this->hasMany(ERPSyncLog::class, 'connection_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function markSynced(string $status = 'success'): void
    {
        $this->update([
            'last_sync_at' => now(),
            'sync_status' => $status,
        ]);
    }
}