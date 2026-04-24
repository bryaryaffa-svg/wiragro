<?php

return [
    'catalog_sync_enabled' => filter_var(env('SIGETAN_CATALOG_SYNC_ENABLED', false), FILTER_VALIDATE_BOOL),
    'base_url' => env('SIGETAN_BASE_URL', ''),
    'catalog_api_key' => env('SIGETAN_CATALOG_API_KEY', ''),
    'source_code' => env('SIGETAN_SOURCE_CODE', 'WIRAGRO_WEB'),
    'source_name' => env('SIGETAN_SOURCE_NAME', 'Wiragro Website'),
    'target_code' => env('SIGETAN_TARGET_CODE', 'WIRAGRO_WEB'),
    'timeout' => (int) env('SIGETAN_TIMEOUT', 10),
];
