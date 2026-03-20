package com.sidomakmur.kios.feature.checkout

import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.data.remote.CheckoutOption
import com.sidomakmur.kios.data.remote.SavedAddress
import com.sidomakmur.kios.data.repository.CheckoutDraft
import com.sidomakmur.kios.feature.cart.CartViewModel
import com.sidomakmur.kios.feature.catalog.formatCurrency

@Composable
fun CheckoutRoute(
    viewModel: CartViewModel,
    savedAddresses: List<SavedAddress>,
    onOpenAddresses: () -> Unit,
    onOpenOrderDetail: (String) -> Unit,
    onBackToCart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.uiState.collectAsStateWithLifecycle().value
    val cart = state.cart

    if (state.session == null || cart == null || cart.items.isEmpty()) {
        EmptyCheckoutState(
            title = "Checkout belum siap",
            body = "Keranjang aktif dan session login diperlukan untuk membuat order.",
            onBackToCart = onBackToCart,
            modifier = modifier,
        )
        return
    }

    val defaultAddress = savedAddresses.firstOrNull { it.isDefault } ?: savedAddresses.firstOrNull()
    var shippingMethod by rememberSaveable(cart.id) {
        mutableStateOf(cart.checkoutRules.shippingMethods.firstOrNull()?.code ?: "delivery")
    }
    var paymentMethod by rememberSaveable(cart.id) {
        mutableStateOf(cart.checkoutRules.paymentMethods.firstOrNull()?.code ?: "duitku-va")
    }
    var selectedAddressId by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.id) }
    var recipientName by rememberSaveable(cart.id, defaultAddress?.id) {
        mutableStateOf(defaultAddress?.recipientName ?: state.session.customer.fullName)
    }
    var recipientPhone by rememberSaveable(cart.id, defaultAddress?.id) {
        mutableStateOf(defaultAddress?.recipientPhone ?: state.session.customer.phone.orEmpty())
    }
    var addressLine by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.addressLine.orEmpty()) }
    var district by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.district.orEmpty()) }
    var city by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.city ?: "Surabaya") }
    var province by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.province ?: "Jawa Timur") }
    var postalCode by rememberSaveable(cart.id, defaultAddress?.id) { mutableStateOf(defaultAddress?.postalCode.orEmpty()) }
    var notes by rememberSaveable(cart.id) { mutableStateOf("") }

    val isDelivery = shippingMethod == "delivery"
    val canSubmit = !state.isSubmitting &&
        recipientName.isNotBlank() &&
        recipientPhone.isNotBlank() &&
        (!isDelivery || (addressLine.isNotBlank() && city.isNotBlank() && province.isNotBlank()))

    Box(modifier = modifier.fillMaxSize()) {
        androidx.compose.foundation.lazy.LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 144.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                CheckoutHeroCard(
                    isReseller = cart.customerRole == "reseller",
                    grandTotal = cart.grandTotal,
                    minimumOrderAmount = cart.checkoutRules.minimumOrderAmount,
                    applyMinimumOrder = cart.checkoutRules.applyMinimumOrder,
                )
            }

            state.message?.let { message ->
                item {
                    CheckoutMessageCard(
                        title = "Status checkout",
                        body = message,
                        actionLabel = "Tutup",
                        onAction = viewModel::dismissMessage,
                    )
                }
            }

            if (state.pendingOfflineCheckouts.isNotEmpty()) {
                item {
                    CheckoutMessageCard(
                        title = "Draft checkout offline",
                        body = "${state.pendingOfflineCheckouts.size} draft menunggu sinkron otomatis saat jaringan kembali.",
                        actionLabel = if (state.isSyncingPendingCheckouts) "Menyinkronkan..." else "Sinkronkan sekarang",
                        onAction = viewModel::retryPendingOfflineCheckouts,
                        enabled = !state.isSyncingPendingCheckouts,
                    )
                }
            }

            state.checkoutResult?.let { result ->
                item {
                    ElevatedCard(
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Outlined.CheckCircle, contentDescription = null)
                                Text(
                                    text = "Order ${result.order.orderNumber} berhasil dibuat",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                )
                            }
                            Text("Grand total ${formatCurrency(result.order.grandTotal)}")
                            Text("Metode bayar ${result.order.paymentMethod ?: "-"}")
                            Text("Sumber nota ${result.order.invoiceSource ?: "-"}")
                            if (result.invoices.isNotEmpty()) {
                                Text(
                                    text = result.invoices.joinToString(prefix = "Dokumen: ", separator = ", ") { it.type },
                                    style = MaterialTheme.typography.bodyMedium,
                                )
                            }
                            Button(onClick = { onOpenOrderDetail(result.order.id) }) {
                                Text(if (result.order.paymentMethod == "duitku-va") "Lihat detail dan bayar" else "Lihat detail pesanan")
                            }
                            OutlinedButton(onClick = onBackToCart) {
                                Text("Kembali ke keranjang")
                            }
                        }
                    }
                }
            }

            item {
                OptionCard(
                    title = "Pilih pengiriman",
                    icon = Icons.Outlined.LocalShipping,
                    options = cart.checkoutRules.shippingMethods,
                    selectedCode = shippingMethod,
                    onSelect = { shippingMethod = it },
                )
            }

            item {
                OptionCard(
                    title = "Pilih pembayaran",
                    icon = Icons.Outlined.Payments,
                    options = cart.checkoutRules.paymentMethods,
                    selectedCode = paymentMethod,
                    onSelect = { paymentMethod = it },
                )
            }

            item {
                ElevatedCard {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.Person, contentDescription = null)
                            Text(
                                text = "Data penerima",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                            )
                        }

                        if (isDelivery && savedAddresses.isNotEmpty()) {
                            Text(
                                text = "Alamat tersimpan",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                            )
                            savedAddresses.forEach { address ->
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            selectedAddressId = address.id
                                            recipientName = address.recipientName
                                            recipientPhone = address.recipientPhone
                                            addressLine = address.addressLine
                                            district = address.district.orEmpty()
                                            city = address.city
                                            province = address.province
                                            postalCode = address.postalCode.orEmpty()
                                            notes = address.notes.orEmpty()
                                        },
                                    color = if (selectedAddressId == address.id) {
                                        MaterialTheme.colorScheme.secondaryContainer
                                    } else {
                                        MaterialTheme.colorScheme.surfaceVariant
                                    },
                                    shape = MaterialTheme.shapes.large,
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        verticalArrangement = Arrangement.spacedBy(4.dp),
                                    ) {
                                        Text(address.label, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                        Text("${address.recipientName} • ${address.recipientPhone}")
                                        Text(
                                            text = listOfNotNull(
                                                address.addressLine,
                                                address.district,
                                                address.city,
                                                address.province,
                                                address.postalCode,
                                            ).joinToString(", "),
                                            style = MaterialTheme.typography.bodySmall,
                                        )
                                    }
                                }
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Button(onClick = onOpenAddresses) { Text("Kelola alamat") }
                                OutlinedButton(
                                    onClick = {
                                        selectedAddressId = null
                                        recipientName = state.session.customer.fullName
                                        recipientPhone = state.session.customer.phone.orEmpty()
                                        addressLine = ""
                                        district = ""
                                        city = "Surabaya"
                                        province = "Jawa Timur"
                                        postalCode = ""
                                        notes = ""
                                    },
                                ) {
                                    Text("Isi manual")
                                }
                            }
                        } else if (isDelivery) {
                            Button(onClick = onOpenAddresses) { Text("Tambah alamat tersimpan") }
                        }

                        OutlinedTextField(
                            value = recipientName,
                            onValueChange = { recipientName = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Nama penerima") },
                            singleLine = true,
                        )
                        OutlinedTextField(
                            value = recipientPhone,
                            onValueChange = { recipientPhone = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Nomor WhatsApp") },
                            singleLine = true,
                        )
                        if (isDelivery) {
                            OutlinedTextField(
                                value = addressLine,
                                onValueChange = { addressLine = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Alamat lengkap") },
                            )
                            OutlinedTextField(
                                value = district,
                                onValueChange = { district = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Kecamatan") },
                                singleLine = true,
                            )
                            OutlinedTextField(
                                value = city,
                                onValueChange = { city = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Kota") },
                                singleLine = true,
                            )
                            OutlinedTextField(
                                value = province,
                                onValueChange = { province = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Provinsi") },
                                singleLine = true,
                            )
                            OutlinedTextField(
                                value = postalCode,
                                onValueChange = { postalCode = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Kode pos") },
                                singleLine = true,
                            )
                        }
                        OutlinedTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Catatan order") },
                        )
                    }
                }
            }

            item {
                ElevatedCard {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.Description, contentDescription = null)
                            Text(
                                text = "Ringkasan pesanan",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                        cart.items.forEach { item ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(
                                    text = "${item.productName} x${item.qty}",
                                    modifier = Modifier.weight(1f),
                                    style = MaterialTheme.typography.bodyMedium,
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = formatCurrency(item.total),
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium,
                                )
                            }
                        }
                        SummaryRow("Grand total", formatCurrency(cart.grandTotal), true)
                        SummaryRow("Nota", cart.checkoutRules.invoiceSource, false)
                    }
                }
            }
        }

        CheckoutBottomBar(
            grandTotal = cart.grandTotal,
            paymentMethod = paymentMethod,
            isSubmitting = state.isSubmitting,
            canSubmit = canSubmit,
            onSubmit = {
                viewModel.submitCheckout(
                    CheckoutDraft(
                        shippingMethod = shippingMethod,
                        paymentMethod = paymentMethod,
                        recipientName = recipientName,
                        recipientPhone = recipientPhone,
                        addressLine = addressLine,
                        district = district,
                        city = city,
                        province = province,
                        postalCode = postalCode,
                        notes = notes,
                    ),
                )
            },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun CheckoutHeroCard(
    isReseller: Boolean,
    grandTotal: String,
    minimumOrderAmount: String?,
    applyMinimumOrder: Boolean,
) {
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
                text = if (isReseller) "Checkout reseller" else "Checkout member",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = if (applyMinimumOrder) {
                    "Minimum order reseller ${formatCurrency(minimumOrderAmount)}. Checkout akan ditolak bila total belum memenuhi."
                } else {
                    "Pilih pengiriman dan pembayaran sesuai kebutuhan order Anda."
                },
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                text = formatCurrency(grandTotal),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Black,
            )
        }
    }
}

