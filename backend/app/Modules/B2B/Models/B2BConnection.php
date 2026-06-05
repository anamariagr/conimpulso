<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class B2BConnection extends Model
{
    use HasFactory;

    protected $table = 'b2b_connections';

    protected $fillable = [
        'initiator_id',
        'target_id',
        'status',
        'type',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function initiator()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'initiator_id');
    }

    public function target()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'target_id');
    }
}
