<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Find the tenant
$tenant = \App\Models\Tenant::where('id', 'ech_low_nc_1')->first();

if (!$tenant) {
    echo "Tenant not found\n";
    exit(1);
}

// Run migrations for the tenant
$tenant->run(function () use ($app) {
    $migrator = $app->make('migrator');
    $migrator->run([
        'database/migrations/tenant'
    ]);
    echo "Migrations completed for tenant ech_low_nc_1\n";
});
