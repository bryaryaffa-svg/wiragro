package com.sidomakmur.kios.feature.cart

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudOff
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.data.remote.AuthCartResponse
import com.sidomakmur.kios.feature.catalog.formatCurrency

@Composable
fun CartRoute(
    viewModel: CartViewModel,
    onOpenAccount: () -> Unit,
    onOpenCheckout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value

    when {
        state.session == null -> EmptyCartState(
            title = "Keranjang memerlukan login",
            body = "Login sebagai member atau reseller agar harga, aturan checkout, dan riwayat keranjang mengikuti akun Anda.",
            actionLabel = "Buka Akun",
            onAction = onOpenAccount,
            modifier = modifier,
        )

        state.isLoading && state.cart == null -> LoadingCartState(modifier = modifier)

        state.cart == null || state.cart.items.isEmpty() -> EmptyCartState(
            title = "Keranjang masih kosong",
            body = "Tambahkan produk dari tab Produk atau detail produk untuk mulai checkout.",
            actionLabel = "Muat ulang",
            onAction = viewModel::refresh,
            modifier = modifier,
        )

        else -> CartScreen(
            state = state,
            onOpenCheckout = onOpenCheckout,
            onIncreaseQty = { itemId, qty -> viewModel.updateItemQty(itemId, qty + 1) },
            onDecreaseQty = { itemId, qty -> viewModel.updateItemQty(itemId, (qty - 1).coerceAtLeast(0)) },
            onRetryPendingOffline = viewModel::retryPendingOfflineCheckouts,
            onDismissMessage = viewModel::dismissMessage,
            modifier = modifier,
        )
    }
}

