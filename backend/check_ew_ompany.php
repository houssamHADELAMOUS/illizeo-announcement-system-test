<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check what tenants exist
echo "=== Tenants ===\n";
$tenants = \App\Models\Tenant::all();
foreach ($tenants as $tenant) {
    echo "ID: {$tenant->id}, Name: {$tenant->name}\n";
}

// Now check ew_ompany tenant specifically
$tenant = \App\Models\Tenant::where('id', 'ew_ompany')->first();
if ($tenant) {
    echo "\n=== ew_ompany Tenant Users ===\n";
    $tenant->run(function() {
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            echo "  - ID: {$user->id}, Email: {$user->email}, Role: {$user->role}\n";

            // Get tokens for this user
            $tokens = DB::table('personal_access_tokens')
                ->where('tokenable_id', $user->id)
                ->where('tokenable_type', 'App\\Models\\User')
                ->get();

            foreach ($tokens as $token) {
                echo "    Token: {$token->name}\n";
            }
        }
    });
} else {
    echo "Tenant ew_ompany not found\n";
}
