<?php

return [
    'otp_expiry_seconds' => (int) env('CUSTOMER_OTP_EXPIRY_SECONDS', 300),
    'otp_debug_code' => env('CUSTOMER_OTP_DEBUG_CODE'),
    'google_oidc_audiences' => array_values(array_filter(array_map(
        static fn (string $value): string => trim($value),
        explode(',', env('GOOGLE_OIDC_AUDIENCES', ''))
    ))),
    'google_tokeninfo_url' => env('GOOGLE_TOKENINFO_URL', 'https://oauth2.googleapis.com/tokeninfo'),
    'token_name' => env('CUSTOMER_ACCESS_TOKEN_NAME', 'web-customer'),
    'duitku_merchant_code' => env('DUITKU_MERCHANT_CODE', 'DUMMYMERCHANT'),
    'duitku_payment_mode' => env('DUITKU_PAYMENT_MODE', 'server-stub-until-merchant-credentials-enabled'),
    'duitku_sandbox_payment_url' => env('DUITKU_SANDBOX_PAYMENT_URL', 'https://sandbox.duitku.com/topup/topupdirectv2.aspx'),
];
