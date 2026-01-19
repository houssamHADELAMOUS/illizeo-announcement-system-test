<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Database\Models\Domain;

class TenantController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|email|unique:tenants,email',
            'domain' => 'required|string|unique:domains,domain',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email',
            'admin_password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Step 1: Generate tenant ID
            $tenantId = $this->generateTenantId($request->company_name);
            $tenantDbName = config('tenancy.database.prefix') . $tenantId;

            \Log::info("Creating tenant: {$tenantId} with database: {$tenantDbName}");

            // Step 2: Create tenant record in central database
            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => $request->company_name,
                'email' => $request->company_email,
            ]);

            // Step 3: Create domain association
            Domain::create([
                'domain' => $request->domain,
                'tenant_id' => $tenantId,
            ]);

            // Step 4: CREATE THE DATABASE FIRST
            $this->createTenantDatabase($tenantDbName);

            // Step 5: IMPORTANT - Configure tenant connection BEFORE initializing
            // Update the tenant connection config with the actual database name
            config(['database.connections.tenant.database' => $tenantDbName]);

            // Step 6: Now initialize tenancy with the properly configured connection
            \Stancl\Tenancy\Facades\Tenancy::initialize($tenant);

            // Step 7: Run migrations in tenant context
            try {
                // First, purge and reconnect to ensure we're using the new config
                DB::purge('tenant');
                DB::reconnect('tenant');

                \Log::info("Running migrations for tenant database: " . DB::connection('tenant')->getDatabaseName());

                // Run migrations
                \Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                ]);

                // Create admin user in the TENANT database, not central
                \App\Models\User::on('tenant')->create([
                    'name' => $request->admin_name,
                    'email' => $request->admin_email,
                    'password' => Hash::make($request->admin_password),
                    'role' => 'admin',
                ]);

                \Log::info("Tenant setup completed successfully for: {$tenantId}");

            } finally {
                // End tenant context
                \Stancl\Tenancy\Facades\Tenancy::end();
            }

            return response()->json([
                'message' => 'Tenant created successfully',
                'tenant' => $tenant,
                'domain' => $request->domain,
                'database' => $tenantDbName,
                'admin' => [
                    'email' => $request->admin_email,
                    'password' => $request->admin_password, // Use the actual password sent
                    'note' => 'Use the password you provided during tenant creation to login',
                ],
            ], 201);

        } catch (\Exception $e) {
            // Clean up on failure
            if (isset($tenant)) {
                try {
                    Domain::where('tenant_id', $tenantId)->delete();
                    $tenant->delete();

                    if (isset($tenantDbName)) {
                        DB::connection('mysql')->statement("DROP DATABASE IF EXISTS `$tenantDbName`");
                        \Log::info("Cleaned up failed tenant database: $tenantDbName");
                    }
                } catch (\Exception $cleanupError) {
                    \Log::error("Cleanup failed: " . $cleanupError->getMessage());
                }
            }

            \Log::error("Tenant creation failed: " . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Tenant creation failed',
                'error' => $e->getMessage(),
                'database_name' => $tenantDbName ?? 'not_set',
            ], 500);
        }
    }

    private function generateTenantId(string $companyName): string
    {
        $id = strtolower(preg_replace('/[^a-z0-9]/', '_', $companyName));
        $id = preg_replace('/_+/', '_', $id);
        $id = trim($id, '_');

        // Make unique
        $originalId = $id;
        $counter = 1;

        while (Tenant::where('id', $id)->exists()) {
            $id = $originalId . '_' . $counter;
            $counter++;
        }

        return $id;
    }

    /**
     * Create the tenant database manually
     */
    private function createTenantDatabase(string $databaseName): void
    {
        try {
            \Log::info("Creating database: {$databaseName}");

            // Create the database
            DB::connection('mysql')->statement("CREATE DATABASE IF NOT EXISTS `{$databaseName}`
                CHARACTER SET utf8mb4
                COLLATE utf8mb4_0900_ai_ci");

            // Verify it was created
            $result = DB::connection('mysql')->select(
                "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
                [$databaseName]
            );

            if (empty($result)) {
                throw new \Exception("Database creation verification failed - database '{$databaseName}' was not created");
            }

            \Log::info("Database created successfully: {$databaseName}");

        } catch (\Exception $e) {
            \Log::error("Failed to create database '{$databaseName}': " . $e->getMessage());
            throw new \Exception("Failed to create tenant database '{$databaseName}': " . $e->getMessage());
        }
    }
}
