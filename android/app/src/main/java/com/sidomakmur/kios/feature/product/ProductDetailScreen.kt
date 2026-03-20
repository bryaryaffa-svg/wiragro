package com.sidomakmur.kios.feature.product

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.PlayCircle
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.sidomakmur.kios.data.pricing.priceDisplay
import com.sidomakmur.kios.data.remote.ProductDetailResponse
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.session.SessionRole
import com.sidomakmur.kios.feature.account.SessionViewModel
import com.sidomakmur.kios.feature.catalog.PricePill
import com.sidomakmur.kios.feature.catalog.ProductCard

@Composable
fun ProductDetailRoute(
    viewModel: ProductDetailViewModel,
    sessionViewModel: SessionViewModel,
    sessionRole: SessionRole,
    pendingCartProductIds: Set<String>,
    onOpenProduct: (String) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onRequireLogin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value
    val sessionState = sessionViewModel.sessionUiState.collectAsStateWithLifecycle().value
    val wishlistState = sessionViewModel.wishlistUiState.collectAsStateWithLifecycle().value

    when (state) {
        ProductDetailUiState.Loading -> Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator()
        }

        is ProductDetailUiState.Error -> Box(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = state.message,
                    style = MaterialTheme.typography.bodyLarge,
                )
                Button(onClick = viewModel::refresh) {
                    Text("Coba lagi")
                }
            }
        }

        is ProductDetailUiState.Success -> ProductDetailScreen(
            product = state.product,
            sessionRole = sessionRole,
            isWishlisted = sessionViewModel.isWishlisted(state.product.id),
            isWishlistBusy = state.product.id in wishlistState.pendingProductIds,
            isCartBusy = state.product.id in pendingCartProductIds,
            wishlistMessage = wishlistState.message,
            isLoggedIn = sessionState.session != null,
            onRefresh = viewModel::refresh,
            onOpenProduct = onOpenProduct,
            onAddToCart = onAddToCart,
            onToggleWishlist = {
                if (sessionState.session == null) {
                    onRequireLogin()
                } else {
                    sessionViewModel.toggleWishlist(it)
                }
            },
            onDismissWishlistMessage = sessionViewModel::dismissWishlistMessage,
            pendingCartProductIds = pendingCartProductIds,
            modifier = modifier,
        )
    }
}

