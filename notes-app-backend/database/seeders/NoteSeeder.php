<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Note;
use App\Models\User;
use Stancl\Tenancy\Database\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $users = User::where('tenant_id', $tenant->id)->get();

            foreach ($users as $user) {
                Note::firstOrCreate([
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'title' => 'Welcome Note',
                ], [
                    'content' => 'This is your first note in ' . ($tenant->data['company_name'] ?? 'the company') . '.',
                ]);

                Note::firstOrCreate([
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'title' => 'Meeting Notes',
                ], [
                    'content' => 'Notes from the team meeting on project updates.',
                ]);
            }
        }
    }
}
