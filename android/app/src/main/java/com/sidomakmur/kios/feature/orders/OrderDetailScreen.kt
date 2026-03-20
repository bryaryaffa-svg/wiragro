package com.sidomakmur.kios.feature.orders

import android.app.DownloadManager
import android.content.Intent
import android.net.Uri
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.feature.catalog.formatCurrency
import kotlinx.coroutines.delay

@Composable
fun OrderDetailRoute(
    viewModel: OrderViewModel,
    orderId: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value
    val context = LocalContext.current

    LaunchedEffect(orderId) {
        if (state.selectedOrderId != orderId || state.selectedOrder == null) {
            viewModel.openOrder(orderId)
        }
    }

    LaunchedEffect(state.paymentUrlToOpen) {
        val paymentUrl = state.paymentUrlToOpen ?: return@LaunchedEffect
        context.startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            },
        )
        viewModel.consumePaymentUrl()
    }

    LaunchedEffect(orderId, state.session?.accessToken) {
        if (state.session == null) {
            return@LaunchedEffect
        }
        while (true) {
            delay(20_000)
            viewModel.refreshSelectedOrder()
        }
    }

    when {
        state.isLoadingDetail || state.selectedOrderId != orderId && state.selectedOrder == null -> Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator()
        }

        state.selectedOrder == null -> Box(
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
                    text = state.message ?: "Detail pesanan belum tersedia.",
                    style = MaterialTheme.typography.bodyLarge,
                )
                Button(onClick = onBack) {
                    Text("Kembali")
                }
            }
        }

        else -> {
            val order = state.selectedOrder
            LazyColumn(
                modifier = modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Detail Pesanan",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = order.orderNumber,
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.primary,
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
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text("Status ${order.status}", fontWeight = FontWeight.Bold)
                            Text("Pembayaran ${order.paymentStatus}")
                            Text("Fulfillment ${order.fulfillmentStatus}")
                            Text("Metode bayar ${order.paymentMethod ?: "-"}")
                            Text("Pengiriman ${order.shippingMethod ?: "-"}")
                            Text("Sumber nota ${order.invoiceSource ?: "-"}")
                            Text(
                                text = formatCurrency(order.grandTotal),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                OutlinedButton(onClick = {
                                    viewModel.refreshSelectedOrder()
                                }) {
                                    Text("Refresh")
                                }
                                if (order.canPayOnline) {
                                    Button(
                                        onClick = { viewModel.createPayment(order.id) },
                                        enabled = !state.isCreatingPayment,
                                    ) {
                                        Text(if (state.isCreatingPayment) "Memproses..." else "Bayar dengan Duitku")
                                    }
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
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text(
                                text = "Pengiriman dan pembayaran",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            Text("Shipment ${order.shipment.shipmentNumber ?: "-"}")
                            Text("Status shipment ${order.shipment.status ?: "-"}")
                            Text("Resi ${order.shipment.trackingNumber ?: "-"}")
                            Text("Referensi bayar ${order.payment.reference ?: "-"}")
                            Text("Status gateway ${order.payment.status ?: "-"}")
                        }
                    }
                }

                if (order.invoices.isNotEmpty()) {
                    item {
                        Card {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                Text(
                                    text = "Invoice / Nota",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                )
                                order.invoices.forEach { invoice ->
                                    val resolvedUrl = viewModel.resolveDocumentUrl(invoice.documentUrl)
                                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text("${invoice.type} - ${resolvedUrl ?: "-"}")
                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            OutlinedButton(
                                                onClick = {
                                                    resolvedUrl?.let { url ->
                                                        context.startActivity(
                                                            Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                                                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                                            },
                                                        )
                                                    }
                                                },
                                                enabled = !resolvedUrl.isNullOrBlank(),
                                            ) {
                                                Text("Buka nota")
                                            }
                                            OutlinedButton(
                                                onClick = {
                                                    resolvedUrl?.let { url ->
                                                        val request = DownloadManager.Request(Uri.parse(url))
                                                            .setTitle("Nota ${invoice.type} ${order.orderNumber}")
                                                            .setDescription("Unduh dokumen nota toko")
                                                            .setNotificationVisibility(
                                                                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED,
                                                            )
                                                            .setDestinationInExternalPublicDir(
                                                                android.os.Environment.DIRECTORY_DOWNLOADS,
                                                                "${order.orderNumber}-${invoice.type}.pdf",
                                                            )
                                                        context.getSystemService(DownloadManager::class.java)?.enqueue(request)
                                                    }
                                                },
                                                enabled = !resolvedUrl.isNullOrBlank(),
                                            ) {
                                                Text("Unduh")
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                item {
                    Text(
                        text = "Item pesanan",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                }

                items(order.items, key = { it.id }) { item ->
                    Card {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(
                                text = item.productName ?: "Produk",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            Text("Qty ${item.qty}")
                            Text("Harga satuan ${formatCurrency(item.unitPrice)}")
                            Text("Total ${formatCurrency(item.lineTotal)}")
                        }
                    }
                }

                item {
                    Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
                        Text("Kembali ke riwayat")
                    }
                }
            }
        }
    }
}
