<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactBlock extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'blocked_user_id',
        'reason',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'user_id');
    }

    public function blockedUser()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'blocked_user_id');
    }
}