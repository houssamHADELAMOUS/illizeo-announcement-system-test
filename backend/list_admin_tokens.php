<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tenant = \App\Models\Tenant::where('id', 'ew_ompany')->first();
if ($tenant) {
    $tenant->run(function() {
        echo "=== Admin Users in tenant_ew_ompany ===\n";
        $admins = DB::table('users')
            ->where('role', 'admin')
            ->get();

        foreach ($admins as $admin) {
            echo "\nAdmin: {$admin->email} (ID: {$admin->id})\n";

            $tokens = DB::table('personal_access_tokens')
                ->where('tokenable_id', $admin->id)
                ->where('tokenable_type', 'App\\Models\\User')
                ->get();

            echo "  Tokens:\n";
            foreach ($tokens as $token) {
                // Show first part of token
                echo "    - {$token->name}: " . substr($token->token, 0, 30) . "...\n";
            }

            if ($tokens->isEmpty()) {
                echo "  No tokens found\n";
            }
        }
    });
} else {
    echo "Tenant not found\n";
}
