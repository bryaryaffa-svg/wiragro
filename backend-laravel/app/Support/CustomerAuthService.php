<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\OtpChallenge;
use App\Models\StoreSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Throwable;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerAuthService
{
    public function requestOtp(string $storeCode, string $phone): array
    {
        $this->assertStoreIsActive($storeCode);

        $normalizedPhone = $this->normalizePhone($phone);
        $otpCode = config('customer.otp_debug_code') ?: str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $challenge = OtpChallenge::create([
            'phone' => $normalizedPhone,
            'otp_code' => $otpCode,
            'expires_at' => now()->addSeconds(config('customer.otp_expiry_seconds', 300)),
        ]);

        $response = [
            'challenge_id' => $challenge->id,
            'expires_in_seconds' => config('customer.otp_expiry_seconds', 300),
        ];

        if (config('app.debug')) {
            $response['debug_otp_code'] = $otpCode;
        }

        return $response;
    }

    public function verifyOtp(string $storeCode, string $challengeId, string $otpCode): array
    {
        $this->assertStoreIsActive($storeCode);

        /** @var OtpChallenge|null $challenge */
        $challenge = OtpChallenge::query()->find($challengeId);

        if (! $challenge) {
            throw new NotFoundHttpException('Challenge OTP tidak ditemukan.');
        }

        if ($challenge->consumed_at || $challenge->verified_at) {
            throw new UnprocessableEntityHttpException('OTP sudah digunakan.');
        }

        if ($challenge->expires_at->isPast()) {
            throw new UnprocessableEntityHttpException('OTP sudah kedaluwarsa.');
        }

        if (! hash_equals($challenge->otp_code, trim($otpCode))) {
            throw new UnprocessableEntityHttpException('Kode OTP tidak valid.');
        }

        $challenge->forceFill([
            'verified_at' => now(),
            'consumed_at' => now(),
        ])->save();

        $customer = Customer::query()->firstOrNew([
            'phone' => $challenge->phone,
        ]);

        $customer->fill([
            'full_name' => $customer->full_name ?: ('Pelanggan '.substr($challenge->phone, -4)),
            'auth_provider' => 'whatsapp',
            'whatsapp_verified' => true,
            'is_guest' => false,
            'last_order_at' => $customer->last_order_at,
        ]);
        $customer->save();

        return $this->issueSession($customer, 'whatsapp-otp');
    }

    public function loginGoogle(string $storeCode, string $idToken): array
    {
        $this->assertStoreIsActive($storeCode);

        $claims = $this->verifyGoogleToken($idToken);
        $email = Str::lower((string) $claims['email']);

        /** @var Customer $customer */
        $customer = Customer::query()
            ->where('google_sub', (string) $claims['sub'])
            ->orWhere('email', $email)
            ->firstOrNew();

        $customer->fill([
            'full_name' => (string) ($claims['name'] ?? Str::before($email, '@')),
            'email' => $email,
            'auth_provider' => 'google',
            'google_sub' => (string) $claims['sub'],
            'is_guest' => false,
        ]);
        $customer->save();

        return $this->issueSession($customer, 'google-oidc');
    }

    public function issueSession(Customer $customer, string $mode): array
    {
        $token = $customer->createToken(config('customer.token_name', 'web-customer'), ['customer'])->plainTextToken;

        return [
            'access_token' => $token,
            'customer' => [
                'id' => (string) $customer->id,
                'full_name' => $customer->full_name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'member_tier' => $customer->member_tier,
            ],
            'mode' => $mode,
            'role' => $customer->member_tier ? 'reseller' : 'customer',
            'pricing_mode' => $customer->member_tier ? 'reseller' : 'retail',
            'auth_provider' => $customer->auth_provider,
        ];
    }

    public function logout(Customer $customer, string $plainTextToken): void
    {
        $token = PersonalAccessToken::findToken($plainTextToken);

        if ($token?->tokenable instanceof Customer && $token->tokenable->is($customer)) {
            $token->delete();
        }
    }

    private function verifyGoogleToken(string $idToken): array
    {
        try {
            $response = Http::timeout(10)->acceptJson()->get(config('customer.google_tokeninfo_url'), [
                'id_token' => $idToken,
            ]);
        } catch (ConnectionException $exception) {
            throw new UnauthorizedHttpException(
                'google',
                'Layanan verifikasi Google sedang tidak dapat dijangkau.'
            );
        } catch (Throwable $exception) {
            throw new UnauthorizedHttpException(
                'google',
                'Verifikasi login Google gagal diproses.'
            );
        }

        if (! $response->ok()) {
            throw new UnauthorizedHttpException('google', 'ID token Google tidak valid.');
        }

        $payload = $response->json();
        $audiences = config('customer.google_oidc_audiences', []);
        $audience = (string) ($payload['aud'] ?? '');

        if ($audiences === []) {
            throw new UnprocessableEntityHttpException('GOOGLE_OIDC_AUDIENCES belum dikonfigurasi.');
        }

        if ($audience === '' || ! in_array($audience, $audiences, true)) {
            throw new UnauthorizedHttpException('google', 'Audience Google tidak diizinkan.');
        }

        if (! filter_var($payload['email'] ?? null, FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException('Email Google tidak tersedia.');
        }

        $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $emailVerified) {
            throw new UnauthorizedHttpException('google', 'Email Google belum terverifikasi.');
        }

        if (isset($payload['exp']) && (int) $payload['exp'] < now()->timestamp) {
            throw new UnauthorizedHttpException('google', 'ID token Google sudah kedaluwarsa.');
        }

        if (empty($payload['sub'])) {
            throw new UnauthorizedHttpException('google', 'Subject Google tidak tersedia.');
        }

        return $payload;
    }

    private function assertStoreIsActive(string $storeCode): void
    {
        $exists = StoreSetting::query()
            ->where('store_code', $storeCode)
            ->where('is_active', true)
            ->exists();

        if (! $exists) {
            throw new NotFoundHttpException('Store tidak ditemukan atau tidak aktif.');
        }
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return $phone;
        }

        if (Str::startsWith($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (! Str::startsWith($digits, '62')) {
            $digits = '62'.$digits;
        }

        return '+'.$digits;
    }
}
