<?php

namespace App\Domain\Tenant\Services;

use App\Domain\Tenant\DTOs\CreateTenantDTO;
use App\Domain\Tenant\DTOs\TenantDTO;
use App\Domain\Tenant\Repositories\TenantRepository;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    public function __construct(
        private TenantRepository $tenantRepository
    ) {}

    /**
     * Get all tenants
     */
    public function getAllTenants(): array
    {
        return $this->tenantRepository->all()
            ->map(fn(Tenant $tenant) => TenantDTO::fromModel($tenant)->toArray())
            ->toArray();
    }

    /**
     * Get tenant by ID
     */
    public function getTenantById(string $id): TenantDTO
    {
        $tenant = $this->tenantRepository->findOrFail($id);
        return TenantDTO::fromModel($tenant);
    }

    /**
     * Create new tenant with admin user
     */
    public function createTenant(CreateTenantDTO $dto): TenantDTO
    {
        // Create tenant
        $tenant = $this->tenantRepository->create([
            'id' => Str::uuid()->toString(),
            'name' => $dto->companyName,
            'email' => $dto->companyEmail,
        ]);

        // Create domain for tenant
        $tenant->domains()->create([
            'domain' => $dto->domain,
        ]);

        // CRITICAL: Create the tenant database before trying to use it
        $tenantDbName = config('tenancy.database.prefix') . $tenant->id;
        $this->createTenantDatabase($tenantDbName);

        // Create admin user in tenant context with database setup
        $tenant->run(function () use ($dto, $tenantDbName) {
            // Configure tenant connection to use this tenant's database
            config(['database.connections.tenant.database' => $tenantDbName]);
            \Illuminate\Support\Facades\DB::purge('tenant');
            \Illuminate\Support\Facades\DB::reconnect('tenant');

            // Run migrations first to create tables
            \Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            // Now create the admin user in the tenant database
            User::on('tenant')->create([
                'name' => $dto->adminName,
                'email' => $dto->adminEmail,
                'password' => Hash::make($dto->adminPassword),
                'role' => 'admin',
            ]);
        });

        return TenantDTO::fromModel($tenant->load('domains'));
    }

    /**
     * Create the tenant database in MySQL
     */
    private function createTenantDatabase(string $databaseName): void
    {
        DB::connection('mysql')->statement(
            "CREATE DATABASE IF NOT EXISTS `{$databaseName}` COLLATE 'utf8mb4_0900_ai_ci'"
        );
    }

    /**
     * Delete tenant
     */
    public function deleteTenant(string $id): bool
    {
        return $this->tenantRepository->delete($id);
    }
}
