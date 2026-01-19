<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tenant = \App\Models\Tenant::where('id', 'ech_low_nc_1')->first();
if ($tenant) {
    $tenant->run(function() {
        echo "Migrations in tenant:\n";
        $migrations = DB::table('migrations')->pluck('migration');
        foreach ($migrations as $m) {
            echo "  - $m\n";
        }

        echo "\nTables in database:\n";
        $tables = DB::select('SHOW TABLES');
        foreach ($tables as $table) {
            echo "  - " . array_values((array)$table)[0] . "\n";
        }

        // Check if personal_access_tokens exists
        $hasTable = DB::getSchemaBuilder()->hasTable('personal_access_tokens');
        echo "\npersonal_access_tokens table exists: " . ($hasTable ? 'YES' : 'NO') . "\n";
    });
} else {
    echo "Tenant not found\n";
}
