<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin' || ! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun admin tidak diizinkan mengakses resource ini.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
