package com.sidomakmur.kios.data.repository

import android.content.Context
import com.sidomakmur.kios.data.local.StoreSelectionStore
import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.AuthCartAddItemRequest
import com.sidomakmur.kios.data.remote.AuthCartResponse
import com.sidomakmur.kios.data.remote.AuthCartUpdateItemRequest
import com.sidomakmur.kios.data.remote.AuthCheckoutRequest
import com.sidomakmur.kios.data.remote.CheckoutAddressPayload
import com.sidomakmur.kios.data.remote.CheckoutResponse
import com.sidomakmur.kios.data.remote.StorefrontApi
import com.sidomakmur.kios.sync.StorefrontSyncWorker
import java.io.IOException

data class CheckoutDraft(
    val shippingMethod: String,
    val paymentMethod: String,
    val recipientName: String,
    val recipientPhone: String,
    val addressLine: String,
    val district: String,
    val city: String,
    val province: String,
    val postalCode: String,
    val notes: String,
)

data class CheckoutSubmissionOutcome(
    val response: CheckoutResponse? = null,
    val queuedCheckout: PendingCheckoutItem? = null,
    val wasQueuedOffline: Boolean = false,
)

class CartRepository(
    private val api: StorefrontApi,
    private val storeSelectionStore: StoreSelectionStore,
    private val offlineCheckoutRepository: OfflineCheckoutRepository,
    private val context: Context,
    private val errorParser: ApiErrorParser,
) {
    suspend fun getCart(
        accessToken: String,
    ): AuthCartResponse {
        return runCatching {
            api.getAuthenticatedCart(authorization = bearer(accessToken))
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Keranjang belum bisa dimuat."))
        }
    }

    suspend fun addItem(
        accessToken: String,
        productId: String,
        qty: Int = 1,
    ): AuthCartResponse {
        return runCatching {
            api.addAuthenticatedCartItem(
                authorization = bearer(accessToken),
                payload = AuthCartAddItemRequest(
                    productId = productId,
                    qty = qty,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Produk belum bisa ditambahkan ke keranjang."))
        }
    }

    suspend fun updateItem(
        accessToken: String,
        itemId: String,
        qty: Int,
    ): AuthCartResponse {
        return runCatching {
            api.updateAuthenticatedCartItem(
                authorization = bearer(accessToken),
                itemId = itemId,
                payload = AuthCartUpdateItemRequest(qty = qty),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Perubahan keranjang belum berhasil disimpan."))
        }
    }

    suspend fun checkout(
        accessToken: String,
        customerId: String,
        customerName: String,
        cart: AuthCartResponse,
        draft: CheckoutDraft,
    ): CheckoutSubmissionOutcome {
        return try {
            CheckoutSubmissionOutcome(
                response = submitCheckoutOnline(
                    accessToken = accessToken,
                    draft = draft,
                ),
            )
        } catch (error: IOException) {
            val queuedCheckout = offlineCheckoutRepository.enqueue(
                customerId = customerId,
                customerName = customerName,
                cart = cart,
                draft = draft,
            )
            StorefrontSyncWorker.enqueueImmediateRetry(context)
            CheckoutSubmissionOutcome(
                queuedCheckout = queuedCheckout,
                wasQueuedOffline = true,
            )
        } catch (error: Throwable) {
            throw IllegalStateException(errorParser.message(error, "Checkout belum berhasil diproses."))
        }
    }

    suspend fun submitCheckoutOnline(
        accessToken: String,
        draft: CheckoutDraft,
    ): CheckoutResponse {
        return api.submitAuthenticatedCheckout(
            authorization = bearer(accessToken),
            payload = AuthCheckoutRequest(
                shippingMethod = draft.shippingMethod,
                pickupStoreCode = if (draft.shippingMethod == "pickup") storeSelectionStore.currentStoreCode() else null,
                address = if (draft.shippingMethod == "delivery") {
                    CheckoutAddressPayload(
                        recipientName = draft.recipientName,
                        recipientPhone = draft.recipientPhone,
                        addressLine = draft.addressLine,
                        district = draft.district.ifBlank { null },
                        city = draft.city,
                        province = draft.province,
                        postalCode = draft.postalCode.ifBlank { null },
                        notes = draft.notes.ifBlank { null },
                    )
                } else {
                    null
                },
                paymentMethod = draft.paymentMethod,
                notes = draft.notes.ifBlank { null },
            ),
        )
    }

    suspend fun getPendingCheckouts(
        customerId: String,
    ): List<PendingCheckoutItem> {
        return offlineCheckoutRepository.listPendingForCustomer(customerId = customerId)
    }

    suspend fun retryPendingCheckouts(
        accessToken: String,
        customerId: String,
    ): PendingCheckoutSyncResult {
        return offlineCheckoutRepository.processPending(
            customerId = customerId,
            accessToken = accessToken,
            submitCheckoutOnline = ::submitCheckoutOnline,
        )
    }

    private fun bearer(accessToken: String): String = "Bearer $accessToken"
}
