<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactProtectionLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'flags',
        'original_content',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'flags' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}