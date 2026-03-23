@file:OptIn(
    androidx.compose.foundation.ExperimentalFoundationApi::class,
    androidx.compose.material3.ExperimentalMaterial3Api::class,
)

package com.sidomakmur.kios.feature.catalog

import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.material.icons.outlined.Clear
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Sort
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sidomakmur.kios.data.pricing.priceDisplay
import com.sidomakmur.kios.data.remote.AuthCartResponse
import com.sidomakmur.kios.data.remote.BannerItem
import com.sidomakmur.kios.data.remote.CartItemPayload
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.repository.CatalogFeed
import com.sidomakmur.kios.data.session.SessionRole

private val sortOptions = listOf(
    "latest" to "Terbaru",
    "best_seller" to "Terlaris",
    "name_asc" to "Nama A-Z",
    "price_asc" to "Harga Termurah",
    "price_desc" to "Harga Tertinggi",
)

@Composable
fun CatalogRoute(
    viewModel: CatalogViewModel = viewModel(),
    sessionRole: SessionRole,
    memberLevel: String?,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    pendingCartItemIds: Set<String>,
    cart: AuthCartResponse?,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onIncreaseQty: (ProductSummary) -> Unit,
    onDecreaseQty: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
    onOpenCart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value
    val feed = state.feed
    val currentQuery = feed?.query

    LaunchedEffect(memberLevel) {
        viewModel.refresh(memberLevel = memberLevel)
    }

    var searchInput by rememberSaveable(currentQuery?.search) {
        mutableStateOf(currentQuery?.search.orEmpty())
    }
    var showFilterSheet by rememberSaveable { mutableStateOf(false) }
    var showSortSheet by rememberSaveable { mutableStateOf(false) }
    var promoOnly by rememberSaveable { mutableStateOf(false) }
    var stockOnly by rememberSaveable { mutableStateOf(false) }
    var readyToShipOnly by rememberSaveable { mutableStateOf(false) }
    var minPriceInput by rememberSaveable { mutableStateOf("") }
    var maxPriceInput by rememberSaveable { mutableStateOf("") }
    var pendingCategorySlug by rememberSaveable(currentQuery?.categorySlug) {
        mutableStateOf(currentQuery?.categorySlug)
    }
    var pendingSort by rememberSaveable(currentQuery?.sort) {
        mutableStateOf(currentQuery?.sort ?: "latest")
    }

    val cartItemsByProductId = remember(cart?.items) {
        cart?.items.orEmpty().associateBy { it.productId }
    }
    val visibleItems = remember(feed, sessionRole, promoOnly, minPriceInput, maxPriceInput) {
        feed
            ?.items
            .orEmpty()
            .filter { product ->
                val price = product.priceDisplay(sessionRole).amount?.toDoubleOrNull()
                val min = minPriceInput.toDoubleOrNull()
                val max = maxPriceInput.toDoubleOrNull()
                val promoPass = !promoOnly || product.matchesPromoFilter()
                val minPass = min == null || (price != null && price >= min)
                val maxPass = max == null || (price != null && price <= max)
                promoPass && minPass && maxPass
            }
    }
    val activeSort = currentQuery?.sort ?: pendingSort
    val activeSortLabel = sortOptions.firstOrNull { it.first == activeSort }?.second ?: "Terbaru"
    val activeCategoryName = when (val slug = currentQuery?.categorySlug) {
        null -> "Semua"
        else -> feed?.categories?.firstOrNull { it.slug == slug }?.name ?: "Kategori"
    }
    val hasCartItems = cart?.items?.isNotEmpty() == true
    val minimumOrderAmount = cart?.checkoutRules?.minimumOrderAmount ?: "500000"

    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = 16.dp,
                bottom = if (hasCartItems) 128.dp else 24.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                SearchSection(
                    searchInput = searchInput,
                    currentQuerySearch = currentQuery?.search.orEmpty(),
                    searchHistory = state.searchHistory,
                    popularCategories = state.homeFeed?.categories?.map { it.name }.orEmpty(),
                    popularProducts = state.homeFeed?.bestSellers?.map { it.name }.orEmpty(),
                    onSearchInputChange = { searchInput = it },
                    onSearch = {
                        viewModel.applyFilters(
                            search = searchInput,
                            categorySlug = currentQuery?.categorySlug,
                            sort = activeSort,
                            memberLevel = memberLevel,
                        )
                    },
                    onQuickSearch = { keyword ->
                        searchInput = keyword
                        viewModel.applyFilters(
                            search = keyword,
                            categorySlug = currentQuery?.categorySlug,
                            sort = activeSort,
                            memberLevel = memberLevel,
                        )
                    },
                    onClearSearch = {
                        searchInput = ""
                        viewModel.applyFilters(
                            search = "",
                            categorySlug = currentQuery?.categorySlug,
                            sort = activeSort,
                            memberLevel = memberLevel,
                        )
                    },
                    onClearHistory = viewModel::clearSearchHistory,
                )
            }
            item {
                PricingModeCard(
                    sessionRole = sessionRole,
                    storeName = state.homeFeed?.storeName,
                    minimumOrderAmount = minimumOrderAmount,
                )
            }
            if (state.homeFeed?.banners?.isNotEmpty() == true) {
                item {
                    PromoBannerRow(banners = state.homeFeed.banners)
                }
            }
            item {
                CategorySection(
                    feed = feed,
                    currentCategorySlug = currentQuery?.categorySlug,
                    promoOnly = promoOnly,
                    activeSort = activeSort,
                    onSelectAll = {
                        viewModel.applyFilters(
                            search = searchInput,
                            categorySlug = null,
                            sort = activeSort,
                            memberLevel = memberLevel,
                        )
                    },
                    onSelectCategory = { slug ->
                        viewModel.applyFilters(
                            search = searchInput,
                            categorySlug = slug,
                            sort = activeSort,
                            memberLevel = memberLevel,
                        )
                    },
                    onTogglePromoQuick = { promoOnly = !promoOnly },
                    onSelectBestSeller = {
                        pendingSort = "best_seller"
                        viewModel.applyFilters(
                            search = searchInput,
                            categorySlug = currentQuery?.categorySlug,
                            sort = "best_seller",
                            memberLevel = memberLevel,
                        )
                    },
                )
            }
            stickyHeader {
                FilterBar(
                    activeCategoryName = activeCategoryName,
                    activeSortLabel = activeSortLabel,
                    promoOnly = promoOnly,
                    stockOnly = stockOnly,
                    readyToShipOnly = readyToShipOnly,
                    onOpenFilter = { showFilterSheet = true },
                    onOpenSort = { showSortSheet = true },
                    onTogglePromo = { promoOnly = !promoOnly },
                    onToggleStock = { stockOnly = !stockOnly },
                    onToggleReadyToShip = { readyToShipOnly = !readyToShipOnly },
                )
            }
            state.message?.let { message ->
                item {
                    InfoMessageCard(
                        message = message,
                        onDismiss = viewModel::dismissMessage,
                    )
                }
            }
            if (state.isLoading && feed == null) {
                items(4) { SkeletonRow() }
            } else if (feed == null) {
                item {
                    EmptyStateCard(
                        title = "Gagal memuat produk",
                        description = "Periksa koneksi lalu coba lagi. Katalog akan diambil ulang dari backend pusat.",
                        primaryLabel = "Coba lagi",
                        onPrimary = { viewModel.refresh(memberLevel = memberLevel) },
                        icon = Icons.Outlined.Refresh,
                    )
                }
            } else {
                item {
                    SummaryCard(
                        itemCount = visibleItems.size,
                        activeCategoryName = activeCategoryName,
                        activeSortLabel = activeSortLabel,
                        searchKeyword = currentQuery?.search.orEmpty(),
                    )
                }
                when {
                    visibleItems.isEmpty() && currentQuery?.search?.isNotBlank() == true -> {
                        item {
                            EmptyStateCard(
                                title = "Produk tidak ditemukan",
                                description = "Coba kata kunci lain atau reset filter agar hasil lebih luas.",
                                primaryLabel = "Lihat semua produk",
                                onPrimary = {
                                    promoOnly = false
                                    minPriceInput = ""
                                    maxPriceInput = ""
                                    searchInput = ""
                                    viewModel.applyFilters("", null, "latest", memberLevel)
                                },
                            )
                        }
                    }
                    visibleItems.isEmpty() && currentQuery?.categorySlug != null -> {
                        item {
                            EmptyStateCard(
                                title = "Belum ada produk di kategori ini",
                                description = "Kategori aktif masih kosong atau filter harga terlalu sempit.",
                                primaryLabel = "Reset kategori",
                                onPrimary = {
                                    promoOnly = false
                                    minPriceInput = ""
                                    maxPriceInput = ""
                                    viewModel.applyFilters(
                                        search = searchInput,
                                        categorySlug = null,
                                        sort = activeSort,
                                        memberLevel = memberLevel,
                                    )
                                },
                            )
                        }
                    }
                    visibleItems.isEmpty() -> {
                        item {
                            EmptyStateCard(
                                title = "Belum ada produk yang cocok",
                                description = "Coba hapus filter promo atau ubah rentang harga.",
                                primaryLabel = "Reset filter",
                                onPrimary = {
                                    promoOnly = false
                                    minPriceInput = ""
                                    maxPriceInput = ""
                                },
                            )
                        }
                    }
                    else -> {
                        items(
                            items = visibleItems.chunked(2),
                            key = { row -> row.joinToString("-") { it.id } },
                        ) { row ->
                            ProductGridRow(
                                products = row,
                                sessionRole = sessionRole,
                                wishlistProductIds = wishlistProductIds,
                                pendingWishlistProductIds = pendingWishlistProductIds,
                                pendingCartProductIds = pendingCartProductIds,
                                pendingCartItemIds = pendingCartItemIds,
                                cartItemsByProductId = cartItemsByProductId,
                                onToggleWishlist = onToggleWishlist,
                                onAddToCart = onAddToCart,
                                onIncreaseQty = onIncreaseQty,
                                onDecreaseQty = onDecreaseQty,
                                onOpenProduct = onOpenProduct,
                            )
                        }
                    }
                }
            }
        }
        if (hasCartItems) {
            StickyCartSummary(
                cart = cart,
                sessionRole = sessionRole,
                minimumOrderAmount = minimumOrderAmount,
                onOpenCart = onOpenCart,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
            )
        }
    }

    if (showFilterSheet && feed != null) {
        FilterBottomSheet(
            categories = feed.categories.map { it.slug to it.name },
            selectedCategorySlug = pendingCategorySlug,
            minPriceInput = minPriceInput,
            maxPriceInput = maxPriceInput,
            promoOnly = promoOnly,
            stockOnly = stockOnly,
            readyToShipOnly = readyToShipOnly,
            onDismiss = { showFilterSheet = false },
            onCategoryChange = { pendingCategorySlug = it },
            onMinPriceChange = { minPriceInput = it },
            onMaxPriceChange = { maxPriceInput = it },
            onPromoChange = { promoOnly = it },
            onStockChange = { stockOnly = it },
            onReadyToShipChange = { readyToShipOnly = it },
            onReset = {
                pendingCategorySlug = null
                minPriceInput = ""
                maxPriceInput = ""
                promoOnly = false
                stockOnly = false
                readyToShipOnly = false
            },
            onApply = {
                showFilterSheet = false
                viewModel.applyFilters(
                    search = searchInput,
                    categorySlug = pendingCategorySlug,
                    sort = activeSort,
                    memberLevel = memberLevel,
                )
            },
        )
    }

    if (showSortSheet) {
        SortBottomSheet(
            activeSort = pendingSort,
            onDismiss = { showSortSheet = false },
            onSelectSort = { code ->
                pendingSort = code
                showSortSheet = false
                viewModel.applyFilters(
                    search = searchInput,
                    categorySlug = currentQuery?.categorySlug,
                    sort = code,
                    memberLevel = memberLevel,
                )
            },
        )
    }
}

