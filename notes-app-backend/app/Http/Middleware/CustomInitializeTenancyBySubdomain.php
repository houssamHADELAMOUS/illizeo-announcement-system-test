<?php

namespace App\Http\Middleware;

use Closure;
use Stancl\Tenancy\Database\Models\Domain;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedException;

class CustomInitializeTenancyBySubdomain
{
    public function handle($request, Closure $next)
    {
        $subdomain = $request->header('X-Tenant');

        if (!$subdomain) {
            throw new TenantCouldNotBeIdentifiedException('No X-Tenant header');
        }

        $domain = Domain::where('domain', $subdomain . '.localhost')->first();

        if ($domain) {
            tenancy()->initialize($domain->tenant);
        } else {
            throw new TenantCouldNotBeIdentifiedException($subdomain);
        }

        return $next($request);
    }
}
