package com.sidomakmur.kios.data.local

import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import java.lang.reflect.Type

class OfflineCacheStore(
    private val dao: CachedPayloadDao,
    private val moshi: Moshi,
) {
    suspend fun <T> read(
        storeCode: String,
        cacheKey: String,
        type: Type,
    ): T? {
        val entity = dao.find(storeCode = storeCode, cacheKey = cacheKey) ?: return null
        val adapter: JsonAdapter<T> = moshi.adapter(type)
        return runCatching { adapter.fromJson(entity.payloadJson) }.getOrNull()
    }

    suspend fun <T> write(
        storeCode: String,
        cacheKey: String,
        value: T,
        type: Type,
    ) {
        val adapter: JsonAdapter<T> = moshi.adapter(type)
        dao.upsert(
            CachedPayloadEntity(
                storeCode = storeCode,
                cacheKey = cacheKey,
                payloadJson = adapter.toJson(value),
                updatedAtEpochMs = System.currentTimeMillis(),
            ),
        )
    }
}
