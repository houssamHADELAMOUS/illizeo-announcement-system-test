<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$hashToFind = '253896ab3e0da55044f61093e698c32e4acf2fbd37602c8c90c1e8e48daa0d73';

echo "Looking for token hash: $hashToFind\n\n";

// Set tenant database
$tenantDbName = 'tenant_ew_ompany';
config(['database.connections.tenant.database' => $tenantDbName]);
\Illuminate\Support\Facades\DB::purge('tenant');
\Illuminate\Support\Facades\DB::reconnect('tenant');

$currentDb = \Illuminate\Support\Facades\DB::connection('tenant')->getDatabaseName();
echo "Current DB: $currentDb\n\n";

// Query with exact token
$token = \Illuminate\Support\Facades\DB::connection('tenant')
    ->table('personal_access_tokens')
    ->where('token', $hashToFind)
    ->first();

if ($token) {
    echo "✓ Token FOUND!\n";
    echo "  ID: {$token->id}\n";
    echo "  Name: {$token->name}\n";
    echo "  Tokenable ID: {$token->tokenable_id}\n";
} else {
    echo "✗ Token NOT found\n";

    // List all tokens to compare
    echo "\nAll tokens in database:\n";
    $allTokens = \Illuminate\Support\Facades\DB::connection('tenant')
        ->table('personal_access_tokens')
        ->get();

    foreach ($allTokens as $t) {
        echo "  ID: {$t->id}, Hash: {$t->token}\n";
        if ($t->token === $hashToFind) {
            echo "    ^^^ THIS MATCHES!\n";
        }
    }
}
