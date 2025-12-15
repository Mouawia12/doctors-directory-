<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\CategoryController as PublicCategoryController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorMediaController;
use App\Http\Controllers\DoctorProfileController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
Route::post('reset-password', [NewPasswordController::class, 'store']);

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('google', [SocialAuthController::class, 'google']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::put('password', [AuthController::class, 'updatePassword'])->middleware('auth:sanctum');
});

Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('email/verification-notification', [EmailVerificationNotificationController::class, 'store']);

Route::get('settings', [SettingController::class, 'index']);
Route::get('doctors', [DoctorController::class, 'index']);
Route::get('doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('categories', [PublicCategoryController::class, 'index']);
Route::post('newsletter', [NewsletterSubscriptionController::class, 'store']);

Route::middleware(['auth:sanctum', 'verified'])->group(function (): void {
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('doctors/{doctor}/favorite', [FavoriteController::class, 'store']);
    Route::delete('doctors/{doctor}/favorite', [FavoriteController::class, 'destroy']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});

Route::middleware(['auth:sanctum', 'verified'])->post('doctor/join', [DoctorProfileController::class, 'join']);

Route::middleware(['auth:sanctum', 'verified', 'role:doctor'])->prefix('doctor')->group(function (): void {
    Route::get('profile', [DoctorProfileController::class, 'show']);
    Route::post('profile', [DoctorProfileController::class, 'store']);
    Route::post('media', [DoctorMediaController::class, 'store']);
    Route::delete('media/{media}', [DoctorMediaController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified', 'role:admin'])->prefix('admin')->group(function (): void {
    Route::apiResource('doctors', AdminDoctorController::class)->except(['create', 'edit']);
    Route::post('doctors/{doctor}/approve', [AdminDoctorController::class, 'approve']);
    Route::post('doctors/{doctor}/reject', [AdminDoctorController::class, 'reject']);
    Route::apiResource('categories', AdminCategoryController::class)->except(['show', 'create', 'edit']);
    Route::get('users', [AdminUserController::class, 'index']);
    Route::post('users/{user}/status', [AdminUserController::class, 'updateStatus']);
    Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']);
    Route::get('settings', [AdminSiteSettingController::class, 'show']);
    Route::post('settings', [AdminSiteSettingController::class, 'update']);
    Route::get('newsletter-subscriptions', [\App\Http\Controllers\Admin\NewsletterSubscriptionController::class, 'index']);
});
