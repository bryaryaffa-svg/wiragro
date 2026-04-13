<?php

use Illuminate\Support\Str;

$configuredCouriers = preg_split('/[:,]/', (string) env('RAJAONGKIR_COURIERS', 'jne:jnt:sicepat:pos')) ?: [];

return [
    'base_url' => rtrim((string) env('RAJAONGKIR_BASE_URL', 'https://rajaongkir.komerce.id/api/v1'), '/'),
    'api_key' => (string) env('RAJAONGKIR_API_KEY', ''),
    'origin_id' => (string) env('RAJAONGKIR_ORIGIN_ID', ''),
    'price_mode' => (string) env('RAJAONGKIR_PRICE_MODE', 'lowest'),
    'timeout_seconds' => (int) env('RAJAONGKIR_TIMEOUT_SECONDS', 15),
    'default_weight_grams' => (int) env('RAJAONGKIR_DEFAULT_WEIGHT_GRAMS', 1000),
    'couriers' => array_values(array_filter(array_map(
        static fn (string $value): string => Str::lower(trim($value)),
        $configuredCouriers
    ))),
];
