<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentModerationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_type',
        'content_id',
        'input_data',
        'ai_response',
        'confidence',
        'action_taken',
    ];

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'ai_response' => 'array',
            'confidence' => 'float',
        ];
    }
}
