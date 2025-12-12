<?php

$frontendUrls = env('FRONTEND_URLS', env('FRONTEND_URL', ''));
$allowedOrigins = array_values(array_unique(array_filter(array_merge(
    array_map('trim', explode(',', (string) $frontendUrls)),
    [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://whoismypsychologist.com',
        'https://www.whoismypsychologist.com',
    ]
))));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [
        '#^https?://([a-z0-9-]+\.)?souftech\.com$#i',
        '#^https?://([a-z0-9-]+\.)?souftec\.com$#i',
        '#^https?://([a-z0-9-]+\.)?whoismypsychologist\.com$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
