package com.sidomakmur.kios.data.remote

import com.squareup.moshi.Json

data class HomeResponse(
    val store: StoreInfo = StoreInfo(),
    val banners: List<BannerItem> = emptyList(),
    @Json(name = "featured_products")
    val featuredProducts: List<ProductSummary> = emptyList(),
    @Json(name = "new_arrivals")
    val newArrivals: List<ProductSummary> = emptyList(),
    @Json(name = "best_sellers")
    val bestSellers: List<ProductSummary> = emptyList(),
    @Json(name = "category_highlights")
    val categoryHighlights: List<CategoryHighlight> = emptyList(),
)

data class StoreInfo(
    val code: String = "",
    val name: String = "",
)

data class StoreListResponse(
    val items: List<StoreBranch> = emptyList(),
)

data class StoreBranch(
    val code: String = "",
    val name: String = "",
    val province: String = "",
)

data class BannerItem(
    val title: String = "",
    val subtitle: String? = null,
    @Json(name = "target_url")
    val targetUrl: String? = null,
)

data class CategoryHighlight(
    val name: String = "",
    val slug: String = "",
)

data class CategoryListResponse(
    val items: List<CategoryItem> = emptyList(),
)

data class CategoryItem(
    val id: String = "",
    val name: String = "",
    val slug: String = "",
    @Json(name = "parent_id")
    val parentId: String? = null,
)

data class ProductListResponse(
    val items: List<ProductSummary> = emptyList(),
    val pagination: PaginationPayload = PaginationPayload(),
    @Json(name = "available_filters")
    val availableFilters: ProductFilterPayload = ProductFilterPayload(),
    val seo: StorefrontSeo? = null,
)

data class PaginationPayload(
    val page: Int = 1,
    @Json(name = "page_size")
    val pageSize: Int = 0,
    val count: Int = 0,
)

data class ProductFilterPayload(
    @Json(name = "category_slug")
    val categorySlug: String? = null,
    val sort: String? = null,
)

data class ProductSummary(
    val id: String = "",
    val sku: String = "",
    val slug: String = "",
    val name: String = "",
    val summary: String? = null,
    val description: String? = null,
    @Json(name = "product_type")
    val productType: String = "",
    val unit: String = "",
    @Json(name = "weight_grams")
    val weightGrams: String = "",
    val badges: ProductBadges = ProductBadges(),
    val price: ProductPrice = ProductPrice(),
    val pricing: ProductPricing = ProductPricing(),
    val images: List<ProductImage> = emptyList(),
    val videos: List<ProductVideo> = emptyList(),
    val seo: StorefrontSeo? = null,
)

data class ProductDetailResponse(
    val id: String = "",
    val sku: String = "",
    val slug: String = "",
    val name: String = "",
    val summary: String? = null,
    val description: String? = null,
    @Json(name = "product_type")
    val productType: String = "",
    val unit: String = "",
    @Json(name = "weight_grams")
    val weightGrams: String = "",
    val badges: ProductBadges = ProductBadges(),
    val price: ProductPrice = ProductPrice(),
    val pricing: ProductPricing = ProductPricing(),
    val images: List<ProductImage> = emptyList(),
    val videos: List<ProductVideo> = emptyList(),
    val seo: StorefrontSeo? = null,
    val promotions: List<ProductPromotion> = emptyList(),
    @Json(name = "related_products")
    val relatedProducts: List<ProductSummary> = emptyList(),
    @Json(name = "stock_badge")
    val stockBadge: ProductStockBadge = ProductStockBadge(),
    val detail: String? = null,
)

data class ProductBadges(
    val featured: Boolean = false,
    @Json(name = "new_arrival")
    val newArrival: Boolean = false,
    @Json(name = "best_seller")
    val bestSeller: Boolean = false,
)

data class ProductPricing(
    val mode: String = "retail",
    val label: String? = null,
    val active: ProductPrice = ProductPrice(),
    val retail: ProductPrice = ProductPrice(),
    val reseller: ProductPrice = ProductPrice(),
)

