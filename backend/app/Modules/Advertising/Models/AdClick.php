<?php

namespace App\Modules\Advertising\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdClick extends Model
{
    use HasFactory;

    protected $fillable = [
        'ad_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}
