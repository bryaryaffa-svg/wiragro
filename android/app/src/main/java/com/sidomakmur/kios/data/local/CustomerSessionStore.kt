package com.sidomakmur.kios.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.sidomakmur.kios.data.remote.CustomerSession
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi

class CustomerSessionStore(
    context: Context,
    moshi: Moshi,
) {
    private val preferences: SharedPreferences = createPreferences(context)
    private val adapter: JsonAdapter<CustomerSession> = moshi.adapter(CustomerSession::class.java)

    fun read(): CustomerSession? {
        val raw = preferences.getString(KEY_SESSION, null) ?: return null
        return runCatching { adapter.fromJson(raw) }.getOrNull()
    }

    fun save(session: CustomerSession) {
        preferences.edit().putString(KEY_SESSION, adapter.toJson(session)).apply()
    }

    fun clear() {
        preferences.edit().remove(KEY_SESSION).apply()
    }

    private fun createPreferences(
        context: Context,
    ): SharedPreferences {
        return runCatching {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                context,
                PREFERENCES_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
            )
        }.getOrElse {
            context.getSharedPreferences("${PREFERENCES_NAME}_fallback", Context.MODE_PRIVATE)
        }
    }

    private companion object {
        const val PREFERENCES_NAME = "kios_sidomakmur_customer_session"
        const val KEY_SESSION = "session_json"
    }
}
