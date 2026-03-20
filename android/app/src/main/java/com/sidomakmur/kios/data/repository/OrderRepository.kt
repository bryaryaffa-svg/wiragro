package com.sidomakmur.kios.data.repository

import com.sidomakmur.kios.BuildConfig
import com.sidomakmur.kios.data.local.OfflineCacheStore
import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.DuitkuCreateRequest
import com.sidomakmur.kios.data.remote.DuitkuCreateResponse
import com.sidomakmur.kios.data.remote.OrderDetailResponse
import com.sidomakmur.kios.data.remote.OrderHistoryResponse
import com.sidomakmur.kios.data.remote.StorefrontApi

class OrderRepository(
    private val api: StorefrontApi,
    private val cacheStore: OfflineCacheStore,
    private val errorParser: ApiErrorParser,
) {
    suspend fun getOrders(
        accessToken: String,
    ): OrderHistoryResponse {
        val cacheKey = "orders-history"
        val storeCode = "auth"
        return runCatching {
            api.getMyOrders(authorization = bearer(accessToken))
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = OrderHistoryResponse::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = OrderHistoryResponse::class.java,
            ) ?: throw IllegalStateException(errorParser.message(error, "Riwayat pesanan belum bisa dimuat."))
        }
    }

    suspend fun getOrderDetail(
        accessToken: String,
        orderId: String,
    ): OrderDetailResponse {
        val cacheKey = "order-detail:$orderId"
        val storeCode = "auth"
        return runCatching {
            api.getMyOrderDetail(
                authorization = bearer(accessToken),
                orderId = orderId,
            )
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = OrderDetailResponse::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = OrderDetailResponse::class.java,
            ) ?: throw IllegalStateException(errorParser.message(error, "Detail pesanan belum bisa dimuat."))
        }
    }

    suspend fun createDuitkuPayment(
        accessToken: String,
        orderId: String,
    ): DuitkuCreateResponse {
        val callbackBase = BuildConfig.KIOS_API_BASE_URL.removeSuffix("/")
        val baseOrigin = callbackBase.substringBefore("/api/v1").ifBlank {
            callbackBase
        }
        return runCatching {
            api.createAuthenticatedDuitkuPayment(
                authorization = bearer(accessToken),
                payload = DuitkuCreateRequest(
                    orderId = orderId,
                    callbackUrl = "$baseOrigin/api/v1/payments/duitku/callback",
                    returnUrl = "$baseOrigin/android/duitku-return",
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Link pembayaran Duitku belum bisa dibuat."))
        }
    }

    fun resolveDocumentUrl(
        documentUrl: String?,
    ): String? {
        if (documentUrl.isNullOrBlank()) {
            return null
        }
        return if (documentUrl.startsWith("http://") || documentUrl.startsWith("https://")) {
            documentUrl
        } else {
            "${BuildConfig.KIOS_API_BASE_URL.substringBefore("/api/v1").trimEnd('/')}${documentUrl}"
        }
    }

    private fun bearer(accessToken: String): String = "Bearer $accessToken"
}