@Composable
private fun SearchSection(
    searchInput: String,
    currentQuerySearch: String,
    searchHistory: List<String>,
    popularCategories: List<String>,
    popularProducts: List<String>,
    onSearchInputChange: (String) -> Unit,
    onSearch: () -> Unit,
    onQuickSearch: (String) -> Unit,
    onClearSearch: () -> Unit,
    onClearHistory: () -> Unit,
) {
    ElevatedCard {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Cari produk dengan cepat", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            OutlinedTextField(
                value = searchInput,
                onValueChange = onSearchInputChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Outlined.Search, null) },
                trailingIcon = {
                    if (searchInput.isNotBlank()) {
                        IconButton(onClick = onClearSearch) {
                            Icon(Icons.Outlined.Clear, "Hapus pencarian")
                        }
                    }
                },
                placeholder = { Text("Cari pupuk, beras, minyak, sabun, gula...") },
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = androidx.compose.foundation.text.KeyboardActions(onSearch = { onSearch() }),
            )
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = onSearch, modifier = Modifier.weight(1f)) {
                    Text(if (searchInput == currentQuerySearch && currentQuerySearch.isNotBlank()) "Perbarui hasil" else "Cari")
                }
                OutlinedButton(
                    onClick = onClearSearch,
                    enabled = searchInput.isNotBlank() || currentQuerySearch.isNotBlank(),
                    modifier = Modifier.weight(1f),
                ) {
                    Text("Reset")
                }
            }
            if (searchInput.isBlank() && searchHistory.isNotEmpty()) {
                ChipGroup("Riwayat pencarian", searchHistory, onQuickSearch, "Hapus", onClearHistory)
            }
            if (searchInput.isBlank() && popularProducts.isNotEmpty()) {
                ChipGroup("Produk populer", popularProducts.take(6), onQuickSearch)
            }
            if (searchInput.isBlank() && popularCategories.isNotEmpty()) {
                ChipGroup("Kategori populer", popularCategories.take(6), onQuickSearch)
            }
            if (searchInput.isNotBlank() && searchInput != currentQuerySearch) {
                Surface(color = MaterialTheme.colorScheme.primaryContainer, shape = MaterialTheme.shapes.large) {
                    Text(
                        text = "Tekan Cari untuk hasil \"$searchInput\".",
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }
}

@Composable
private fun ChipGroup(
    title: String,
    items: List<String>,
    onSelect: (String) -> Unit,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            if (actionLabel != null && onAction != null) {
                TextButton(onClick = onAction) { Text(actionLabel) }
            }
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(items) { label ->
                AssistChip(onClick = { onSelect(label) }, label = { Text(label) })
            }
        }
    }
}

