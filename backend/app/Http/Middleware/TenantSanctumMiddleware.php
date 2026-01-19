<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TenantSanctumMiddleware
{
    /**
     * Handle an incoming request - verify tokens against tenant connection
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Get the token from the Authorization header
            $token = $this->getTokenFromRequest($request);

            $currentDb = DB::connection('tenant')->getDatabaseName();
            \Log::info("===== TenantSanctumMiddleware START =====");
            \Log::info("Path: " . $request->path());
            \Log::info("Current Tenant DB: {$currentDb}");
            \Log::info("Token provided: " . ($token ? substr($token, 0, 20) . '...' : 'NONE'));

            if (!$token) {
                \Log::warning("✗ No token in Authorization header");
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Extract the actual token part (after the ID|)
            // Token format: ID|TOKEN (e.g., 6|Z9ZPwi6usDXU77I2Ea2cE4yMiyeXl88WGLeBT4aJ82cff197)
            $tokenParts = explode('|', $token, 2);
            if (count($tokenParts) !== 2) {
                \Log::warning("✗ Invalid token format, expected ID|TOKEN");
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $actualToken = $tokenParts[1];
            $hashedToken = hash('sha256', $actualToken);

            \Log::info("Token ID: {$tokenParts[0]}");
            \Log::info("Searching for token in {$currentDb}.personal_access_tokens...");
            \Log::info("Hashed token (first 20 chars): " . substr($hashedToken, 0, 20) . '...');

            $accessToken = DB::connection('tenant')
                ->table('personal_access_tokens')
                ->where('token', $hashedToken)
                ->first();

            \Log::info("Token query result: " . ($accessToken ? 'FOUND' : 'NOT FOUND'));

            if (!$accessToken) {
                \Log::warning("✗ Token NOT found in {$currentDb}.personal_access_tokens");
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Load the user from the tenant database
            \Log::info("Looking for user ID {$accessToken->tokenable_id} in {$currentDb}.users...");

            $user = DB::connection('tenant')
                ->table('users')
                ->where('id', $accessToken->tokenable_id)
                ->first();

            \Log::info("User query result: " . ($user ? 'FOUND (' . $user->email . ')' : 'NOT FOUND'));

            if (!$user) {
                \Log::warning("✗ User not found for token");
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Convert to a proper User model instance with tenant connection
            $userModel = new \App\Models\User();
            $userModel->setConnection('tenant');
            $userModel->forceFill((array)$user);
            $userModel->exists = true;

            // Set user on request
            $request->setUserResolver(function () use ($userModel) {
                return $userModel;
            });

            // Also set the user on the Auth facade
            Auth::setUser($userModel);

            \Log::info("✓ User AUTHENTICATED: {$user->email}, Role: {$user->role}");
            \Log::info("===== TenantSanctumMiddleware END =====\n");

        } catch (\Exception $e) {
            \Log::error("✗ TenantSanctumMiddleware Exception: " . $e->getMessage());
            \Log::error("Exception trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return $next($request);
    }

    /**
     * Extract the bearer token from the Authorization header
     */
    protected function getTokenFromRequest(Request $request): ?string
    {
        $header = $request->header('Authorization', '');

        if (strpos($header, 'Bearer ') === 0) {
            return substr($header, 7);
        }

        return null;
    }
}

