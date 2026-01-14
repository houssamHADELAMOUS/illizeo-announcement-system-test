<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Stancl\Tenancy\Database\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = [
            [
                'name' => 'Acme Corp',
                'domain' => 'acme',
                'data' => [
                    'company_name' => 'Acme Corporation',
                    'plan' => 'premium'
                ]
            ],
            [
                'name' => 'TechStart Inc',
                'domain' => 'techstart',
                'data' => [
                    'company_name' => 'TechStart Inc',
                    'plan' => 'basic'
                ]
            ],
            [
                'name' => 'HDSCoders',
                'domain' => 'hdscoders',
                'data' => [
                    'company_name' => 'HDSCoders Company',
                    'plan' => 'premium'
                ]
            ]
        ];

        foreach ($companies as $company) {
            if (!Tenant::find($company['domain'])) {
                $tenant = Tenant::create([
                    'id' => $company['domain'],
                    'data' => $company['data']
                ]);

                Domain::create([
                    'domain' => $company['domain'] . '.localhost',
                    'tenant_id' => $tenant->id
                ]);
            }
        }
    }
}