@Composable
private fun PricingModeCard(
    sessionRole: SessionRole,
    storeName: String?,
    minimumOrderAmount: String,
) {
    val isReseller = sessionRole == SessionRole.RESELLER
    val gradient = if (isReseller) {
        listOf(MaterialTheme.colorScheme.tertiaryContainer, MaterialTheme.colorScheme.primaryContainer)
    } else {
        listOf(MaterialTheme.colorScheme.secondaryContainer, MaterialTheme.colorScheme.surfaceVariant)
    }
    Surface(color = Color.Transparent, shape = MaterialTheme.shapes.extraLarge) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.horizontalGradient(gradient), MaterialTheme.shapes.extraLarge)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = if (isReseller) "Mode Reseller Aktif" else "Harga Umum Aktif",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = if (isReseller) {
                    "Harga reseller diterapkan. Minimum order ${formatCurrency(minimumOrderAmount)} per transaksi."
                } else {
                    "Harga yang tampil adalah harga umum. Login reseller akan membuka harga khusus dari pusat."
                },
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                text = storeName?.let { "Cabang aktif: $it" } ?: "Cabang aktif mengikuti pengaturan toko.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun PromoBannerRow(
    banners: List<BannerItem>,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Promo singkat", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(banners.take(4)) { banner ->
                Card(
                    modifier = Modifier.width(280.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(banner.title.ifBlank { "Promo toko" }, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        banner.subtitle?.takeIf { it.isNotBlank() }?.let {
                            Text(it, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CategorySection(
    feed: CatalogFeed?,
    currentCategorySlug: String?,
    promoOnly: Boolean,
    activeSort: String,
    onSelectAll: () -> Unit,
    onSelectCategory: (String) -> Unit,
    onTogglePromoQuick: () -> Unit,
    onSelectBestSeller: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Kategori cepat", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                FilterChip(
                    selected = currentCategorySlug == null && !promoOnly && activeSort != "best_seller",
                    onClick = onSelectAll,
                    label = { Text("Semua") },
                )
            }
            item {
                FilterChip(selected = promoOnly, onClick = onTogglePromoQuick, label = { Text("Promo") })
            }
            item {
                FilterChip(selected = activeSort == "best_seller", onClick = onSelectBestSeller, label = { Text("Terlaris") })
            }
            items(feed?.categories.orEmpty(), key = { it.slug }) { category ->
                FilterChip(
                    selected = currentCategorySlug == category.slug,
                    onClick = { onSelectCategory(category.slug) },
                    label = { Text(category.name) },
                )
            }
        }
    }
}

@Composable
private fun FilterBar(
    activeCategoryName: String,
    activeSortLabel: String,
    promoOnly: Boolean,
    stockOnly: Boolean,
    readyToShipOnly: Boolean,
    onOpenFilter: () -> Unit,
    onOpenSort: () -> Unit,
    onTogglePromo: () -> Unit,
    onToggleStock: () -> Unit,
    onToggleReadyToShip: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp, bottom = 6.dp),
        tonalElevation = 4.dp,
        shadowElevation = 6.dp,
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onOpenFilter, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Outlined.Tune, null)
                    Spacer(Modifier.width(8.dp))
                    Text("Filter")
                }
                OutlinedButton(onClick = onOpenSort, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Outlined.Sort, null)
                    Spacer(Modifier.width(8.dp))
                    Text("Urutkan")
                }
            }
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = promoOnly,
                        onClick = onTogglePromo,
                        label = { Text("Promo") },
                        leadingIcon = { Icon(Icons.Outlined.LocalOffer, null, modifier = Modifier.size(18.dp)) },
                    )
                }
                item {
                    FilterChip(
                        selected = stockOnly,
                        onClick = onToggleStock,
                        enabled = false,
                        label = { Text("Stok tersedia") },
                        leadingIcon = { Icon(Icons.Outlined.Inventory2, null, modifier = Modifier.size(18.dp)) },
                    )
                }
                item {
                    FilterChip(
                        selected = readyToShipOnly,
                        onClick = onToggleReadyToShip,
                        enabled = false,
                        label = { Text("Siap kirim") },
                        leadingIcon = { Icon(Icons.Outlined.LocalShipping, null, modifier = Modifier.size(18.dp)) },
                    )
                }
            }
            Text(
                text = "Kategori: $activeCategoryName | Urutan: $activeSortLabel | Filter stok dan siap kirim akan aktif saat ringkasan stok tersedia dari backend.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun SummaryCard(
    itemCount: Int,
    activeCategoryName: String,
    activeSortLabel: String,
    searchKeyword: String,
) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text("$itemCount produk siap dibelanjakan", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            val summary = buildString {
                append("Kategori ")
                append(activeCategoryName)
                append(" | Urut ")
                append(activeSortLabel)
                if (searchKeyword.isNotBlank()) {
                    append(" | Cari \"")
                    append(searchKeyword)
                    append("\"")
                }
            }
            Text(summary, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun InfoMessageCard(
    message: String,
    onDismiss: () -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.secondaryContainer, shape = MaterialTheme.shapes.large) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(message, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
            TextButton(onClick = onDismiss) { Text("Tutup") }
        }
    }
}

