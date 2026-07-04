<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY', ''),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID', ''),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'callmebot' => [
        'phone'   => env('WHATSAPP_PHONE', '3115728852'),
        'api_key' => env('CALLMEBOT_API_KEY', ''),
    ],

    'whatsapp_gateway' => [
        'url'     => env('WHATSAPP_GATEWAY_URL', 'http://whatsapp:3000'),
        'api_key' => env('WHATSAPP_GATEWAY_API_KEY', ''),
        'session' => env('WHATSAPP_GATEWAY_SESSION', 'default'),
    ],

];
