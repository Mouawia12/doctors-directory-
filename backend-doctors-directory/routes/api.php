<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\CategoryController as PublicCategoryController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorMediaController;
use App\Http\Controllers\DoctorProfileController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('google', [SocialAuthController::class, 'google']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::get('doctors', [DoctorController::class, 'index']);
Route::get('doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('categories', [PublicCategoryController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('doctors/{doctor}/favorite', [FavoriteController::class, 'store']);
    Route::delete('doctors/{doctor}/favorite', [FavoriteController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:doctor'])->prefix('doctor')->group(function (): void {
    Route::get('profile', [DoctorProfileController::class, 'show']);
    Route::post('profile', [DoctorProfileController::class, 'store']);
    Route::post('media', [DoctorMediaController::class, 'store']);
    Route::delete('media/{media}', [DoctorMediaController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function (): void {
    Route::apiResource('doctors', AdminDoctorController::class)->except(['create', 'edit']);
    Route::post('doctors/{doctor}/approve', [AdminDoctorController::class, 'approve']);
    Route::post('doctors/{doctor}/reject', [AdminDoctorController::class, 'reject']);
    Route::apiResource('categories', AdminCategoryController::class)->except(['show', 'create', 'edit']);
});
