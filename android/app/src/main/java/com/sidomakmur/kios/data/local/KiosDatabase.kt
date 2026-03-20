package com.sidomakmur.kios.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [CachedPayloadEntity::class, PendingCheckoutEntity::class],
    version = 2,
    exportSchema = false,
)
abstract class KiosDatabase : RoomDatabase() {
    abstract fun cachedPayloadDao(): CachedPayloadDao
    abstract fun pendingCheckoutDao(): PendingCheckoutDao

    companion object {
        fun create(context: Context): KiosDatabase {
            return Room.databaseBuilder(
                context,
                KiosDatabase::class.java,
                "kios_sidomakmur.db",
            ).fallbackToDestructiveMigration().build()
        }
    }
}
