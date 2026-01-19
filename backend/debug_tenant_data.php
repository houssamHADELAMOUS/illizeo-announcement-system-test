<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tenant = \App\Models\Tenant::where('id', 'ew_ompany')->first();
if ($tenant) {
    $tenant->run(function() {
        echo "=== Users in tenant database ===\n";
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            echo "  - ID: {$user->id}, Email: {$user->email}, Role: {$user->role}\n";
        }

        echo "\n=== Personal Access Tokens ===\n";
        $tokens = DB::table('personal_access_tokens')->get();
        foreach ($tokens as $token) {
            echo "  - ID: {$token->id}, Name: {$token->name}, Tokenable ID: {$token->tokenable_id}\n";
        }
    });
} else {
    echo "Tenant not found\n";
}