data class ProductPrice(
    val type: String? = null,
    val amount: String? = null,
    @Json(name = "min_qty")
    val minQty: Int? = null,
    @Json(name = "member_level")
    val memberLevel: String? = null,
    val label: String? = null,
)

data class ProductImage(
    val id: String = "",
    val url: String = "",
    @Json(name = "alt_text")
    val altText: String? = null,
    @Json(name = "is_primary")
    val isPrimary: Boolean = false,
)

data class ProductVideo(
    val id: String = "",
    val url: String = "",
    val platform: String = "",
    @Json(name = "thumbnail_url")
    val thumbnailUrl: String? = null,
)

data class StorefrontSeo(
    val title: String? = null,
    val description: String? = null,
    val keywords: String? = null,
)

data class ProductPromotion(
    val code: String = "",
    val name: String = "",
    @Json(name = "rule_payload")
    val rulePayload: Map<String, Any?> = emptyMap(),
)

data class ProductStockBadge(
    val state: String = "",
    val message: String = "",
)

data class ArticleListResponse(
    val items: List<ArticleSummary> = emptyList(),
    val pagination: PaginationPayload = PaginationPayload(),
)

data class ArticleSummary(
    val slug: String = "",
    val title: String = "",
    val excerpt: String? = null,
    @Json(name = "published_at")
    val publishedAt: String? = null,
)

data class ArticleDetailResponse(
    val slug: String = "",
    val title: String = "",
    val excerpt: String? = null,
    @Json(name = "body_html")
    val bodyHtml: String = "",
    val seo: StorefrontSeo? = null,
    val detail: String? = null,
)

data class StaticPageListResponse(
    val items: List<StaticPageSummary> = emptyList(),
)

data class StaticPageSummary(
    val slug: String = "",
    val title: String = "",
    val excerpt: String? = null,
    @Json(name = "published_at")
    val publishedAt: String? = null,
)

data class StaticPageDetailResponse(
    val slug: String = "",
    val title: String = "",
    val excerpt: String? = null,
    @Json(name = "body_html")
    val bodyHtml: String = "",
    val seo: StorefrontSeo? = null,
    val detail: String? = null,
)

data class CustomerSession(
    @Json(name = "access_token")
    val accessToken: String,
    val customer: CustomerProfile,
    val mode: String? = null,
    val role: String = "customer",
    @Json(name = "pricing_mode")
    val pricingMode: String = "retail",
    @Json(name = "auth_provider")
    val authProvider: String? = null,
)

data class CustomerProfile(
    val id: String,
    @Json(name = "full_name")
    val fullName: String,
    val phone: String? = null,
    val email: String? = null,
    @Json(name = "member_tier")
    val memberTier: String? = null,
    val username: String? = null,
)

data class CustomerAccountResponse(
    val customer: CustomerProfile = CustomerProfile(
        id = "",
        fullName = "",
    ),
    val role: String = "guest",
    @Json(name = "pricing_mode")
    val pricingMode: String = "retail",
    val addresses: List<SavedAddress> = emptyList(),
)

data class SavedAddress(
    val id: String = "",
    val label: String = "",
    @Json(name = "recipient_name")
    val recipientName: String = "",
    @Json(name = "recipient_phone")
    val recipientPhone: String = "",
    @Json(name = "address_line")
    val addressLine: String = "",
    val district: String? = null,
    val city: String = "",
    val province: String = "",
    @Json(name = "postal_code")
    val postalCode: String? = null,
    val notes: String? = null,
    @Json(name = "is_default")
    val isDefault: Boolean = false,
)

data class AddressListResponse(
    val items: List<SavedAddress> = emptyList(),
)

data class ProfileUpdateRequest(
    @Json(name = "full_name")
    val fullName: String,
    val phone: String? = null,
    val email: String? = null,
)

data class AddressUpsertRequest(
    val label: String,
    @Json(name = "recipient_name")
    val recipientName: String,
    @Json(name = "recipient_phone")
    val recipientPhone: String,
    @Json(name = "address_line")
    val addressLine: String,
    val district: String? = null,
    val city: String,
    val province: String,
    @Json(name = "postal_code")
    val postalCode: String? = null,
    val notes: String? = null,
    @Json(name = "is_default")
    val isDefault: Boolean,
)

