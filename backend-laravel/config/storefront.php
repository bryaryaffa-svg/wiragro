<?php

return [
    'default_store_code' => env('DEFAULT_STORE_CODE', 'SIDO-JATIM-ONLINE'),
    'default_currency' => env('DEFAULT_CURRENCY', 'IDR'),
    'order_auto_cancel_hours' => (int) env('ORDER_AUTO_CANCEL_HOURS', 24),
    'guest_minimum_order_amount' => (float) env('GUEST_MINIMUM_ORDER_AMOUNT', 0),
    'allowed_shipping_methods' => array_values(array_filter(array_map(
        static fn (string $value): string => trim($value),
        explode(',', env('CHECKOUT_SHIPPING_METHODS', 'delivery,pickup'))
    ))),
    'allowed_payment_methods' => array_values(array_filter(array_map(
        static fn (string $value): string => trim($value),
        explode(',', env('CHECKOUT_PAYMENT_METHODS', 'duitku-va,COD'))
    ))),
    'invoice_source' => env('CHECKOUT_INVOICE_SOURCE', 'STORE'),
];
