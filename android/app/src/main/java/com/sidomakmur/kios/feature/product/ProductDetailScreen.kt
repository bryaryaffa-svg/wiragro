package com.sidomakmur.kios.feature.product

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.PlayCircle
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
import com.sidomakmur.kios.feature.catalog.formatCurrency

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
        ProductDetailUiState.Loading -> ProductStatusScreen(
            title = "Memuat detail produk",
            body = "Data produk sedang diambil dari backend pusat.",
            isLoading = true,
            modifier = modifier,
        )

        is ProductDetailUiState.Error -> ProductStatusScreen(
            title = "Detail produk belum tersedia",
            body = state.message,
            actionLabel = "Coba lagi",
            onAction = viewModel::refresh,
            modifier = modifier,
        )

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
    val relatedRows = product.relatedProducts.chunked(2)
    val chips = buildList {
        if (priceDisplay.isResellerPrice) add("Harga Reseller")
        if (product.badges.featured) add("Unggulan")
        if (product.badges.newArrival) add("Baru")
        if (product.badges.bestSeller) add("Terlaris")
    }

    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 124.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ElevatedCard {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(286.dp)
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
                            } else {
                                Column(
                                    modifier = Modifier.align(Alignment.Center),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.Image,
                                        contentDescription = null,
                                        modifier = Modifier.size(52.dp),
                                    )
                                    Text("Foto produk belum tersedia")
                                }
                            }

                            if (chips.isNotEmpty()) {
                                LazyRow(
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    items(chips) { label ->
                                        Surface(
                                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
                                            shape = MaterialTheme.shapes.large,
                                        ) {
                                            Text(
                                                text = label,
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                                style = MaterialTheme.typography.labelMedium,
                                                fontWeight = FontWeight.SemiBold,
                                            )
                                        }
                                    }
                                }
                            }

                            IconButton(
                                onClick = { onToggleWishlist(summaryProduct) },
                                enabled = !isWishlistBusy,
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(12.dp),
                            ) {
                                Icon(
                                    imageVector = if (isWishlisted) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                    contentDescription = if (isWishlisted) "Hapus dari wishlist" else "Simpan ke wishlist",
                                    tint = MaterialTheme.colorScheme.surface,
                                )
                            }
                        }

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Text(
                                text = product.name,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(
                                    text = product.productType.ifBlank { "Produk" },
                                    style = MaterialTheme.typography.titleSmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.SemiBold,
                                )
                                Text(
                                    text = product.unit.ifBlank { "pcs" },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            product.summary?.takeIf { it.isNotBlank() }?.let { summary ->
                                Text(
                                    text = summary,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            PricePill(
                                amount = priceDisplay.amount,
                                label = priceDisplay.label,
                                compareAmount = priceDisplay.compareAmount,
                            )
                            ProductStatusInfo(
                                sessionRole = sessionRole,
                                stockMessage = product.stockBadge.message,
                                minimumQty = priceDisplay.minQty,
                                unit = product.unit,
                                isLoggedIn = isLoggedIn,
                            )
                        }
                    }
                }
            }

            wishlistMessage?.let { message ->
                item {
                    InlineNoticeCard(
                        title = "Wishlist",
                        body = message,
                        actionLabel = "Tutup",
                        onAction = onDismissWishlistMessage,
                    )
                }
            }

            if (product.promotions.isNotEmpty()) {
                item {
                    SectionCard(
                        title = "Promo aktif",
                        body = "Promo diambil langsung dari pusat. Produk ini sedang masuk penawaran yang aktif untuk cabang Anda.",
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            product.promotions.forEach { promotion ->
                                Surface(
                                    color = MaterialTheme.colorScheme.secondaryContainer,
                                    shape = MaterialTheme.shapes.large,
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        verticalArrangement = Arrangement.spacedBy(4.dp),
                                    ) {
                                        Text(
                                            text = promotion.name,
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold,
                                        )
                                        Text(
                                            text = "Kode ${promotion.code}",
                                            style = MaterialTheme.typography.bodySmall,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            product.description?.takeIf { it.isNotBlank() }?.let { description ->
                item {
                    SectionCard(
                        title = "Deskripsi produk",
                        body = description,
                    )
                }
            }

            if (product.images.size > 1) {
                item {
                    MediaStripTitle("Galeri produk")
                }
                item {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(items = product.images, key = { image -> image.id }) { image ->
                            Card(
                                modifier = Modifier.width(220.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    AsyncImage(
                                        model = image.url,
                                        contentDescription = image.altText ?: product.name,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(180.dp),
                                        contentScale = ContentScale.Crop,
                                    )
                                    Text(
                                        text = image.altText ?: "Foto produk",
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                        style = MaterialTheme.typography.bodySmall,
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                }
                            }
                        }
                    }
                }
            }

            if (product.videos.isNotEmpty()) {
                item {
                    MediaStripTitle("Video produk")
                }
                items(items = product.videos, key = { video -> video.id }) { video ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Surface(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                shape = MaterialTheme.shapes.large,
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.PlayCircle,
                                    contentDescription = null,
                                    modifier = Modifier.padding(12.dp),
                                )
                            }
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = video.platform.ifBlank { "Video" },
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                )
                                Text(
                                    text = video.url,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                            }
                        }
                    }
                }
            }

            item {
                SectionCard(
                    title = "Sinkronisasi pusat",
                    body = "Jika ada perubahan harga, stok, atau promo dari SiGe, Anda bisa tarik ulang data produk dari sini.",
                ) {
                    OutlinedButton(onClick = onRefresh) {
                        Icon(Icons.Outlined.Refresh, null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Refresh detail produk")
                    }
                }
            }

            if (relatedRows.isNotEmpty()) {
                item {
                    MediaStripTitle("Produk terkait")
                }
                items(
                    items = relatedRows,
                    key = { rowItems -> rowItems.joinToString("-") { related -> related.id } },
                ) { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.Top,
                    ) {
                        row.forEach { relatedProduct ->
                            ProductCard(
                                product = relatedProduct,
                                sessionRole = sessionRole,
                                isWishlisted = false,
                                isWishlistBusy = false,
                                isCartBusy = relatedProduct.id in pendingCartProductIds,
                                onOpenProduct = onOpenProduct,
                                onToggleWishlist = onToggleWishlist,
                                onAddToCart = onAddToCart,
                                compact = true,
                                modifier = Modifier.weight(1f),
                            )
                        }
                        if (row.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        StickyProductActionBar(
            priceLabel = priceDisplay.label,
            priceAmount = priceDisplay.amount,
            isLoggedIn = isLoggedIn,
            isCartBusy = isCartBusy,
            onPrimaryAction = { onAddToCart(summaryProduct) },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun ProductStatusScreen(
    title: String,
    body: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    isLoading: Boolean = false,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.padding(16.dp))
                    } else {
                        Icon(
                            imageVector = Icons.Outlined.Storefront,
                            contentDescription = null,
                            modifier = Modifier.padding(16.dp),
                        )
                    }
                }
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                )
                Text(
                    text = body,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (!isLoading && actionLabel != null && onAction != null) {
                    Button(onClick = onAction) {
                        Text(actionLabel)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductStatusInfo(
    sessionRole: SessionRole,
    stockMessage: String,
    minimumQty: Int?,
    unit: String,
    isLoggedIn: Boolean,
) {
    ElevatedCard(
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Outlined.LocalShipping, contentDescription = null)
                Text(
                    text = stockMessage.ifBlank { "Status stok akan mengikuti sinkron pusat." },
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                )
            }
            Text(
                text = buildString {
                    append("Minimum beli ")
                    append(minimumQty ?: 1)
                    append(" ")
                    append(unit.ifBlank { "pcs" })
                    append(". ")
                    append(
                        if (sessionRole == SessionRole.RESELLER) {
                            "Mode reseller sedang aktif."
                        } else {
                            "Harga umum sedang aktif."
                        },
                    )
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (!isLoggedIn) {
                Text(
                    text = "Login diperlukan untuk menyimpan wishlist dan keranjang pada akun Anda.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun MediaStripTitle(
    title: String,
) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
    )
}

@Composable
private fun SectionCard(
    title: String,
    body: String,
    extraContent: @Composable (() -> Unit)? = null,
) {
    ElevatedCard {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
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
            extraContent?.invoke()
        }
    }
}

@Composable
private fun InlineNoticeCard(
    title: String,
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
) {
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
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(text = body)
            Button(onClick = onAction) {
                Text(actionLabel)
            }
        }
    }
}

@Composable
private fun StickyProductActionBar(
    priceLabel: String,
    priceAmount: String?,
    isLoggedIn: Boolean,
    isCartBusy: Boolean,
    onPrimaryAction: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = priceLabel,
                    style = MaterialTheme.typography.labelLarge,
                )
                Text(
                    text = formatCurrency(priceAmount),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                )
            }
            Button(
                onClick = onPrimaryAction,
                enabled = !isCartBusy,
            ) {
                Text(
                    when {
                        isCartBusy -> "Memproses..."
                        isLoggedIn -> "Tambah ke keranjang"
                        else -> "Login lalu tambah"
                    },
                )
            }
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
