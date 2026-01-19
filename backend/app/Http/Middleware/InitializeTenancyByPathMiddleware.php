<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;
use App\Models\Tenant;

class InitializeTenancyByPathMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Extract tenant from URL path: /{tenant-id}/api/...
     * Example: /1b927791-82a7-4358-92c7-77e4501737fe/api/auth/login
     */
    public function handle(Request $request, Closure $next)
    {
        // Get all path segments
        $pathSegments = array_filter(explode('/', trim($request->path(), '/')));

        if (empty($pathSegments)) {
            return response()->json(['message' => 'Tenant ID required'], 400);
        }

        $segments = array_values($pathSegments);

        // Skip the 'api' prefix if it exists
        $tenantIndex = 0;
        if (!empty($segments) && $segments[0] === 'api') {
            $tenantIndex = 1;
        }

        if (!isset($segments[$tenantIndex])) {
            return response()->json(['message' => 'Tenant ID required'], 400);
        }

        $tenantIdentifier = $segments[$tenantIndex];

        // Try to find tenant by ID
        $tenant = Tenant::find($tenantIdentifier);

        if (!$tenant) {
            return response()->json([
                'message' => "Tenant not found: {$tenantIdentifier}",
            ], 404);
        }

        // Initialize tenancy and run the request within tenant context
        // $tenant->run() properly invokes all bootstrappers including DatabaseTenancyBootstrapper
        // BUT we need to explicitly configure the tenant connection database name
        $tenantDbName = config('tenancy.database.prefix') . $tenant->id;

        \Log::info("InitializeTenancyByPathMiddleware: Tenant ID={$tenantIdentifier}, DB={$tenantDbName}");

        // Configure the tenant connection with the actual database name
        config(['database.connections.tenant.database' => $tenantDbName]);

        return $tenant->run(function () use ($next, $request, $tenantDbName) {
            // Force database connection purge to use the new config
            \Illuminate\Support\Facades\DB::purge('tenant');
            \Illuminate\Support\Facades\DB::reconnect('tenant');

            $currentDb = \Illuminate\Support\Facades\DB::connection('tenant')->getDatabaseName();
            \Log::info("InitializeTenancyByPathMiddleware: After reconnect, Current DB={$currentDb}");

            return $next($request);
        });
    }
}
