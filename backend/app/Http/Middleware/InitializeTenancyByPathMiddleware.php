<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;
use App\Models\Tenant;

class InitializeTenancyByPathMiddleware
{
    // handle tenant initialization from url path
    public function handle(Request $request, Closure $next)
    {
        $pathSegments = array_filter(explode('/', trim($request->path(), '/')));

        if (empty($pathSegments)) {
            return response()->json(['message' => 'Tenant ID required'], 400);
        }

        $segments = array_values($pathSegments);

        $tenantIndex = 0;
        if (!empty($segments) && $segments[0] === 'api') {
            $tenantIndex = 1;
        }

        if (!isset($segments[$tenantIndex])) {
            return response()->json(['message' => 'Tenant ID required'], 400);
        }

        $tenantIdentifier = $segments[$tenantIndex];

        $tenant = Tenant::find($tenantIdentifier);

        if (!$tenant) {
            $domain = \Stancl\Tenancy\Database\Models\Domain::where('domain', $tenantIdentifier)->first();
            if ($domain) {
                $tenant = Tenant::find($domain->tenant_id);
            }
        }

        if (!$tenant) {
            return response()->json([
                'message' => "Tenant not found: {$tenantIdentifier}",
            ], 404);
        }

        $tenantDbName = config('tenancy.database.prefix') . $tenant->id;

        \Log::info("tenant path middleware: id={$tenantIdentifier}, db={$tenantDbName}");

        config(['database.connections.tenant.database' => $tenantDbName]);

        return $tenant->run(function () use ($next, $request, $tenantDbName) {
            \Illuminate\Support\Facades\DB::purge('tenant');
            \Illuminate\Support\Facades\DB::reconnect('tenant');

            $currentDb = \Illuminate\Support\Facades\DB::connection('tenant')->getDatabaseName();
            \Log::info("tenant path middleware: current db={$currentDb}");

            return $next($request);
        });
    }
}
