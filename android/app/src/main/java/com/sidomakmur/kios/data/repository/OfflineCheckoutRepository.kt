package com.sidomakmur.kios.data.repository

import com.sidomakmur.kios.data.local.PendingCheckoutDao
import com.sidomakmur.kios.data.local.PendingCheckoutEntity
import com.sidomakmur.kios.data.local.StoreSelectionStore
import com.sidomakmur.kios.data.remote.AuthCartResponse
import com.squareup.moshi.Moshi
import java.io.IOException
import java.util.UUID

private const val PENDING_STATUS = "PENDING"
private const val BLOCKED_STATUS = "BLOCKED"

data class PendingCheckoutLineItem(
    val productName: String? = null,
    val qty: Int = 0,
    val lineTotal: String = "0",
)

data class PendingCheckoutPayload(
    val draft: CheckoutDraft,
    val cartId: String,
    val customerId: String,
    val customerName: String,
    val items: List<PendingCheckoutLineItem> = emptyList(),
)

data class PendingCheckoutItem(
    val id: String,
    val customerId: String,
    val storeCode: String,
    val customerName: String,
    val shippingMethod: String,
    val paymentMethod: String,
    val grandTotal: String,
    val itemCount: Int,
    val items: List<PendingCheckoutLineItem>,
    val status: String,
    val attemptCount: Int,
    val lastError: String? = null,
    val createdAtEpochMs: Long,
)

data class PendingCheckoutSyncResult(
    val submittedCount: Int = 0,
    val blockedCount: Int = 0,
    val pendingItems: List<PendingCheckoutItem> = emptyList(),
)

class OfflineCheckoutRepository(
    private val dao: PendingCheckoutDao,
    private val moshi: Moshi,
    private val storeSelectionStore: StoreSelectionStore,
) {
    private val payloadAdapter = moshi.adapter(PendingCheckoutPayload::class.java)

    suspend fun listPendingForCustomer(
        customerId: String,
        storeCode: String = storeSelectionStore.currentStoreCode(),
    ): List<PendingCheckoutItem> {
        return dao.listForCustomer(customerId = customerId, storeCode = storeCode).map(::toItem)
    }

    suspend fun enqueue(
        customerId: String,
        customerName: String,
        cart: AuthCartResponse,
        draft: CheckoutDraft,
    ): PendingCheckoutItem {
        val now = System.currentTimeMillis()
        val payload = PendingCheckoutPayload(
            draft = draft,
            cartId = cart.id,
            customerId = customerId,
            customerName = customerName,
            items = cart.items.map { item ->
                PendingCheckoutLineItem(
                    productName = item.productName,
                    qty = item.qty,
                    lineTotal = item.total,
                )
            },
        )
        val entity = PendingCheckoutEntity(
            id = UUID.randomUUID().toString(),
            customerId = customerId,
            storeCode = storeSelectionStore.currentStoreCode(),
            customerName = customerName,
            shippingMethod = draft.shippingMethod,
            paymentMethod = draft.paymentMethod,
            grandTotal = cart.grandTotal,
            itemCount = cart.items.sumOf { it.qty },
            payloadJson = payloadAdapter.toJson(payload),
            status = PENDING_STATUS,
            attemptCount = 0,
            lastError = "Menunggu sinkron saat koneksi tersedia.",
            createdAtEpochMs = now,
            updatedAtEpochMs = now,
        )
        dao.insert(entity)
        return toItem(entity)
    }

    suspend fun processPending(
        customerId: String,
        accessToken: String,
        submitCheckoutOnline: suspend (String, CheckoutDraft) -> Unit,
        storeCode: String = storeSelectionStore.currentStoreCode(),
    ): PendingCheckoutSyncResult {
        var submittedCount = 0
        var blockedCount = 0
        val entities = dao.listProcessable(customerId = customerId, storeCode = storeCode)
        for (entity in entities) {
            val payload = payloadAdapter.fromJson(entity.payloadJson) ?: continue
            try {
                submitCheckoutOnline(accessToken, payload.draft)
                dao.deleteById(entity.id)
                submittedCount += 1
            } catch (error: IOException) {
                dao.updateStatus(
                    id = entity.id,
                    status = PENDING_STATUS,
                    attemptCount = entity.attemptCount + 1,
                    lastError = "Koneksi masih belum tersedia. Retry akan diulang otomatis.",
                    updatedAtEpochMs = System.currentTimeMillis(),
                )
                return PendingCheckoutSyncResult(
                    submittedCount = submittedCount,
                    blockedCount = blockedCount,
                    pendingItems = listPendingForCustomer(customerId = customerId, storeCode = storeCode),
                )
            } catch (error: Throwable) {
                dao.updateStatus(
                    id = entity.id,
                    status = BLOCKED_STATUS,
                    attemptCount = entity.attemptCount + 1,
                    lastError = error.message ?: "Draft checkout ditolak backend saat retry.",
                    updatedAtEpochMs = System.currentTimeMillis(),
                )
                blockedCount += 1
            }
        }
        return PendingCheckoutSyncResult(
            submittedCount = submittedCount,
            blockedCount = blockedCount,
            pendingItems = listPendingForCustomer(customerId = customerId, storeCode = storeCode),
        )
    }

    private fun toItem(
        entity: PendingCheckoutEntity,
    ): PendingCheckoutItem {
        val payload = payloadAdapter.fromJson(entity.payloadJson)
        return PendingCheckoutItem(
            id = entity.id,
            customerId = entity.customerId,
            storeCode = entity.storeCode,
            customerName = entity.customerName,
            shippingMethod = entity.shippingMethod,
            paymentMethod = entity.paymentMethod,
            grandTotal = entity.grandTotal,
            itemCount = entity.itemCount,
            items = payload?.items.orEmpty(),
            status = entity.status,
            attemptCount = entity.attemptCount,
            lastError = entity.lastError,
            createdAtEpochMs = entity.createdAtEpochMs,
        )
    }
}
