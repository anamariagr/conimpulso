<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIModelConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_type',
        'config_key',
        'config_value',
        'is_active',
    ];
}
