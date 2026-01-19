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
    Route::get('/', [AnnouncementController::class, 'index']);
    Route::post('/', [AnnouncementController::class, 'store']);
    Route::get('/{announcement}', [AnnouncementController::class, 'show']);
    Route::put('/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/{announcement}', [AnnouncementController::class, 'destroy']);
});
