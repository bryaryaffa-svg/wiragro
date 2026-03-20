package com.sidomakmur.kios.feature.orders

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.feature.catalog.formatCurrency
import kotlinx.coroutines.delay

@Composable
fun OrderHistoryRoute(
    viewModel: OrderViewModel,
    onOpenAccount: () -> Unit,
    onOpenOrderDetail: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value

    LaunchedEffect(state.session?.accessToken) {
        if (state.session != null) {
            viewModel.refreshHistory()
        }
    }

    LaunchedEffect(state.session?.accessToken, state.items.size) {
        if (state.session == null) {
            return@LaunchedEffect
        }
        while (true) {
            delay(30_000)
            viewModel.refreshHistory()
        }
    }

    when {
        state.session == null -> EmptyOrdersState(
            title = "Riwayat pesanan memerlukan login",
            body = "Login sebagai member atau reseller untuk melihat order milik akun Anda.",
            actionLabel = "Buka Akun",
            onAction = onOpenAccount,
            modifier = modifier,
        )

        state.isLoadingHistory && state.items.isEmpty() -> Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator()
        }

        state.items.isEmpty() -> EmptyOrdersState(
            title = "Belum ada pesanan",
            body = "Pesanan yang dibuat dari cart akan muncul di sini.",
            actionLabel = "Muat ulang",
            onAction = viewModel::refreshHistory,
            modifier = modifier,
        )

        else -> LazyColumn(
            modifier = modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Riwayat Pesanan",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = "Menampilkan order milik akun yang sedang login.",
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

            items(state.items, key = { it.id }) { order ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenOrderDetail(order.id) },
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(
                            text = order.orderNumber,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Status ${order.status} | Pembayaran ${order.paymentStatus}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        Text(
                            text = "Metode ${order.paymentMethod ?: "-"} | Pengiriman ${order.shippingMethod ?: "-"}",
                            style = MaterialTheme.typography.bodySmall,
                        )
                        Text(
                            text = formatCurrency(order.grandTotal),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyOrdersState(
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
