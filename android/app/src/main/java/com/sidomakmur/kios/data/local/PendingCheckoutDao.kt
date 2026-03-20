package com.sidomakmur.kios.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface PendingCheckoutDao {
    @Query(
        """
        SELECT * FROM pending_checkouts
        WHERE customer_id = :customerId AND store_code = :storeCode
        ORDER BY created_at_epoch_ms DESC
        """,
    )
    suspend fun listForCustomer(customerId: String, storeCode: String): List<PendingCheckoutEntity>

    @Query(
        """
        SELECT * FROM pending_checkouts
        WHERE customer_id = :customerId AND store_code = :storeCode AND status = 'PENDING'
        ORDER BY created_at_epoch_ms ASC
        """,
    )
    suspend fun listProcessable(customerId: String, storeCode: String): List<PendingCheckoutEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: PendingCheckoutEntity)

    @Query(
        """
        UPDATE pending_checkouts
        SET status = :status,
            attempt_count = :attemptCount,
            last_error = :lastError,
            updated_at_epoch_ms = :updatedAtEpochMs
        WHERE id = :id
        """,
    )
    suspend fun updateStatus(
        id: String,
        status: String,
        attemptCount: Int,
        lastError: String?,
        updatedAtEpochMs: Long,
    )

    @Query("DELETE FROM pending_checkouts WHERE id = :id")
    suspend fun deleteById(id: String)
}
