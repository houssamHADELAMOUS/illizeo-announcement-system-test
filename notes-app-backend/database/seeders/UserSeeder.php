<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Stancl\Tenancy\Database\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $domain = Domain::where('tenant_id', $tenant->id)->first();

            if ($domain) {
                User::firstOrCreate([
                    'email' => 'admin@' . $domain->domain,
                ], [
                    'tenant_id' => $tenant->id,
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                ]);

                User::firstOrCreate([
                    'email' => 'user@' . $domain->domain,
                ], [
                    'tenant_id' => $tenant->id,
                    'name' => 'Test User',
                    'password' => Hash::make('password'),
                ]);
            }
        }
    }
}