@Composable
private fun ProductGridRow(
    products: List<ProductSummary>,
    sessionRole: SessionRole,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    pendingCartItemIds: Set<String>,
    cartItemsByProductId: Map<String, CartItemPayload>,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onIncreaseQty: (ProductSummary) -> Unit,
    onDecreaseQty: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        products.forEach { product ->
            val cartItem = cartItemsByProductId[product.id]
            ProductCard(
                product = product,
                sessionRole = sessionRole,
                isWishlisted = product.id in wishlistProductIds,
                isWishlistBusy = product.id in pendingWishlistProductIds,
                isCartBusy = product.id in pendingCartProductIds || cartItem?.id in pendingCartItemIds,
                cartQty = cartItem?.qty ?: 0,
                onOpenProduct = onOpenProduct,
                onToggleWishlist = onToggleWishlist,
                onAddToCart = onAddToCart,
                onIncreaseQty = { onIncreaseQty(product) },
                onDecreaseQty = { onDecreaseQty(product) },
                compact = true,
                modifier = Modifier.weight(1f),
            )
        }
        if (products.size == 1) {
            Spacer(modifier = Modifier.weight(1f))
        }
    }
}

@Composable
private fun StickyCartSummary(
    cart: AuthCartResponse?,
    sessionRole: SessionRole,
    minimumOrderAmount: String,
    onOpenCart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val safeCart = cart ?: return
    val itemCount = safeCart.items.sumOf { it.qty }
    val shortfall = remember(safeCart.grandTotal, minimumOrderAmount) {
        val total = safeCart.grandTotal.toDoubleOrNull() ?: 0.0
        val minimum = minimumOrderAmount.toDoubleOrNull() ?: 500000.0
        (minimum - total).coerceAtLeast(0.0)
    }
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("$itemCount item di keranjang", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(formatCurrency(safeCart.grandTotal), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                }
                Button(onClick = onOpenCart) { Text("Lihat Keranjang") }
            }
            if (sessionRole == SessionRole.RESELLER && safeCart.checkoutRules.applyMinimumOrder) {
                Surface(color = MaterialTheme.colorScheme.surface, shape = MaterialTheme.shapes.large) {
                    Text(
                        text = if (shortfall > 0.0) {
                            "Kurang ${formatCurrency(shortfall.toString())} lagi untuk minimum order reseller."
                        } else {
                            "Minimum order reseller sudah terpenuhi. Lanjut checkout kapan saja."
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }
}

@Composable
private fun SkeletonRow() {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        repeat(2) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(128.dp),
                        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.14f),
                        shape = MaterialTheme.shapes.large,
                    ) {}
                    repeat(3) { index ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth(if (index == 0) 0.9f else 0.7f)
                                .height(if (index == 2) 34.dp else 16.dp),
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.14f),
                            shape = MaterialTheme.shapes.small,
                        ) {}
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyStateCard(
    title: String,
    description: String,
    primaryLabel: String,
    onPrimary: () -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector = Icons.Outlined.Storefront,
) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Surface(color = MaterialTheme.colorScheme.primaryContainer, shape = MaterialTheme.shapes.extraLarge) {
                Icon(icon, null, modifier = Modifier.padding(16.dp))
            }
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Text(description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
            Button(onClick = onPrimary) { Text(primaryLabel) }
        }
    }
}

