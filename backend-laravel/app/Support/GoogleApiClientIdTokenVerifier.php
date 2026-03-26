<?php

namespace App\Support;

use App\Contracts\GoogleIdTokenVerifier;
use DomainException;
use Google\Client as GoogleClient;
use Google\Exception as GoogleException;
use GuzzleHttp\Exception\GuzzleException;
use LogicException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use UnexpectedValueException;

class GoogleApiClientIdTokenVerifier implements GoogleIdTokenVerifier
{
    /**
     * @return array<string, mixed>
     */
    public function verify(string $idToken): array
    {
        $audiences = config('customer.google_oidc_audiences', []);

        if ($audiences === []) {
            throw new UnprocessableEntityHttpException('GOOGLE_OIDC_AUDIENCES belum dikonfigurasi.');
        }

        $payload = null;

        foreach ($audiences as $audience) {
            $candidate = $this->verifyForAudience($idToken, $audience);

            if (is_array($candidate)) {
                $payload = $candidate;
                break;
            }
        }

        if (! is_array($payload)) {
            throw new UnauthorizedHttpException('google', 'ID token Google tidak valid atau audience tidak diizinkan.');
        }

        if (! filter_var($payload['email'] ?? null, FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException('Email Google tidak tersedia.');
        }

        $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $emailVerified) {
            throw new UnauthorizedHttpException('google', 'Email Google belum terverifikasi.');
        }

        if (empty($payload['sub'])) {
            throw new UnauthorizedHttpException('google', 'Subject Google tidak tersedia.');
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>|false
     */
    private function verifyForAudience(string $idToken, string $audience): array|false
    {
        try {
            $client = new GoogleClient(['client_id' => $audience]);

            return $client->verifyIdToken(trim($idToken));
        } catch (LogicException|UnexpectedValueException|DomainException) {
            throw new UnauthorizedHttpException('google', 'ID token Google tidak valid.');
        } catch (GoogleException|GuzzleException) {
            throw new ServiceUnavailableHttpException(
                null,
                'Layanan verifikasi Google sedang tidak dapat dijangkau.'
            );
        }
    }
}