@Composable
private fun CartScreen(
    state: CartUiState,
    onOpenCheckout: () -> Unit,
    onIncreaseQty: (String, Int) -> Unit,
    onDecreaseQty: (String, Int) -> Unit,
    onRetryPendingOffline: () -> Unit,
    onDismissMessage: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val cart = state.cart ?: return
    val minimumOrder = cart.checkoutRules.minimumOrderAmount?.toDoubleOrNull() ?: 500000.0
    val grandTotal = cart.grandTotal.toDoubleOrNull() ?: 0.0
    val resellerShortfall = (minimumOrder - grandTotal).coerceAtLeast(0.0)
    val resellerProgress = remember(cart.grandTotal, cart.checkoutRules.minimumOrderAmount) {
        (grandTotal / minimumOrder).coerceIn(0.0, 1.0).toFloat()
    }

    Box(modifier = modifier.fillMaxSize()) {
        androidx.compose.foundation.lazy.LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 132.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                CartHeroCard(cart = cart)
            }

            state.message?.let { message ->
                item {
                    InfoBanner(
                        title = "Status keranjang",
                        body = message,
                        actionLabel = "Tutup",
                        onAction = onDismissMessage,
                    )
                }
            }

            if (cart.checkoutRules.applyMinimumOrder) {
                item {
                    ElevatedCard {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Text(
                                text = "Progress minimum order reseller",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            LinearProgressIndicator(
                                progress = resellerProgress,
                                modifier = Modifier.fillMaxWidth(),
                            )
                            Text(
                                text = if (resellerShortfall > 0.0) {
                                    "Kurang ${formatCurrency(resellerShortfall.toString())} lagi untuk minimum order reseller."
                                } else {
                                    "Minimum order reseller sudah terpenuhi."
                                },
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                }
            }

            if (state.pendingOfflineCheckouts.isNotEmpty()) {
                item {
                    ElevatedCard {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(Icons.Outlined.CloudOff, contentDescription = null)
                                Text(
                                    text = "Antrian checkout offline",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                )
                            }
                            Text(
                                text = "${state.pendingOfflineCheckouts.size} draft menunggu sinkron saat koneksi kembali tersedia.",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            state.pendingOfflineCheckouts.forEach { pending ->
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
                                            text = "${pending.paymentMethod} • ${pending.shippingMethod}",
                                            fontWeight = FontWeight.Bold,
                                        )
                                        Text("Total ${formatCurrency(pending.grandTotal)}")
                                        Text("Status ${pending.status} • Attempt ${pending.attemptCount}")
                                        pending.lastError?.takeIf { it.isNotBlank() }?.let { lastError ->
                                            Text(lastError, style = MaterialTheme.typography.bodySmall)
                                        }
                                    }
                                }
                            }
                            OutlinedButton(
                                onClick = onRetryPendingOffline,
                                enabled = !state.isSyncingPendingCheckouts,
                            ) {
                                Text(if (state.isSyncingPendingCheckouts) "Menyinkronkan..." else "Coba sinkron sekarang")
                            }
                        }
                    }
                }
            }

            items(items = cart.items, key = { item -> item.id }) { item ->
                CartItemCard(
                    cart = cart,
                    itemName = item.productName ?: "Produk",
                    priceLabel = item.priceSnapshot.label ?: if (cart.pricingMode == "reseller") "Harga Reseller" else "Harga Umum",
                    priceAmount = item.priceSnapshot.amount,
                    qty = item.qty,
                    subtotal = item.total,
                    promotionText = item.promotionSnapshot.matchedPromotions.firstOrNull()?.name,
                    isBusy = item.id in state.pendingItemIds,
                    onIncreaseQty = { onIncreaseQty(item.id, item.qty) },
                    onDecreaseQty = { onDecreaseQty(item.id, item.qty) },
                )
            }
        }

        CartBottomBar(
            cart = cart,
            onOpenCheckout = onOpenCheckout,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun CartHeroCard(
    cart: AuthCartResponse,
) {
    val itemCount = cart.items.sumOf { it.qty }
    ElevatedCard(
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = if (cart.customerRole == "reseller") "Keranjang reseller aktif" else "Keranjang belanja aktif",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = if (cart.customerRole == "reseller") {
                    "Harga reseller diterapkan. COD dan kirim langsung oleh toko tetap mengikuti aturan cabang aktif."
                } else {
                    "Keranjang ini mengikuti harga umum akun Anda dan siap dilanjutkan ke checkout."
                },
                style = MaterialTheme.typography.bodyMedium,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("$itemCount item", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(formatCurrency(cart.grandTotal), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusPill(if (cart.checkoutRules.allowCod) "COD tersedia" else "COD nonaktif")
                StatusPill(if (cart.checkoutRules.allowStoreDelivery) "Dikirim oleh toko" else "Ikut aturan cabang")
                StatusPill("Nota ${cart.checkoutRules.invoiceSource}")
            }
        }
    }
}

@Composable
private fun CartItemCard(
    cart: AuthCartResponse,
    itemName: String,
    priceLabel: String,
    priceAmount: String?,
    qty: Int,
    subtotal: String,
    promotionText: String?,
    isBusy: Boolean,
    onIncreaseQty: () -> Unit,
    onDecreaseQty: () -> Unit,
) {
    Card {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.secondaryContainer,
                    shape = MaterialTheme.shapes.large,
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Inventory2,
                        contentDescription = null,
                        modifier = Modifier.padding(14.dp),
                    )
                }
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = itemName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = priceLabel,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        text = formatCurrency(priceAmount),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                    )
                    promotionText?.let {
                        StatusPill(it)
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedButton(onClick = onDecreaseQty, enabled = !isBusy) { Text("-") }
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = MaterialTheme.shapes.large,
                    ) {
                        Text(
                            text = qty.toString(),
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                    OutlinedButton(onClick = onIncreaseQty, enabled = !isBusy) { Text("+") }
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Subtotal", style = MaterialTheme.typography.bodySmall)
                    Text(
                        text = formatCurrency(subtotal),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }

            Text(
                text = if (cart.pricingMode == "reseller") {
                    "Perubahan qty langsung mengikuti harga reseller dari backend."
                } else {
                    "Perubahan qty langsung memperbarui harga umum dari backend."
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun CartBottomBar(
    cart: AuthCartResponse,
    onOpenCheckout: () -> Unit,
    modifier: Modifier = Modifier,
) {
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
            SummaryLine("Subtotal", formatCurrency(cart.subtotal))
            SummaryLine("Diskon", formatCurrency(cart.discountTotal))
            SummaryLine("Grand total", formatCurrency(cart.grandTotal), highlight = true)
            Button(
                onClick = onOpenCheckout,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Lanjut checkout")
            }
        }
    }
}

@Composable
private fun InfoBanner(
    title: String,
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
) {
    Surface(
        color = MaterialTheme.colorScheme.secondaryContainer,
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(body, style = MaterialTheme.typography.bodyMedium)
            Button(onClick = onAction) { Text(actionLabel) }
        }
    }
}

@Composable
private fun StatusPill(
    label: String,
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = MaterialTheme.shapes.large,
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
        )
    }
}

@Composable
private fun SummaryLine(
    label: String,
    value: String,
    highlight: Boolean = false,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
        Text(
            text = value,
            style = if (highlight) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyLarge,
            fontWeight = if (highlight) FontWeight.Bold else FontWeight.Medium,
            color = if (highlight) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
        )
    }
}

@Composable
private fun LoadingCartState(
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
private fun EmptyCartState(
    title: String,
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
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
                    Icon(
                        imageVector = Icons.Outlined.Person.takeIf { actionLabel == "Buka Akun" } ?: Icons.Outlined.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.padding(16.dp),
                    )
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
                Button(onClick = onAction) {
                    Text(actionLabel)
                }
            }
        }
    }
}
