<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NegotiationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'negotiation_id',
        'sender_id',
        'message',
        'proposed_price',
    ];

    protected function casts(): array
    {
        return [
            'proposed_price' => 'decimal:2',
        ];
    }

    public function negotiation()
    {
        return $this->belongsTo(Negotiation::class, 'negotiation_id');
    }

    public function sender()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'sender_id');
    }
}
