<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User Routes (Tenant Context)
|--------------------------------------------------------------------------
|
| Routes for user management within a tenant.
| All routes require authentication.
|
*/

// Test endpoint to check if auth middleware is working
Route::middleware('tenant-sanctum')->get('/test-auth', [\App\Http\Controllers\Api\TestAuthController::class, 'test']);

Route::middleware('tenant-sanctum')->group(function () {
    // View all users (any authenticated user can view)
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{user}', [UserController::class, 'show']);
    // Create user (admin only)
    Route::post('/', [UserController::class, 'store'])->middleware('role:admin');
    // Delete user (admin only)
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('role:admin');
});
