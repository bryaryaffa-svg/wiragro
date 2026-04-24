<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerIsAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'detail' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $accessToken = PersonalAccessToken::findToken($token);
        $customer = $accessToken?->tokenable;

        if (! $customer instanceof Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'detail' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $accessToken->forceFill([
            'last_used_at' => now(),
        ])->save();

        $request->attributes->set('current_customer', $customer);
        $request->setUserResolver(static fn () => $customer);

        return $next($request);
    }
}
