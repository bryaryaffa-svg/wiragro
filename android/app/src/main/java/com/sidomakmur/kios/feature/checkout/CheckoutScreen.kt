package com.sidomakmur.kios.feature.checkout

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.data.remote.SavedAddress
import com.sidomakmur.kios.data.remote.CheckoutOption
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

    var shippingMethod by rememberSaveable(cart.id) {
        mutableStateOf(cart.checkoutRules.shippingMethods.firstOrNull()?.code ?: "delivery")
    }
    var paymentMethod by rememberSaveable(cart.id) {
        mutableStateOf(cart.checkoutRules.paymentMethods.firstOrNull()?.code ?: "duitku-va")
    }
    val defaultAddress = savedAddresses.firstOrNull { it.isDefault } ?: savedAddresses.firstOrNull()
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

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Checkout ${if (cart.customerRole == "reseller") "Reseller" else "Member"}",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = if (cart.checkoutRules.applyMinimumOrder) {
                        "Minimum order reseller ${formatCurrency(cart.checkoutRules.minimumOrderAmount)}. Checkout akan ditolak bila total belum memenuhi."
                    } else {
                        "Pilih pengiriman dan pembayaran sesuai kebutuhan order."
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
                        Button(onClick = viewModel::dismissMessage) {
                            Text("Tutup")
                        }
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
                            text = "Draft checkout offline",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "${state.pendingOfflineCheckouts.size} draft menunggu sinkron otomatis saat jaringan kembali.",
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
                            onClick = viewModel::retryPendingOfflineCheckouts,
                            enabled = !state.isSyncingPendingCheckouts,
                        ) {
                            Text(if (state.isSyncingPendingCheckouts) "Menyinkronkan..." else "Coba sinkron sekarang")
                        }
                    }
                }
            }
        }

        state.checkoutResult?.let { result ->
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(
                            text = "Order ${result.order.orderNumber} berhasil dibuat",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                        )
                        Text("Grand total ${formatCurrency(result.order.grandTotal)}")
                        Text("Metode bayar ${result.order.paymentMethod ?: "-"}")
                        Text("Sumber nota ${result.order.invoiceSource ?: "-"}")
                        if (result.invoices.isNotEmpty()) {
                            Text(
                                text = result.invoices.joinToString(
                                    prefix = "Dokumen: ",
                                    separator = ", ",
                                ) { it.type },
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                        Button(onClick = { onOpenOrderDetail(result.order.id) }) {
                            Text(if (result.order.paymentMethod == "duitku-va") "Lihat detail dan bayar" else "Lihat detail pesanan")
                        }
                        OutlinedActionButton(
                            text = "Kembali ke keranjang",
                            onClick = onBackToCart,
                        )
                    }
                }
            }
        }

        item {
            OptionCard(
                title = "Pengiriman",
                options = cart.checkoutRules.shippingMethods,
                selectedCode = shippingMethod,
                onSelect = { shippingMethod = it },
            )
        }

        item {
            OptionCard(
                title = "Pembayaran",
                options = cart.checkoutRules.paymentMethods,
                selectedCode = paymentMethod,
                onSelect = { paymentMethod = it },
            )
        }

        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text(
                        text = "Data penerima",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    if (shippingMethod == "delivery" && savedAddresses.isNotEmpty()) {
                        Text(
                            text = "Pilih alamat tersimpan",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
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
                                    Text(
                                        text = address.label,
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                    )
                                    Text("${address.recipientName} • ${address.recipientPhone}")
                                    Text(
                                        listOfNotNull(
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
                            Button(onClick = onOpenAddresses) {
                                Text("Kelola alamat")
                            }
                            Button(
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
                    } else if (shippingMethod == "delivery") {
                        Button(onClick = onOpenAddresses) {
                            Text("Tambah alamat tersimpan")
                        }
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
                    if (shippingMethod == "delivery") {
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
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = "Ringkasan pesanan",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    cart.items.forEach { item ->
                        Text(
                            text = "${item.productName} x${item.qty} - ${formatCurrency(item.total)}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                    Text(
                        text = "Grand total ${formatCurrency(cart.grandTotal)}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Button(
                        onClick = {
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
                        enabled = !state.isSubmitting &&
                            recipientName.isNotBlank() &&
                            recipientPhone.isNotBlank() &&
                            (shippingMethod != "delivery" || (addressLine.isNotBlank() && city.isNotBlank() && province.isNotBlank())),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(if (state.isSubmitting) "Memproses..." else "Buat order")
                    }
                }
            }
        }
    }
}

@Composable
private fun OutlinedActionButton(
    text: String,
    onClick: () -> Unit,
) {
    androidx.compose.material3.OutlinedButton(onClick = onClick) {
        Text(text)
    }
}

@Composable
private fun OptionCard(
    title: String,
    options: List<CheckoutOption>,
    selectedCode: String,
    onSelect: (String) -> Unit,
) {
    Card {
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
                    Text(
                        text = option.label,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyCheckoutState(
    title: String,
    body: String,
    onBackToCart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = body,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(top = 12.dp),
        )
        Button(
            onClick = onBackToCart,
            modifier = Modifier.padding(top = 20.dp),
        ) {
            Text("Kembali ke keranjang")
        }
    }
}