data class SaveAddressResponse(
    val status: String = "",
    val address: SavedAddress = SavedAddress(),
)

data class DeleteAddressResponse(
    val status: String = "",
    @Json(name = "address_id")
    val addressId: String = "",
)

data class GoogleLoginRequest(
    @Json(name = "store_code")
    val storeCode: String,
    @Json(name = "id_token")
    val idToken: String,
)

data class WhatsAppOtpRequest(
    @Json(name = "store_code")
    val storeCode: String,
    val phone: String,
)

data class WhatsAppOtpVerifyRequest(
    @Json(name = "store_code")
    val storeCode: String,
    @Json(name = "challenge_id")
    val challengeId: String,
    @Json(name = "otp_code")
    val otpCode: String,
)

data class ResellerActivationRequest(
    @Json(name = "store_code")
    val storeCode: String,
    val username: String,
)

data class ResellerActivationResponse(
    val username: String = "",
    val status: String = "",
    @Json(name = "can_set_password")
    val canSetPassword: Boolean = false,
    val message: String = "",
)

data class ResellerSetPasswordRequest(
    @Json(name = "store_code")
    val storeCode: String,
    val username: String,
    val password: String,
)

data class ResellerPasswordResponse(
    val status: String = "",
    val username: String = "",
    val message: String = "",
)

data class ResellerLoginRequest(
    @Json(name = "store_code")
    val storeCode: String,
    val username: String,
    val password: String,
)

data class WhatsAppOtpChallengeResponse(
    @Json(name = "challenge_id")
    val challengeId: String,
    @Json(name = "expires_in_seconds")
    val expiresInSeconds: Int,
    @Json(name = "debug_otp_code")
    val debugOtpCode: String? = null,
)

data class WishlistResponse(
    val items: List<WishlistItem> = emptyList(),
)

data class WishlistItem(
    @Json(name = "product_id")
    val productId: String,
    @Json(name = "product_name")
    val productName: String,
    @Json(name = "product_slug")
    val productSlug: String,
    val product: ProductSummary,
    @Json(name = "created_at")
    val createdAt: String,
)

data class WishlistAddRequest(
    @Json(name = "product_id")
    val productId: String,
)

data class WishlistMutationResponse(
    val status: String,
    @Json(name = "product_id")
    val productId: String,
)

data class AuthCartAddItemRequest(
    @Json(name = "product_id")
    val productId: String,
    val qty: Int,
)

data class AuthCartUpdateItemRequest(
    val qty: Int,
)

data class CheckoutOption(
    val code: String = "",
    val label: String = "",
)

data class CheckoutRules(
    val role: String = "guest",
    @Json(name = "pricing_mode")
    val pricingMode: String = "retail",
    @Json(name = "minimum_order_amount")
    val minimumOrderAmount: String? = null,
    @Json(name = "apply_minimum_order")
    val applyMinimumOrder: Boolean = false,
    @Json(name = "allow_cod")
    val allowCod: Boolean = false,
    @Json(name = "allow_store_delivery")
    val allowStoreDelivery: Boolean = false,
    @Json(name = "allow_pickup")
    val allowPickup: Boolean = false,
    @Json(name = "invoice_source")
    val invoiceSource: String = "STORE",
    @Json(name = "shipping_methods")
    val shippingMethods: List<CheckoutOption> = emptyList(),
    @Json(name = "payment_methods")
    val paymentMethods: List<CheckoutOption> = emptyList(),
)

data class CartItemPriceSnapshot(
    @Json(name = "price_type")
    val priceType: String? = null,
    val amount: String? = null,
    @Json(name = "min_qty")
    val minQty: Int? = null,
    @Json(name = "member_level")
    val memberLevel: String? = null,
    val label: String? = null,
    @Json(name = "pricing_mode")
    val pricingMode: String? = null,
)

data class CartPromotionSnapshot(
    @Json(name = "matched_promotions")
    val matchedPromotions: List<CartPromotionItem> = emptyList(),
)

