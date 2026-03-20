package com.sidomakmur.kios.feature.wishlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.data.session.SessionRole
import com.sidomakmur.kios.feature.account.SessionViewModel
import com.sidomakmur.kios.feature.catalog.ProductCard

@Composable
fun WishlistRoute(
    viewModel: SessionViewModel,
    sessionRole: SessionRole,
    pendingCartProductIds: Set<String>,
    onAddToCart: (com.sidomakmur.kios.data.remote.ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
    onOpenAccount: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val sessionState = viewModel.sessionUiState.collectAsStateWithLifecycle().value
    val wishlistState = viewModel.wishlistUiState.collectAsStateWithLifecycle().value

    when {
        sessionState.session == null -> WishlistEmptyState(
            title = "Wishlist memerlukan login",
            body = "Masuk dulu sebagai member atau reseller agar wishlist tersimpan pada akun yang aktif.",
            actionLabel = "Buka Akun",
            onAction = onOpenAccount,
            modifier = modifier,
        )

        wishlistState.isLoading && wishlistState.items.isEmpty() -> Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator()
        }

        wishlistState.items.isEmpty() -> WishlistEmptyState(
            title = "Wishlist masih kosong",
            body = "Tambahkan produk dari homepage atau dari halaman detail produk.",
            actionLabel = "Muat ulang",
            onAction = viewModel::refreshWishlist,
            modifier = modifier,
        )

        else -> LazyColumn(
            modifier = modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            wishlistState.message?.let { message ->
                item {
                    WishlistMessage(
                        message = message,
                        onDismiss = viewModel::dismissWishlistMessage,
                    )
                }
            }
            item {
                Text(
                    text = "Wishlist Customer",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
            }
            items(wishlistState.items, key = { it.productId }) { item ->
                ProductCard(
                    product = item.product,
                    sessionRole = sessionRole,
                    isWishlisted = true,
                    isWishlistBusy = item.productId in wishlistState.pendingProductIds,
                    isCartBusy = item.productId in pendingCartProductIds,
                    onOpenProduct = onOpenProduct,
                    onToggleWishlist = viewModel::toggleWishlist,
                    onAddToCart = onAddToCart,
                )
            }
        }
    }
}

@Composable
private fun WishlistEmptyState(
    title: String,
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        androidx.compose.foundation.layout.Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodyLarge,
            )
            Button(onClick = onAction) {
                Text(actionLabel)
            }
        }
    }
}

@Composable
private fun WishlistMessage(
    message: String,
    onDismiss: () -> Unit,
) {
        androidx.compose.material3.Surface(
        color = MaterialTheme.colorScheme.primaryContainer,
        shape = MaterialTheme.shapes.large,
    ) {
        androidx.compose.foundation.layout.Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
            )
            Button(onClick = onDismiss) {
                Text("Tutup")
            }
        }
    }
}
