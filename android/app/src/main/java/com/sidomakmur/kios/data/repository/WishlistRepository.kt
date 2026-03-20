package com.sidomakmur.kios.data.repository

import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.StorefrontApi
import com.sidomakmur.kios.data.remote.WishlistResponse

class WishlistRepository(
    private val api: StorefrontApi,
    private val errorParser: ApiErrorParser,
) {
    suspend fun getWishlist(
        accessToken: String,
    ): WishlistResponse {
        return runCatching {
            api.getWishlist(authorization = bearer(accessToken))
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Wishlist belum dapat dimuat."))
        }
    }

    suspend fun addItem(
        accessToken: String,
        productId: String,
    ) {
        runCatching {
            api.addWishlistItem(
                authorization = bearer(accessToken),
                payload = com.sidomakmur.kios.data.remote.WishlistAddRequest(productId = productId),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Produk gagal disimpan ke wishlist."))
        }
    }

    suspend fun removeItem(
        accessToken: String,
        productId: String,
    ) {
        runCatching {
            api.removeWishlistItem(
                authorization = bearer(accessToken),
                productId = productId,
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Produk gagal dihapus dari wishlist."))
        }
    }

    private fun bearer(accessToken: String): String = "Bearer $accessToken"
}