data class CartPromotionItem(
    @Json(name = "promotion_code")
    val promotionCode: String = "",
    val name: String = "",
    val benefit: String? = null,
)

data class CartItemPayload(
    val id: String = "",
    @Json(name = "product_id")
    val productId: String = "",
    @Json(name = "product_name")
    val productName: String? = null,
    val qty: Int = 0,
    @Json(name = "price_snapshot")
    val priceSnapshot: CartItemPriceSnapshot = CartItemPriceSnapshot(),
    @Json(name = "promotion_snapshot")
    val promotionSnapshot: CartPromotionSnapshot = CartPromotionSnapshot(),
    val subtotal: String = "0",
    val total: String = "0",
)

data class AuthCartResponse(
    val id: String = "",
    @Json(name = "guest_token")
    val guestToken: String? = null,
    val status: String = "",
    val subtotal: String = "0",
    @Json(name = "discount_total")
    val discountTotal: String = "0",
    @Json(name = "grand_total")
    val grandTotal: String = "0",
    @Json(name = "pricing_mode")
    val pricingMode: String = "retail",
    @Json(name = "customer_role")
    val customerRole: String = "guest",
    @Json(name = "checkout_rules")
    val checkoutRules: CheckoutRules = CheckoutRules(),
    val items: List<CartItemPayload> = emptyList(),
)

data class CheckoutAddressPayload(
    @Json(name = "recipient_name")
    val recipientName: String,
    @Json(name = "recipient_phone")
    val recipientPhone: String,
    @Json(name = "address_line")
    val addressLine: String,
    val district: String? = null,
    val city: String,
    val province: String,
    @Json(name = "postal_code")
    val postalCode: String? = null,
    val notes: String? = null,
)

data class AuthCheckoutRequest(
    @Json(name = "shipping_method")
    val shippingMethod: String,
    @Json(name = "pickup_store_code")
    val pickupStoreCode: String? = null,
    val address: CheckoutAddressPayload? = null,
    @Json(name = "payment_method")
    val paymentMethod: String,
    val notes: String? = null,
)

data class CheckoutResponse(
    val order: CheckoutOrder = CheckoutOrder(),
    @Json(name = "payment_instruction")
    val paymentInstruction: CheckoutPaymentInstruction = CheckoutPaymentInstruction(),
    @Json(name = "next_action")
    val nextAction: String = "",
    val invoices: List<OrderInvoice> = emptyList(),
)

data class DuitkuCreateRequest(
    @Json(name = "order_id")
    val orderId: String,
    @Json(name = "callback_url")
    val callbackUrl: String,
    @Json(name = "return_url")
    val returnUrl: String,
)

data class DuitkuCreateResponse(
    val reference: String = "",
    @Json(name = "payment_url")
    val paymentUrl: String = "",
    val expiry: String? = null,
    val mode: String = "",
    @Json(name = "merchant_code")
    val merchantCode: String = "",
)

data class CheckoutOrder(
    val id: String = "",
    @Json(name = "order_number")
    val orderNumber: String = "",
    val status: String = "",
    @Json(name = "payment_status")
    val paymentStatus: String = "",
    @Json(name = "grand_total")
    val grandTotal: String = "0",
    @Json(name = "shipping_total")
    val shippingTotal: String = "0",
    @Json(name = "auto_cancel_at")
    val autoCancelAt: String? = null,
    @Json(name = "payment_due_at")
    val paymentDueAt: String? = null,
    @Json(name = "shipping_method")
    val shippingMethod: String? = null,
    @Json(name = "payment_method")
    val paymentMethod: String? = null,
    @Json(name = "invoice_source")
    val invoiceSource: String? = null,
    @Json(name = "customer_role")
    val customerRole: String? = null,
)

data class CheckoutPaymentInstruction(
    val method: String = "",
    val status: String = "",
    val reference: String? = null,
    @Json(name = "payment_url")
    val paymentUrl: String? = null,
    val expiry: String? = null,
    val mode: String? = null,
    @Json(name = "merchant_code")
    val merchantCode: String? = null,
)

