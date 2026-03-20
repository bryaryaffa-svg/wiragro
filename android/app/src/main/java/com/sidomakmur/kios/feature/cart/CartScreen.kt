package com.sidomakmur.kios.feature.cart

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
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
            body = "Login sebagai member atau reseller agar harga dan aturan checkout mengikuti akun Anda.",
            actionLabel = "Buka Akun",
            onAction = onOpenAccount,
            modifier = modifier,
        )

        state.isLoading && state.cart == null -> Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator()
        }

        state.cart == null || state.cart.items.isEmpty() -> EmptyCartState(
            title = "Keranjang masih kosong",
            body = "Tambahkan produk dari katalog atau detail produk untuk mulai checkout.",
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
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Keranjang Aktif",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = if (cart.customerRole == "reseller") {
                        "Mode reseller aktif. Harga dan minimum order mengikuti backend SiGe."
                    } else {
                        "Harga dan checkout mengikuti role akun yang sedang login."
                    },
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
                        Button(onClick = onDismissMessage) {
                            Text("Tutup")
                        }
                    }
                }
            }
        }

        if (cart.checkoutRules.applyMinimumOrder) {
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            text = "Aturan reseller",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Minimum order ${formatCurrency(cart.checkoutRules.minimumOrderAmount)} per transaksi.",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
        }

        if (state.pendingOfflineCheckouts.isNotEmpty()) {
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text(
                            text = "Antrian checkout offline",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "${state.pendingOfflineCheckouts.size} draft checkout menunggu sinkron saat koneksi tersedia.",
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
                        Button(
                            onClick = onRetryPendingOffline,
                            enabled = !state.isSyncingPendingCheckouts,
                        ) {
                            Text(if (state.isSyncingPendingCheckouts) "Menyinkronkan..." else "Coba sinkron sekarang")
                        }
                    }
                }
            }
        }

        items(cart.items, key = { it.id }) { item ->
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text(
                        text = item.productName ?: "Produk",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = item.priceSnapshot.label ?: if (cart.pricingMode == "reseller") "Harga Reseller" else "Harga Umum",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        text = formatCurrency(item.priceSnapshot.amount),
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { onDecreaseQty(item.id, item.qty) },
                                enabled = item.id !in state.pendingItemIds,
                            ) {
                                Text("-")
                            }
                            Surface(
                                color = MaterialTheme.colorScheme.secondaryContainer,
                                shape = MaterialTheme.shapes.large,
                            ) {
                                Text(
                                    text = item.qty.toString(),
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                )
                            }
                            OutlinedButton(
                                onClick = { onIncreaseQty(item.id, item.qty) },
                                enabled = item.id !in state.pendingItemIds,
                            ) {
                                Text("+")
                            }
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Subtotal", style = MaterialTheme.typography.bodySmall)
                            Text(
                                text = formatCurrency(item.total),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
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
private fun EmptyCartState(
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
        Column(
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
