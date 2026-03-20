package com.sidomakmur.kios.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "pending_checkouts",
    indices = [
        Index(value = ["customer_id", "store_code"]),
        Index(value = ["status"]),
    ],
)
data class PendingCheckoutEntity(
    @PrimaryKey
    val id: String,
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    @ColumnInfo(name = "store_code")
    val storeCode: String,
    @ColumnInfo(name = "customer_name")
    val customerName: String,
    @ColumnInfo(name = "shipping_method")
    val shippingMethod: String,
    @ColumnInfo(name = "payment_method")
    val paymentMethod: String,
    @ColumnInfo(name = "grand_total")
    val grandTotal: String,
    @ColumnInfo(name = "item_count")
    val itemCount: Int,
    @ColumnInfo(name = "payload_json")
    val payloadJson: String,
    val status: String,
    @ColumnInfo(name = "attempt_count")
    val attemptCount: Int,
    @ColumnInfo(name = "last_error")
    val lastError: String? = null,
    @ColumnInfo(name = "created_at_epoch_ms")
    val createdAtEpochMs: Long,
    @ColumnInfo(name = "updated_at_epoch_ms")
    val updatedAtEpochMs: Long,
)