@Composable
private fun CheckoutMessageCard(
    title: String,
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
    enabled: Boolean = true,
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
            Button(onClick = onAction, enabled = enabled) {
                Text(actionLabel)
            }
        }
    }
}

@Composable
private fun OptionCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    options: List<CheckoutOption>,
    selectedCode: String,
    onSelect: (String) -> Unit,
) {
    ElevatedCard {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null)
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            options.forEach { option ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelect(option.code) },
                    color = if (option.code == selectedCode) {
                        MaterialTheme.colorScheme.secondaryContainer
                    } else {
                        MaterialTheme.colorScheme.surfaceVariant
                    },
                    shape = MaterialTheme.shapes.large,
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Text(
                            text = option.label,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Text(
                            text = if (option.code == selectedCode) "Pilihan aktif" else "Tap untuk memilih",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CheckoutBottomBar(
    grandTotal: String,
    paymentMethod: String,
    isSubmitting: Boolean,
    canSubmit: Boolean,
    onSubmit: () -> Unit,
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Total bayar", style = MaterialTheme.typography.labelLarge)
                    Text(
                        text = formatCurrency(grandTotal),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                    )
                }
                Surface(
                    color = MaterialTheme.colorScheme.surface,
                    shape = MaterialTheme.shapes.large,
                ) {
                    Text(
                        text = paymentMethod,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium,
                    )
                }
            }
            Button(
                onClick = onSubmit,
                enabled = canSubmit,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (isSubmitting) "Memproses..." else "Buat order")
            }
        }
    }
}

@Composable
private fun SummaryRow(
    label: String,
    value: String,
    highlight: Boolean,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
        Text(
            text = value,
            style = if (highlight) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            fontWeight = if (highlight) FontWeight.Bold else FontWeight.Medium,
        )
    }
}

@Composable
private fun EmptyCheckoutState(
    title: String,
    body: String,
    onBackToCart: () -> Unit,
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
                        imageVector = Icons.Outlined.ShoppingBag,
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
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Button(onClick = onBackToCart) {
                    Text("Kembali ke keranjang")
                }
            }
        }
    }
}
