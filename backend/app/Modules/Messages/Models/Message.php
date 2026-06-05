<?php

namespace App\Modules\Messages\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'body',
        'is_read',
        'read_at',
        'attachment_path',
        'attachment_name',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'receiver_id');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeInbox($query, int $userId)
    {
        return $query->where('receiver_id', $userId);
    }

    public function scopeSent($query, int $userId)
    {
        return $query->where('sender_id', $userId);
    }
}