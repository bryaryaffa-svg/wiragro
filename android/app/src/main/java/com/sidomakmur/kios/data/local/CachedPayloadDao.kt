package com.sidomakmur.kios.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface CachedPayloadDao {
    @Query(
        """
        SELECT * FROM cached_payloads
        WHERE store_code = :storeCode AND cache_key = :cacheKey
        LIMIT 1
        """,
    )
    suspend fun find(storeCode: String, cacheKey: String): CachedPayloadEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: CachedPayloadEntity)
}
