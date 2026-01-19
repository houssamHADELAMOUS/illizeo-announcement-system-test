<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register custom role middleware
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'tenant-sanctum' => \App\Http\Middleware\TenantSanctumMiddleware::class,
        ]);

        // Exclude API routes from CSRF verification (using token-based auth)
        $middleware->validateCsrfTokens(except: [
            'api/*',
            '*/api/*',
        ]);

        // Configure Sanctum stateful API
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle authorization denied
        $exceptions->render(function (AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sorry, you do not have permission to perform this action. Only the author can modify this resource.',
                    'error' => 'access_denied'
                ], 403);
            }
        });

        // Handle authentication errors
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please log in to access this resource.',
                    'error' => 'unauthenticated'
                ], 401);
            }
        });

        // Handle not found errors
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The requested resource was not found.',
                    'error' => 'not_found'
                ], 404);
            }
        });
    })->create();