@Composable
private fun ProductDetailScreen(
    product: ProductDetailResponse,
    sessionRole: SessionRole,
    isWishlisted: Boolean,
    isWishlistBusy: Boolean,
    isCartBusy: Boolean,
    wishlistMessage: String?,
    isLoggedIn: Boolean,
    onRefresh: () -> Unit,
    onOpenProduct: (String) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onToggleWishlist: (ProductSummary) -> Unit,
    onDismissWishlistMessage: () -> Unit,
    pendingCartProductIds: Set<String>,
    modifier: Modifier = Modifier,
) {
    val primaryImage = product.images.firstOrNull { it.isPrimary }?.url ?: product.images.firstOrNull()?.url
    val summaryProduct = product.asSummary()
    val priceDisplay = product.priceDisplay(sessionRole)

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                        .background(
                            brush = Brush.linearGradient(
                                listOf(
                                    MaterialTheme.colorScheme.primaryContainer,
                                    MaterialTheme.colorScheme.tertiaryContainer,
                                ),
                            ),
                        ),
                ) {
                    if (!primaryImage.isNullOrBlank()) {
                        AsyncImage(
                            model = primaryImage,
                            contentDescription = product.name,
                            modifier = Modifier.matchParentSize(),
                            contentScale = ContentScale.Crop,
                        )
                    }
                    IconButton(
                        onClick = { onToggleWishlist(summaryProduct) },
                        enabled = !isWishlistBusy,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(12.dp),
                    ) {
                        Icon(
                            imageVector = if (isWishlisted) {
                                Icons.Filled.Favorite
                            } else {
                                Icons.Outlined.FavoriteBorder
                            },
                            contentDescription = if (isWishlisted) {
                                "Hapus dari wishlist"
                            } else {
                                "Simpan ke wishlist"
                            },
                            tint = MaterialTheme.colorScheme.surface,
                        )
                    }
                }
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "${product.productType} - ${product.unit}",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
                PricePill(
                    amount = priceDisplay.amount,
                    label = priceDisplay.label,
                    compareAmount = priceDisplay.compareAmount,
                )
                Text(
                    text = product.stockBadge.message.ifBlank { "Status stok belum tersedia." },
                    style = MaterialTheme.typography.bodyMedium,
                )
                OutlinedButton(
                    onClick = { onAddToCart(summaryProduct) },
                    enabled = !isCartBusy,
                ) {
                    Text(if (isCartBusy) "Memproses..." else "Tambah ke cart")
                }
                if (!isLoggedIn) {
                    Text(
                        text = "Login diperlukan untuk menyimpan wishlist customer.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        product.summary?.takeIf { it.isNotBlank() }?.let { summary ->
            item {
                SectionCard(
                    title = "Ringkasan produk",
                    body = summary,
                )
            }
        }

        product.description?.takeIf { it.isNotBlank() }?.let { description ->
            item {
                SectionCard(
                    title = "Deskripsi",
                    body = description,
                )
            }
        }

        if (product.images.isNotEmpty()) {
            item {
                Text(
                    text = "Galeri",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            items(product.images, key = { it.id }) { image ->
                Card {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        AsyncImage(
                            model = image.url,
                            contentDescription = image.altText ?: product.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(220.dp),
                            contentScale = ContentScale.Crop,
                        )
                        image.altText?.takeIf { it.isNotBlank() }?.let { altText ->
                            Text(
                                text = altText,
                                modifier = Modifier.padding(12.dp),
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }
                }
            }
        }

        if (product.promotions.isNotEmpty()) {
            item {
                Text(
                    text = "Promo aktif",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            items(product.promotions, key = { it.code }) { promotion ->
                SectionCard(
                    title = promotion.name,
                    body = "Kode promo ${promotion.code}. Rule dikirim langsung dari backend pusat.",
                )
            }
        }

        if (product.videos.isNotEmpty()) {
            item {
                Text(
                    text = "Video produk",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            items(product.videos, key = { it.id }) { video ->
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.PlayCircle,
                                contentDescription = null,
                            )
                            Text(
                                text = video.platform.ifBlank { "Video" },
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                        Text(
                            text = video.url,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }

        wishlistMessage?.let { message ->
            item {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = MaterialTheme.shapes.large,
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text(text = message)
                        Button(onClick = onDismissWishlistMessage) {
                            Text("Tutup")
                        }
                    }
                }
            }
        }

        item {
            Divider()
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Tarik ulang dari backend jika ada perubahan pusat.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Button(onClick = onRefresh) {
                    Text("Refresh")
                }
            }
        }

        if (product.relatedProducts.isNotEmpty()) {
            item {
                Text(
                    text = "Produk terkait",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            items(product.relatedProducts, key = { it.id }) { relatedProduct ->
                ProductCard(
                    product = relatedProduct,
                    sessionRole = sessionRole,
                    isWishlisted = false,
                    isWishlistBusy = false,
                    isCartBusy = relatedProduct.id in pendingCartProductIds,
                    onOpenProduct = onOpenProduct,
                    onToggleWishlist = onToggleWishlist,
                    onAddToCart = onAddToCart,
                )
            }
        }
    }
}

@Composable
private fun SectionCard(
    title: String,
    body: String,
) {
    Card {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

private fun ProductDetailResponse.asSummary(): ProductSummary {
    return ProductSummary(
        id = id,
        sku = sku,
        slug = slug,
        name = name,
        summary = summary,
        description = description,
        productType = productType,
        unit = unit,
        weightGrams = weightGrams,
        badges = badges,
        price = price,
        pricing = pricing,
        images = images,
        videos = videos,
        seo = seo,
    )
}
