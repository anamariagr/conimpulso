<?php

namespace App\Modules\ERP\Models;

use Illuminate\Database\Eloquent\Model;

class ERPSyncLog extends Model
{
    protected $fillable = [
        'connection_id',
        'entity_type',
        'direction',
        'records_count',
        'status',
        'started_at',
        'completed_at',
        'error_message',
        'request_data',
        'response_data',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'request_data' => 'array',
        'response_data' => 'array',
    ];

    const DIRECTION_IMPORT = 'import';
    const DIRECTION_EXPORT = 'export';

    const STATUS_PENDING = 'pending';
    const STATUS_RUNNING = 'running';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';

    public function connection()
    {
        return $this->belongsTo(ERPConnection::class, 'connection_id');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function durationInSeconds(): ?int
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }
        return $this->completed_at->diffInSeconds($this->started_at);
    }
}