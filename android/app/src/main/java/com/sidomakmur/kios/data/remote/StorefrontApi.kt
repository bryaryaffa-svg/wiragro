package com.sidomakmur.kios.data.remote

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface StorefrontApi {
    @GET("storefront/stores")
    suspend fun getStores(): StoreListResponse

    @GET("storefront/home")
    suspend fun getHome(
        @Query("store_code") storeCode: String,
    ): HomeResponse

    @GET("storefront/categories")
    suspend fun getCategories(
        @Query("store_code") storeCode: String,
    ): CategoryListResponse

    @GET("storefront/products")
    suspend fun getProducts(
        @Query("store_code") storeCode: String,
        @Query("q") query: String? = null,
        @Query("category_slug") categorySlug: String? = null,
        @Query("sort") sort: String = "latest",
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 12,
        @Query("member_level") memberLevel: String? = null,
    ): ProductListResponse

    @GET("storefront/products/{slug}")
    suspend fun getProductDetail(
        @Path("slug") slug: String,
        @Query("store_code") storeCode: String,
        @Query("member_level") memberLevel: String? = null,
    ): ProductDetailResponse

    @GET("storefront/articles")
    suspend fun getArticles(
        @Query("store_code") storeCode: String,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 10,
        @Query("q") query: String? = null,
    ): ArticleListResponse

    @GET("storefront/articles/{slug}")
    suspend fun getArticleDetail(
        @Path("slug") slug: String,
        @Query("store_code") storeCode: String,
    ): ArticleDetailResponse

    @GET("storefront/pages")
    suspend fun getPages(
        @Query("store_code") storeCode: String,
    ): StaticPageListResponse

    @GET("storefront/pages/{slug}")
    suspend fun getPageDetail(
        @Path("slug") slug: String,
        @Query("store_code") storeCode: String,
    ): StaticPageDetailResponse

    @POST("customer/auth/google")
    suspend fun loginGoogle(
        @Body payload: GoogleLoginRequest,
    ): CustomerSession

    @POST("customer/auth/reseller/activate/check")
    suspend fun checkResellerActivation(
        @Body payload: ResellerActivationRequest,
    ): ResellerActivationResponse

    @POST("customer/auth/reseller/set-password")
    suspend fun setResellerPassword(
        @Body payload: ResellerSetPasswordRequest,
    ): ResellerPasswordResponse

    @POST("customer/auth/reseller/login")
    suspend fun loginReseller(
        @Body payload: ResellerLoginRequest,
    ): CustomerSession

    @POST("customer/auth/whatsapp/request-otp")
    suspend fun requestWhatsAppOtp(
        @Body payload: WhatsAppOtpRequest,
    ): WhatsAppOtpChallengeResponse

    @POST("customer/auth/whatsapp/verify-otp")
    suspend fun verifyWhatsAppOtp(
        @Body payload: WhatsAppOtpVerifyRequest,
    ): CustomerSession

    @GET("customer/me")
    suspend fun getMyAccount(
        @Header("Authorization") authorization: String,
    ): CustomerAccountResponse

    @PATCH("customer/me")
    suspend fun updateMyAccount(
        @Header("Authorization") authorization: String,
        @Body payload: ProfileUpdateRequest,
    ): CustomerAccountResponse

    @GET("customer/me/addresses")
    suspend fun getMyAddresses(
        @Header("Authorization") authorization: String,
    ): AddressListResponse

    @POST("customer/me/addresses")
    suspend fun createMyAddress(
        @Header("Authorization") authorization: String,
        @Body payload: AddressUpsertRequest,
    ): SaveAddressResponse

    @PATCH("customer/me/addresses/{addressId}")
    suspend fun updateMyAddress(
        @Header("Authorization") authorization: String,
        @Path("addressId") addressId: String,
        @Body payload: AddressUpsertRequest,
    ): SaveAddressResponse

    @DELETE("customer/me/addresses/{addressId}")
    suspend fun deleteMyAddress(
        @Header("Authorization") authorization: String,
        @Path("addressId") addressId: String,
    ): DeleteAddressResponse

    @GET("customer/wishlist")
    suspend fun getWishlist(
        @Header("Authorization") authorization: String,
    ): WishlistResponse

    @POST("customer/wishlist/items")
    suspend fun addWishlistItem(
        @Header("Authorization") authorization: String,
        @Body payload: WishlistAddRequest,
    ): WishlistMutationResponse

    @DELETE("customer/wishlist/items/{productId}")
    suspend fun removeWishlistItem(
        @Header("Authorization") authorization: String,
        @Path("productId") productId: String,
    ): WishlistMutationResponse

    @GET("customer/carts/me")
    suspend fun getAuthenticatedCart(
        @Header("Authorization") authorization: String,
    ): AuthCartResponse

    @POST("customer/carts/me/items")
    suspend fun addAuthenticatedCartItem(
        @Header("Authorization") authorization: String,
        @Body payload: AuthCartAddItemRequest,
    ): AuthCartResponse

    @PATCH("customer/carts/me/items/{itemId}")
    suspend fun updateAuthenticatedCartItem(
        @Header("Authorization") authorization: String,
        @Path("itemId") itemId: String,
        @Body payload: AuthCartUpdateItemRequest,
    ): AuthCartResponse

    @POST("customer/checkout/me")
    suspend fun submitAuthenticatedCheckout(
        @Header("Authorization") authorization: String,
        @Body payload: AuthCheckoutRequest,
    ): CheckoutResponse

    @POST("customer/payments/duitku/create/me")
    suspend fun createAuthenticatedDuitkuPayment(
        @Header("Authorization") authorization: String,
        @Body payload: DuitkuCreateRequest,
    ): DuitkuCreateResponse

    @GET("customer/orders/me")
    suspend fun getMyOrders(
        @Header("Authorization") authorization: String,
    ): OrderHistoryResponse

    @GET("customer/orders/me/{orderId}")
    suspend fun getMyOrderDetail(
        @Header("Authorization") authorization: String,
        @Path("orderId") orderId: String,
    ): OrderDetailResponse
}
