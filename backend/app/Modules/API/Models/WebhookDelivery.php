<?php

namespace App\Modules\API\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'webhook_id',
        'event',
        'payload',
        'response_code',
        'response_body',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'response_body' => 'array',
        ];
    }

    public function webhook()
    {
        return $this->belongsTo(Webhook::class);
    }
}
