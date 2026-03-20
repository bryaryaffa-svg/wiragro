package com.sidomakmur.kios.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "cached_payloads",
    indices = [
        Index(value = ["store_code", "cache_key"], unique = true),
    ],
)
data class CachedPayloadEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "store_code")
    val storeCode: String,
    @ColumnInfo(name = "cache_key")
    val cacheKey: String,
    @ColumnInfo(name = "payload_json")
    val payloadJson: String,
    @ColumnInfo(name = "updated_at_epoch_ms")
    val updatedAtEpochMs: Long,
)
