package com.sidomakmur.kios.data.remote

import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import java.io.IOException
import retrofit2.HttpException

class ApiErrorParser(
    moshi: Moshi,
) {
    private val adapter: JsonAdapter<ApiDetailPayload> = moshi.adapter(ApiDetailPayload::class.java)

    fun message(
        error: Throwable,
        fallback: String,
    ): String {
        return when (error) {
            is IllegalStateException -> error.message ?: fallback
            is HttpException -> parseHttpMessage(error) ?: fallback
            is IOException -> "Tidak bisa terhubung ke backend Kios Sidomakmur."
            else -> error.message?.takeIf { it.isNotBlank() } ?: fallback
        }
    }

    private fun parseHttpMessage(error: HttpException): String? {
        return runCatching {
            error.response()
                ?.errorBody()
                ?.string()
                ?.takeIf { it.isNotBlank() }
                ?.let(adapter::fromJson)
                ?.detail
                ?.takeIf { it.isNotBlank() }
        }.getOrNull()
    }
}
