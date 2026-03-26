<?php

namespace Tests\Feature;

use App\Contracts\GoogleIdTokenVerifier;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tests\TestCase;

class CustomerGoogleLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        StoreSetting::query()->create([
            'store_name' => 'Kios Sidomakmur',
            'store_code' => 'SIDO-JATIM-ONLINE',
            'store_address' => 'Jl. Contoh No. 1',
            'whatsapp_number' => '+628123456789',
            'operational_hours' => '08:00 - 17:00',
            'is_active' => true,
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_customer_can_login_with_verified_google_claims(): void
    {
        $verifier = Mockery::mock(GoogleIdTokenVerifier::class);
        $verifier->shouldReceive('verify')
            ->once()
            ->with('valid-google-id-token')
            ->andReturn([
                'sub' => 'google-sub-123',
                'email' => 'customer@example.com',
                'name' => 'Customer Test',
                'email_verified' => true,
            ]);

        $this->app->instance(GoogleIdTokenVerifier::class, $verifier);

        $response = $this->postJson('/api/v1/customer/auth/google', [
            'store_code' => 'SIDO-JATIM-ONLINE',
            'id_token' => 'valid-google-id-token',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('customer.email', 'customer@example.com')
            ->assertJsonPath('customer.full_name', 'Customer Test')
            ->assertJsonPath('auth_provider', 'google')
            ->assertJsonStructure([
                'access_token',
                'customer' => ['id', 'full_name', 'phone', 'email', 'member_tier'],
                'mode',
                'role',
                'pricing_mode',
                'auth_provider',
            ]);
    }

    public function test_invalid_google_token_returns_unauthorized_json(): void
    {
        $verifier = Mockery::mock(GoogleIdTokenVerifier::class);
        $verifier->shouldReceive('verify')
            ->once()
            ->with('invalid-google-id-token')
            ->andThrow(new UnauthorizedHttpException('google', 'ID token Google tidak valid.'));

        $this->app->instance(GoogleIdTokenVerifier::class, $verifier);

        $response = $this->postJson('/api/v1/customer/auth/google', [
            'store_code' => 'SIDO-JATIM-ONLINE',
            'id_token' => 'invalid-google-id-token',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'ID token Google tidak valid.',
            ]);
    }
}
