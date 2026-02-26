<?php

use App\Http\Controllers\SavedMediaController;
use App\Http\Controllers\TmdbController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// CSRF cookie for SPA (call before login/register)
Route::get('/sanctum/csrf-cookie', [\Laravel\Sanctum\Http\Controllers\CsrfCookieController::class, 'show']);

// Public TMDB proxy (trending, search, details - no auth required for discovery)
Route::prefix('tmdb')->group(function () {
    Route::get('/trending', [TmdbController::class, 'trending']);
    Route::get('/search', [TmdbController::class, 'search']);
    Route::get('/movie/{id}', [TmdbController::class, 'movie']);
    Route::get('/tv/{id}', [TmdbController::class, 'tv']);
});

// Auth required
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);

    Route::prefix('saved')->group(function () {
        Route::get('/', [SavedMediaController::class, 'index']);
        Route::post('/', [SavedMediaController::class, 'store']);
        Route::put('/{id}', [SavedMediaController::class, 'update']);
        Route::delete('/{id}', [SavedMediaController::class, 'destroy']);
    });
});
