<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationMessage extends Model
{
    protected $fillable = [
        'quotation_id',
        'user_id',
        'content',
        'attachment_path',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}