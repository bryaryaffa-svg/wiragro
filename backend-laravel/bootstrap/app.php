<?php

use App\Http\Middleware\EnsureAdminIsActive;
use App\Http\Middleware\EnsureCustomerIsAuthenticated;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.active' => EnsureAdminIsActive::class,
            'customer.auth' => EnsureCustomerIsAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Validasi request gagal.',
                'detail' => 'Validasi request gagal.',
                'errors' => $exception->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'detail' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.',
                'detail' => 'Akses ditolak.',
            ], Response::HTTP_FORBIDDEN);
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            $message = $exception->getMessage() !== ''
                ? $exception->getMessage()
                : 'Resource tidak ditemukan.';

            return response()->json([
                'success' => false,
                'message' => $message,
                'detail' => $message,
            ], Response::HTTP_NOT_FOUND);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            $message = $exception->getMessage() !== ''
                ? $exception->getMessage()
                : (Response::$statusTexts[$exception->getStatusCode()] ?? 'Request gagal diproses.');

            return response()->json([
                'success' => false,
                'message' => $message,
                'detail' => $message,
            ], $exception->getStatusCode(), $exception->getHeaders());
        });

        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            $message = config('app.debug')
                ? $exception->getMessage()
                : 'Terjadi kesalahan pada server.';

            return response()->json([
                'success' => false,
                'message' => $message,
                'detail' => $message,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        });
    })
    ->create();
