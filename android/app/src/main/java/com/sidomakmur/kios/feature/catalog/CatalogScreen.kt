package com.sidomakmur.kios.feature.catalog

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.session.SessionRole

private val sortOptions = listOf(
    "latest" to "Terbaru",
    "best_seller" to "Terlaris",
    "name_asc" to "Nama A-Z",
    "price_asc" to "Harga Termurah",
    "price_desc" to "Harga Tertinggi",
)

@Composable
@OptIn(ExperimentalLayoutApi::class)
fun CatalogRoute(
    viewModel: CatalogViewModel = viewModel(),
    sessionRole: SessionRole,
    memberLevel: String?,
    wishlistProductIds: Set<String>,
    pendingWishlistProductIds: Set<String>,
    pendingCartProductIds: Set<String>,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onOpenProduct: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value
    val currentQuery = state.feed?.query

    LaunchedEffect(memberLevel) {
        viewModel.refresh(memberLevel = memberLevel)
    }

    var search by rememberSaveable(currentQuery?.search, currentQuery?.categorySlug, currentQuery?.sort) {
        mutableStateOf(currentQuery?.search.orEmpty())
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Katalog Produk",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "Cari produk, filter kategori, dan pilih sorting yang benar-benar memengaruhi urutan data dari backend.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        state.message?.let { message ->
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
                        Button(onClick = viewModel::dismissMessage) {
                            Text("Tutup")
                        }
                    }
                }
            }
        }

        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    OutlinedTextField(
                        value = search,
                        onValueChange = { search = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Cari produk, benih, herbisida, nutrisi") },
                        singleLine = true,
                    )
                    Button(
                        onClick = {
                            viewModel.applyFilters(
                                search = search,
                                categorySlug = currentQuery?.categorySlug,
                                sort = currentQuery?.sort ?: "latest",
                                memberLevel = memberLevel,
                            )
                        },
                    ) {
                        Text("Terapkan pencarian")
                    }
                }
            }
        }

        state.feed?.let { feed ->
            item {
                Text(
                    text = "Kategori",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            item {
                androidx.compose.foundation.layout.FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    AssistChip(
                        onClick = {
                            viewModel.applyFilters(
                                search = search,
                                categorySlug = null,
                                sort = feed.query.sort,
                                memberLevel = memberLevel,
                            )
                        },
                        label = { Text("Semua") },
                    )
                    feed.categories.forEach { category ->
                        AssistChip(
                            onClick = {
                                viewModel.applyFilters(
                                    search = search,
                                    categorySlug = category.slug,
                                    sort = feed.query.sort,
                                    memberLevel = memberLevel,
                                )
                            },
                            label = { Text(category.name) },
                        )
                    }
                }
            }

            item {
                Text(
                    text = "Sorting",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            item {
                androidx.compose.foundation.layout.FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    sortOptions.forEach { (code, label) ->
                        AssistChip(
                            onClick = {
                                viewModel.applyFilters(
                                    search = search,
                                    categorySlug = feed.query.categorySlug,
                                    sort = code,
                                    memberLevel = memberLevel,
                                )
                            },
                            label = { Text(label) },
                        )
                    }
                }
            }

            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Text(
                            text = "Menampilkan ${feed.items.size} produk",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Filter aktif: ${feed.query.categorySlug ?: "semua kategori"} | sort ${feed.query.sort}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }

            if (feed.items.isEmpty() && !state.isLoading) {
                item {
                    Card {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(
                                text = "Produk tidak ditemukan",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            Text("Coba ganti kata kunci, kategori, atau urutan sorting.")
                        }
                    }
                }
            }

            items(feed.items, key = { it.id }) { product ->
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

        if (state.isLoading) {
            item {
                CircularProgressIndicator()
            }
        }
    }
}