data class OrderInvoice(
    val type: String = "",
    @Json(name = "document_url")
    val documentUrl: String? = null,
)

data class OrderHistoryResponse(
    val items: List<OrderSummary> = emptyList(),
)

data class OrderSummary(
    val id: String = "",
    @Json(name = "order_number")
    val orderNumber: String = "",
    val status: String = "",
    @Json(name = "payment_status")
    val paymentStatus: String = "",
    @Json(name = "fulfillment_status")
    val fulfillmentStatus: String = "",
    @Json(name = "grand_total")
    val grandTotal: String = "0",
    @Json(name = "created_at")
    val createdAt: String? = null,
    @Json(name = "shipping_method")
    val shippingMethod: String? = null,
    @Json(name = "payment_method")
    val paymentMethod: String? = null,
    @Json(name = "invoice_source")
    val invoiceSource: String? = null,
    @Json(name = "customer_role")
    val customerRole: String? = null,
)

data class OrderDetailResponse(
    val id: String = "",
    @Json(name = "order_number")
    val orderNumber: String = "",
    val status: String = "",
    @Json(name = "payment_status")
    val paymentStatus: String = "",
    @Json(name = "fulfillment_status")
    val fulfillmentStatus: String = "",
    @Json(name = "grand_total")
    val grandTotal: String = "0",
    @Json(name = "created_at")
    val createdAt: String? = null,
    @Json(name = "shipping_method")
    val shippingMethod: String? = null,
    @Json(name = "payment_method")
    val paymentMethod: String? = null,
    @Json(name = "invoice_source")
    val invoiceSource: String? = null,
    @Json(name = "customer_role")
    val customerRole: String? = null,
    @Json(name = "payment_due_at")
    val paymentDueAt: String? = null,
    @Json(name = "auto_cancel_at")
    val autoCancelAt: String? = null,
    val notes: String? = null,
    val customer: Map<String, Any?> = emptyMap(),
    val address: Map<String, Any?> = emptyMap(),
    val pricing: Map<String, Any?> = emptyMap(),
    val shipment: OrderShipment = OrderShipment(),
    val payment: OrderPayment = OrderPayment(),
    @Json(name = "can_pay_online")
    val canPayOnline: Boolean = false,
    val items: List<OrderLineItem> = emptyList(),
    val invoices: List<OrderInvoice> = emptyList(),
)

data class OrderShipment(
    @Json(name = "shipment_number")
    val shipmentNumber: String? = null,
    val status: String? = null,
    @Json(name = "tracking_number")
    val trackingNumber: String? = null,
    @Json(name = "delivery_method")
    val deliveryMethod: String? = null,
    @Json(name = "pickup_store_code")
    val pickupStoreCode: String? = null,
    @Json(name = "courier_code")
    val courierCode: String? = null,
    @Json(name = "courier_name")
    val courierName: String? = null,
    @Json(name = "service_code")
    val serviceCode: String? = null,
    @Json(name = "service_name")
    val serviceName: String? = null,
    val etd: String? = null,
)

data class OrderPayment(
    val reference: String? = null,
    val status: String? = null,
    @Json(name = "gateway_code")
    val gatewayCode: String? = null,
    @Json(name = "method_code")
    val methodCode: String? = null,
    val amount: String? = null,
    @Json(name = "paid_at")
    val paidAt: String? = null,
)

data class OrderLineItem(
    val id: String = "",
    @Json(name = "product_id")
    val productId: String = "",
    @Json(name = "product_name")
    val productName: String? = null,
    @Json(name = "product_slug")
    val productSlug: String? = null,
    val qty: Int = 0,
    @Json(name = "unit_price")
    val unitPrice: String = "0",
    @Json(name = "discount_total")
    val discountTotal: String = "0",
    @Json(name = "line_total")
    val lineTotal: String = "0",
    @Json(name = "price_snapshot")
    val priceSnapshot: Map<String, Any?> = emptyMap(),
)

data class ApiDetailPayload(
    val detail: String? = null,
)
