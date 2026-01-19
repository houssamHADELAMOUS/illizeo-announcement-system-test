<?php

use App\Http\Controllers\Api\AnnouncementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Announcement Routes (Tenant Context)
|--------------------------------------------------------------------------
|
| Routes for announcement management within a tenant.
| All routes require authentication.
| Update/Delete are protected by AnnouncementPolicy (only author can modify).
|
*/

Route::middleware('tenant-sanctum')->group(function () {
    // List all announcements (with optional status filter)
    Route::get('/', [AnnouncementController::class, 'index']);

    // Get current user's announcements
    Route::get('/my', [AnnouncementController::class, 'myAnnouncements']);

    // Get other users' announcements (admin only)
    Route::get('/users', [AnnouncementController::class, 'userAnnouncements']);

    // CRUD operations
    Route::post('/', [AnnouncementController::class, 'store']);
    Route::get('/{id}', [AnnouncementController::class, 'show']);
    Route::put('/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/{id}', [AnnouncementController::class, 'destroy']);
});
