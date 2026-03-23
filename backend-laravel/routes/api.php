<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\StockController;
use App\Http\Controllers\Api\Admin\StoreSettingController;
use App\Http\Controllers\Api\PublicApi\PublicBannerController;
use App\Http\Controllers\Api\PublicApi\PublicCategoryController;
use App\Http\Controllers\Api\PublicApi\PublicProductController;
use App\Http\Controllers\Api\PublicApi\PublicStoreController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/public')->group(function (): void {
    Route::get('/store', [PublicStoreController::class, 'show']);
    Route::get('/categories', [PublicCategoryController::class, 'index']);
    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/{product:slug}', [PublicProductController::class, 'show']);
    Route::get('/banners', [PublicBannerController::class, 'index']);
});

Route::prefix('v1/admin')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin.active'])->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('products', ProductController::class);
        Route::post('/products/{product}/images', [ProductController::class, 'uploadImage']);
        Route::put('/products/{product}/stock', [StockController::class, 'update']);

        Route::apiResource('banners', BannerController::class);

        Route::get('/store-settings', [StoreSettingController::class, 'show']);
        Route::put('/store-settings', [StoreSettingController::class, 'update']);
    });
});
