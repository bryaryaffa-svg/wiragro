<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\B2BInquiryController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ProductReviewController;
use App\Http\Controllers\Api\Admin\StockController;
use App\Http\Controllers\Api\Admin\StoreSettingController;
use App\Http\Controllers\Api\Customer\CustomerAuthController;
use App\Http\Controllers\Api\Customer\CustomerB2BInquiryController;
use App\Http\Controllers\Api\Customer\CustomerCompatController;
use App\Http\Controllers\Api\Customer\CustomerProductReviewController;
use App\Http\Controllers\Api\Customer\CustomerPaymentController;
use App\Http\Controllers\Api\Customer\CustomerWishlistController;
use App\Http\Controllers\Api\Customer\GuestCartController;
use App\Http\Controllers\Api\Customer\GuestCheckoutController;
use App\Http\Controllers\Api\Customer\GuestOrderController;
use App\Http\Controllers\Api\PublicApi\PublicProductReviewController;
use App\Http\Controllers\Api\Customer\ShippingController;
use App\Http\Controllers\Api\PublicApi\PublicBannerController;
use App\Http\Controllers\Api\PublicApi\PublicCategoryController;
use App\Http\Controllers\Api\PublicApi\PublicProductController;
use App\Http\Controllers\Api\PublicApi\PublicStoreController;
use App\Http\Controllers\Api\Storefront\StorefrontCompatController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/public')->group(function (): void {
    Route::get('/store', [PublicStoreController::class, 'show']);
    Route::get('/categories', [PublicCategoryController::class, 'index']);
    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/{product:slug}', [PublicProductController::class, 'show']);
    Route::get('/products/{product:slug}/reviews', [PublicProductReviewController::class, 'index']);
    Route::get('/banners', [PublicBannerController::class, 'index']);
});

Route::prefix('v1/storefront')->group(function (): void {
    Route::get('/stores', [StorefrontCompatController::class, 'stores']);
    Route::get('/home', [StorefrontCompatController::class, 'home']);
    Route::get('/categories', [StorefrontCompatController::class, 'categories']);
    Route::get('/products', [StorefrontCompatController::class, 'products']);
    Route::get('/products/{slug}', [StorefrontCompatController::class, 'productDetail']);
    Route::get('/articles', [StorefrontCompatController::class, 'articles']);
    Route::get('/articles/{slug}', [StorefrontCompatController::class, 'articleDetail']);
    Route::get('/pages', [StorefrontCompatController::class, 'pages']);
    Route::get('/pages/{slug}', [StorefrontCompatController::class, 'pageDetail']);
});

Route::prefix('v1/customer')->group(function (): void {
    Route::post('/auth/google', [CustomerAuthController::class, 'loginGoogle']);
    Route::post('/auth/reseller/activate/check', [CustomerAuthController::class, 'checkResellerActivation']);
    Route::post('/auth/reseller/set-password', [CustomerAuthController::class, 'setResellerPassword']);
    Route::post('/auth/reseller/login', [CustomerAuthController::class, 'loginReseller']);
    Route::post('/auth/whatsapp/request-otp', [CustomerAuthController::class, 'requestOtp']);
    Route::post('/auth/whatsapp/verify-otp', [CustomerAuthController::class, 'verifyOtp']);
    Route::post('/b2b-inquiries', [CustomerB2BInquiryController::class, 'store']);

    Route::post('/carts/guest', [GuestCartController::class, 'create']);
    Route::get('/carts/current', [GuestCartController::class, 'current']);
    Route::post('/carts/items', [GuestCartController::class, 'addItem']);
    Route::patch('/carts/items/{item}', [GuestCartController::class, 'updateItem']);
    Route::get('/shipping/destinations', [ShippingController::class, 'destinations']);
    Route::post('/shipping/rates', [ShippingController::class, 'rates']);

    Route::post('/checkout/guest', [GuestCheckoutController::class, 'store']);
    Route::post('/payments/duitku/create', [CustomerPaymentController::class, 'create']);

    Route::get('/orders/track', [GuestOrderController::class, 'track']);

    Route::middleware('customer.auth')->group(function (): void {
        Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);
        Route::get('/me', [CustomerCompatController::class, 'me']);
        Route::patch('/me', [CustomerCompatController::class, 'updateMe']);
        Route::get('/me/addresses', [CustomerCompatController::class, 'listAddresses']);
        Route::post('/me/addresses', [CustomerCompatController::class, 'createAddress']);
        Route::patch('/me/addresses/{addressId}', [CustomerCompatController::class, 'updateAddress']);
        Route::delete('/me/addresses/{addressId}', [CustomerCompatController::class, 'deleteAddress']);
        Route::get('/wishlist', [CustomerWishlistController::class, 'index']);
        Route::post('/wishlist/items', [CustomerWishlistController::class, 'store']);
        Route::delete('/wishlist/items/{productId}', [CustomerWishlistController::class, 'destroy']);
        Route::get('/carts/me', [CustomerCompatController::class, 'cart']);
        Route::post('/carts/me/items', [CustomerCompatController::class, 'addCartItem']);
        Route::patch('/carts/me/items/{itemId}', [CustomerCompatController::class, 'updateCartItem']);
        Route::post('/checkout/me', [CustomerCompatController::class, 'checkout']);
        Route::get('/orders/me', [CustomerCompatController::class, 'orders']);
        Route::get('/orders/me/{orderId}', [CustomerCompatController::class, 'orderDetail']);
        Route::post('/payments/duitku/create/me', [CustomerPaymentController::class, 'createForCurrentCustomer']);
        Route::get('/products/{product}/review-status', [CustomerProductReviewController::class, 'status']);
        Route::post('/products/{product}/reviews', [CustomerProductReviewController::class, 'store']);
    });

    Route::get('/orders/{orderNumber}', [GuestOrderController::class, 'show']);
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
        Route::get('/reviews', [ProductReviewController::class, 'index']);
        Route::patch('/reviews/{review}', [ProductReviewController::class, 'update']);
        Route::get('/b2b-inquiries', [B2BInquiryController::class, 'index']);
        Route::patch('/b2b-inquiries/{inquiry}', [B2BInquiryController::class, 'update']);

        Route::get('/store-settings', [StoreSettingController::class, 'show']);
        Route::put('/store-settings', [StoreSettingController::class, 'update']);
    });
});