@Composable
private fun FilterBottomSheet(
    categories: List<Pair<String, String>>,
    selectedCategorySlug: String?,
    minPriceInput: String,
    maxPriceInput: String,
    promoOnly: Boolean,
    stockOnly: Boolean,
    readyToShipOnly: Boolean,
    onDismiss: () -> Unit,
    onCategoryChange: (String?) -> Unit,
    onMinPriceChange: (String) -> Unit,
    onMaxPriceChange: (String) -> Unit,
    onPromoChange: (Boolean) -> Unit,
    onStockChange: (Boolean) -> Unit,
    onReadyToShipChange: (Boolean) -> Unit,
    onReset: () -> Unit,
    onApply: () -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text("Filter produk", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(selected = selectedCategorySlug == null, onClick = { onCategoryChange(null) }, label = { Text("Semua") })
                }
                items(categories) { (slug, name) ->
                    FilterChip(selected = selectedCategorySlug == slug, onClick = { onCategoryChange(slug) }, label = { Text(name) })
                }
            }
            OutlinedTextField(value = minPriceInput, onValueChange = onMinPriceChange, modifier = Modifier.fillMaxWidth(), label = { Text("Harga minimum") }, singleLine = true)
            OutlinedTextField(value = maxPriceInput, onValueChange = onMaxPriceChange, modifier = Modifier.fillMaxWidth(), label = { Text("Harga maksimum") }, singleLine = true)
            FilterSwitchRow("Produk promo", "Tampilkan produk promo jika datanya tersedia dari pusat.", promoOnly, true, onPromoChange)
            FilterSwitchRow("Stok tersedia", "Akan aktif saat backend mengirim ringkasan stok di level kartu produk.", stockOnly, false, onStockChange)
            FilterSwitchRow("Siap kirim", "Akan aktif saat backend mengirim status kesiapan kirim di ringkasan produk.", readyToShipOnly, false, onReadyToShipChange)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onReset, modifier = Modifier.weight(1f)) { Text("Reset") }
                Button(onClick = onApply, modifier = Modifier.weight(1f)) { Text("Terapkan") }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun FilterSwitchRow(
    title: String,
    description: String,
    checked: Boolean,
    enabled: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = MaterialTheme.shapes.large) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Text(description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Switch(checked = checked, onCheckedChange = onCheckedChange, enabled = enabled)
        }
    }
}

@Composable
private fun SortBottomSheet(
    activeSort: String,
    onDismiss: () -> Unit,
    onSelectSort: (String) -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Urutkan produk", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            sortOptions.forEach { (code, label) ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = if (activeSort == code) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.large,
                    onClick = { onSelectSort(code) },
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(label, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        if (activeSort == code) {
                            Text("Aktif", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

private fun ProductSummary.matchesPromoFilter(): Boolean {
    return badges.featured ||
        price.type.equals("PROMOTION", ignoreCase = true) ||
        pricing.active.type.equals("PROMOTION", ignoreCase = true)
}
