<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpamDetection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_type',
        'content_hash',
        'spam_score',
        'is_spam',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'spam_score' => 'float',
            'is_spam' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}
