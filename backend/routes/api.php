<?php

use Illuminate\Support\Facades\Route;

// Path-based tenant routes (for testing with 127.0.0.1)
// Access via: http://127.0.0.1:8000/{tenant-id}/api/auth/login
Route::prefix('{tenant_id}')->middleware([
    \App\Http\Middleware\InitializeTenancyByPathMiddleware::class,
    'api',
])->group(function () {
    // Test endpoint
    Route::get('/test', [\App\Http\Controllers\Api\TenantTestController::class, 'test']);

    // Authentication routes
    Route::prefix('auth')->group(base_path('routes/api/auth.php'));

    // User routes
    Route::prefix('users')->group(base_path('routes/api/user.php'));

    // Admin routes
    Route::group([], base_path('routes/api/admin.php'));

    // Announcement routes
    Route::prefix('announcements')->group(base_path('routes/api/announcement.php'));
});

// Central routes (tenant registration and management)
Route::prefix('tenants')->group(base_path('routes/api/tenant.php'));

// Central authentication routes
Route::prefix('auth')->group(base_path('routes/api/auth.php'));

// Central admin routes
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(base_path('routes/api/admin.php'));

// Central user routes
Route::prefix('user')->middleware(['auth:sanctum'])->group(base_path('routes/api/user.php'));

// Central announcement routes
Route::prefix('announcements')->group(base_path('routes/api/announcement.php'));

