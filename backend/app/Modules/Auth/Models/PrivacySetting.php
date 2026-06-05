<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class PrivacySetting extends Model
{
    protected $fillable = [
        'user_id',
        'show_email',
        'show_phone',
        'show_location',
        'show_business_info',
        'allow_messages_from_non_contacts',
        'allow_search_indexing',
        'show_profile_to',
        'show_activity_status',
    ];

    protected function casts(): array
    {
        return [
            'show_email' => 'boolean',
            'show_phone' => 'boolean',
            'show_location' => 'boolean',
            'show_business_info' => 'boolean',
            'allow_messages_from_non_contacts' => 'boolean',
            'allow_search_indexing' => 'boolean',
            'show_activity_status' => 'boolean',
        ];
    }

    public const SHOW_ALL = 'all';
    public const SHOW_CONTACTS_ONLY = 'contacts';
    public const SHOW_NOBODY = 'nobody';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function defaults(): array
    {
        return [
            'show_email' => false,
            'show_phone' => false,
            'show_location' => true,
            'show_business_info' => true,
            'allow_messages_from_non_contacts' => true,
            'allow_search_indexing' => false,
            'show_profile_to' => self::SHOW_ALL,
            'show_activity_status' => true,
        ];
    }
}