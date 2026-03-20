package com.sidomakmur.kios.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sidomakmur.kios.data.remote.BannerItem
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.repository.HomeFeed
import com.sidomakmur.kios.data.session.SessionRole
import com.sidomakmur.kios.feature.catalog.ProductCard

@Composable
fun HomeRoute(
    viewModel: HomeViewModel = viewModel(),
    sessionRole: SessionRole,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
    onOpenCatalog: () -> Unit,
    onOpenCatalogCategory: (String) -> Unit,
    onOpenArticles: () -> Unit,
    onOpenPages: () -> Unit,
    onSwitchStore: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    when (val state = viewModel.uiState.collectAsStateWithLifecycle().value) {
        HomeUiState.Loading -> LoadingScreen(modifier = modifier)
        is HomeUiState.Error -> ErrorScreen(
            message = state.message,
            onRetry = viewModel::refresh,
            modifier = modifier,
        )

        is HomeUiState.Success -> HomeScreen(
            feed = state.feed,
            sessionRole = sessionRole,
            wishlistProductIds = wishlistProductIds,
            pendingWishlistProductIds = pendingWishlistProductIds,
            pendingCartProductIds = pendingCartProductIds,
            onRefresh = viewModel::refresh,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
            onOpenProduct = onOpenProduct,
            onOpenCatalog = onOpenCatalog,
            onOpenCatalogCategory = onOpenCatalogCategory,
            onOpenArticles = onOpenArticles,
            onOpenPages = onOpenPages,
            onSwitchStore = onSwitchStore,
            modifier = modifier,
        )
    }
}

@Composable
private fun LoadingScreen(
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun ErrorScreen(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "Gagal memuat katalog Android",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(modifier = Modifier.height(20.dp))
        Button(onClick = onRetry) {
            Text("Coba lagi")
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun HomeScreen(
    feed: HomeFeed,
    sessionRole: SessionRole,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    onRefresh: () -> Unit,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
    onOpenCatalog: () -> Unit,
    onOpenCatalogCategory: (String) -> Unit,
    onOpenArticles: () -> Unit,
    onOpenPages: () -> Unit,
    onSwitchStore: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primaryContainer,
                                    MaterialTheme.colorScheme.tertiaryContainer,
                                ),
                            ),
                        )
                        .padding(20.dp),
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = feed.storeName,
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Store code ${feed.storeCode}",
                            style = MaterialTheme.typography.labelLarge,
                        )
                        if (feed.availableStores.size > 1) {
                            Text(
                                text = "Pilih cabang aktif",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                            )
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                feed.availableStores.forEach { store ->
                                    AssistChip(
                                        onClick = { onSwitchStore(store.code) },
                                        label = {
                                            Text(
                                                if (store.code == feed.storeCode) {
                                                    "${store.name} (aktif)"
                                                } else {
                                                    store.name
                                                },
                                            )
                                        },
                                    )
                                }
                            }
                        }
                        Text(
                            text = "Homepage Android sekarang bisa meneruskan customer ke detail produk dan wishlist yang terhubung ke backend.",
                            style = MaterialTheme.typography.bodyLarge,
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            AssistChip(
                                onClick = {},
                                label = { Text("${feed.banners.size} banner") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.LocalOffer, contentDescription = null)
                                },
                            )
                            AssistChip(
                                onClick = {},
                                label = { Text("Storefront") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Storefront, contentDescription = null)
                                },
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "API: ${feed.apiBaseUrl}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Button(onClick = onRefresh) {
                                Text("Muat ulang katalog")
                            }
                            Button(onClick = onOpenCatalog) {
                                Text("Katalog penuh")
                            }
                            Button(onClick = onOpenArticles) {
                                Text("Artikel")
                            }
                            Button(onClick = onOpenPages) {
                                Text("Halaman info")
                            }
                        }
                    }
                }
            }
        }

        if (feed.categories.isNotEmpty()) {
            item {
                SectionTitle(
                    title = "Kategori cepat",
                    subtitle = "Highlight kategori yang dipublikasikan backend.",
                )
            }
            item {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    feed.categories.forEach { category ->
                        AssistChip(
                            onClick = { onOpenCatalogCategory(category.slug) },
                            label = { Text(category.name) },
                        )
                    }
                }
            }
        }

        bannersSection("Banner aktif", feed.banners)
        productsSection(
            title = "Produk unggulan",
            subtitle = "Diambil dari /storefront/home.",
            products = feed.featuredProducts,
            sessionRole = sessionRole,
            wishlistProductIds = wishlistProductIds,
            pendingWishlistProductIds = pendingWishlistProductIds,
            pendingCartProductIds = pendingCartProductIds,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
            onOpenProduct = onOpenProduct,
        )
        productsSection(
            title = "Produk terbaru",
            subtitle = "Section terbaru siap dipakai sebagai basis homepage Android.",
            products = feed.newArrivals,
            sessionRole = sessionRole,
            wishlistProductIds = wishlistProductIds,
            pendingWishlistProductIds = pendingWishlistProductIds,
            pendingCartProductIds = pendingCartProductIds,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
            onOpenProduct = onOpenProduct,
        )
        productsSection(
            title = "Produk terlaris",
            subtitle = "Section terlaris dari backend storefront.",
            products = feed.bestSellers,
            sessionRole = sessionRole,
            wishlistProductIds = wishlistProductIds,
            pendingWishlistProductIds = pendingWishlistProductIds,
            pendingCartProductIds = pendingCartProductIds,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
            onOpenProduct = onOpenProduct,
        )
        productsSection(
            title = "Preview katalog",
            subtitle = "Preview tambahan dari endpoint /storefront/products.",
            products = feed.catalogPreview,
            sessionRole = sessionRole,
            wishlistProductIds = wishlistProductIds,
            pendingWishlistProductIds = pendingWishlistProductIds,
            pendingCartProductIds = pendingCartProductIds,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
            onOpenProduct = onOpenProduct,
        )
    }
}

private fun LazyListScope.bannersSection(
    title: String,
    banners: List<BannerItem>,
) {
    if (banners.isEmpty()) {
        return
    }

    item {
        SectionTitle(
            title = title,
            subtitle = "Tetap tampil meski modul banner belum diisi penuh.",
        )
    }
    items(banners) { banner ->
        Card {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    text = banner.title.ifBlank { "Banner tanpa judul" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                banner.subtitle?.takeIf { it.isNotBlank() }?.let { subtitle ->
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                banner.targetUrl?.takeIf { it.isNotBlank() }?.let { targetUrl ->
                    Text(
                        text = targetUrl,
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
        }
    }
}

private fun LazyListScope.productsSection(
    title: String,
    subtitle: String,
    products: List<ProductSummary>,
    sessionRole: SessionRole,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
) {
    if (products.isEmpty()) {
        return
    }

    item {
        SectionTitle(title = title, subtitle = subtitle)
    }
    items(products, key = { it.id }) { product ->
        ProductCard(
            product = product,
            sessionRole = sessionRole,
            isWishlisted = product.id in wishlistProductIds,
            isWishlistBusy = product.id in pendingWishlistProductIds,
            isCartBusy = product.id in pendingCartProductIds,
            onOpenProduct = onOpenProduct,
            onToggleWishlist = onToggleWishlist,
            onAddToCart = onAddToCart,
        )
    }
}

@Composable
private fun SectionTitle(
    title: String,
    subtitle: String,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
