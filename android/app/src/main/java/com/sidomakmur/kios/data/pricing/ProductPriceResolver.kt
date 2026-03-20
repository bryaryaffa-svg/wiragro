package com.sidomakmur.kios.data.pricing

import com.sidomakmur.kios.data.remote.ProductDetailResponse
import com.sidomakmur.kios.data.remote.ProductPrice
import com.sidomakmur.kios.data.remote.ProductPricing
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.session.SessionRole

data class ProductPriceDisplay(
    val amount: String?,
    val label: String,
    val compareAmount: String? = null,
    val minQty: Int? = null,
    val isResellerPrice: Boolean = false,
)

private fun resolvePrice(
    pricing: ProductPricing,
    fallback: ProductPrice,
    role: SessionRole,
): ProductPriceDisplay {
    val resellerPrice = pricing.reseller.amount
    val retailPrice = pricing.retail.amount ?: pricing.active.amount ?: fallback.amount
    val activePrice = when {
        role == SessionRole.RESELLER && !resellerPrice.isNullOrBlank() -> pricing.reseller
        !pricing.active.amount.isNullOrBlank() -> pricing.active
        !fallback.amount.isNullOrBlank() -> fallback
        else -> pricing.retail
    }
    val isReseller = role == SessionRole.RESELLER && !resellerPrice.isNullOrBlank()
    val label = if (isReseller) {
        pricing.reseller.label ?: "Harga Reseller"
    } else {
        pricing.retail.label ?: pricing.active.label ?: "Harga Umum"
    }
    return ProductPriceDisplay(
        amount = activePrice.amount,
        label = label,
        compareAmount = if (isReseller && retailPrice != activePrice.amount) retailPrice else null,
        minQty = activePrice.minQty ?: fallback.minQty,
        isResellerPrice = isReseller,
    )
}

fun ProductSummary.priceDisplay(
    role: SessionRole,
): ProductPriceDisplay = resolvePrice(
    pricing = pricing,
    fallback = price,
    role = role,
)

fun ProductDetailResponse.priceDisplay(
    role: SessionRole,
): ProductPriceDisplay = resolvePrice(
    pricing = pricing,
    fallback = price,
    role = role,
)
