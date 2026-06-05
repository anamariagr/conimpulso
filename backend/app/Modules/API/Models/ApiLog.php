<?php

namespace App\Modules\API\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'api_key_id',
        'endpoint',
        'method',
        'ip_address',
        'response_code',
        'response_time',
    ];

    protected function casts(): array
    {
        return [
            'response_time' => 'integer',
        ];
    }

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class);
    }
}
