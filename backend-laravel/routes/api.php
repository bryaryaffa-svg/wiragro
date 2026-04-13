<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\StockController;
use App\Http\Controllers\Api\Admin\StoreSettingController;
use App\Http\Controllers\Api\Customer\CustomerAuthController;
use App\Http\Controllers\Api\Customer\CustomerPaymentController;
use App\Http\Controllers\Api\Customer\CustomerWishlistController;
use App\Http\Controllers\Api\Customer\GuestCartController;
use App\Http\Controllers\Api\Customer\GuestCheckoutController;
use App\Http\Controllers\Api\Customer\GuestOrderController;
use App\Http\Controllers\Api\Customer\ShippingController;
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

Route::prefix('v1/customer')->group(function (): void {
    Route::post('/auth/google', [CustomerAuthController::class, 'loginGoogle']);
    Route::post('/auth/whatsapp/request-otp', [CustomerAuthController::class, 'requestOtp']);
    Route::post('/auth/whatsapp/verify-otp', [CustomerAuthController::class, 'verifyOtp']);

    Route::post('/carts/guest', [GuestCartController::class, 'create']);
    Route::get('/carts/current', [GuestCartController::class, 'current']);
    Route::post('/carts/items', [GuestCartController::class, 'addItem']);
    Route::patch('/carts/items/{item}', [GuestCartController::class, 'updateItem']);
    Route::get('/shipping/destinations', [ShippingController::class, 'destinations']);
    Route::post('/shipping/rates', [ShippingController::class, 'rates']);

    Route::post('/checkout/guest', [GuestCheckoutController::class, 'store']);
    Route::post('/payments/duitku/create', [CustomerPaymentController::class, 'create']);

    Route::get('/orders/track', [GuestOrderController::class, 'track']);
    Route::get('/orders/{orderNumber}', [GuestOrderController::class, 'show']);

    Route::middleware('customer.auth')->group(function (): void {
        Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);
        Route::get('/wishlist', [CustomerWishlistController::class, 'index']);
        Route::post('/wishlist/items', [CustomerWishlistController::class, 'store']);
        Route::delete('/wishlist/items/{productId}', [CustomerWishlistController::class, 'destroy']);
        Route::post('/payments/duitku/create/me', [CustomerPaymentController::class, 'createForCurrentCustomer']);
    });
});

Route::post('v1/payments/duitku/callback', [CustomerPaymentController::class, 'callback']);

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
