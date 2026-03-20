package com.sidomakmur.kios.feature.account

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sidomakmur.kios.data.remote.SavedAddress

@Composable
fun AddressBookRoute(
    viewModel: SessionViewModel,
    modifier: Modifier = Modifier,
) {
    val sessionState = viewModel.sessionUiState.collectAsStateWithLifecycle().value
    val accountState = viewModel.accountDataUiState.collectAsStateWithLifecycle().value

    if (sessionState.session == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = "Alamat tersimpan belum tersedia",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Silakan login lebih dulu agar alamat pengiriman bisa disimpan di akun.",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 12.dp),
            )
        }
        return
    }

    var editingAddressId by rememberSaveable { mutableStateOf<String?>(null) }
    var label by rememberSaveable { mutableStateOf("") }
    var recipientName by rememberSaveable { mutableStateOf(sessionState.session.customer.fullName) }
    var recipientPhone by rememberSaveable { mutableStateOf(sessionState.session.customer.phone.orEmpty()) }
    var addressLine by rememberSaveable { mutableStateOf("") }
    var district by rememberSaveable { mutableStateOf("") }
    var city by rememberSaveable { mutableStateOf("Surabaya") }
    var province by rememberSaveable { mutableStateOf("Jawa Timur") }
    var postalCode by rememberSaveable { mutableStateOf("") }
    var notes by rememberSaveable { mutableStateOf("") }
    var isDefault by rememberSaveable { mutableStateOf(false) }

    fun populateForm(address: SavedAddress?) {
        editingAddressId = address?.id
        label = address?.label.orEmpty()
        recipientName = address?.recipientName ?: sessionState.session.customer.fullName
        recipientPhone = address?.recipientPhone ?: sessionState.session.customer.phone.orEmpty()
        addressLine = address?.addressLine.orEmpty()
        district = address?.district.orEmpty()
        city = address?.city ?: "Surabaya"
        province = address?.province ?: "Jawa Timur"
        postalCode = address?.postalCode.orEmpty()
        notes = address?.notes.orEmpty()
        isDefault = address?.isDefault ?: false
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Buku Alamat",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "Simpan banyak alamat dan tandai salah satu sebagai alamat utama checkout.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        accountState.message?.let { message ->
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
                        Button(onClick = viewModel::dismissAccountMessage) {
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
                    Text(
                        text = if (editingAddressId == null) "Tambah alamat baru" else "Edit alamat",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    OutlinedTextField(
                        value = label,
                        onValueChange = { label = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Label alamat") },
                        singleLine = true,
                    )
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
                        label = { Text("Nomor penerima") },
                        singleLine = true,
                    )
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
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Catatan alamat") },
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Checkbox(
                            checked = isDefault,
                            onCheckedChange = { isDefault = it },
                        )
                        Text(
                            text = "Jadikan alamat utama",
                            modifier = Modifier.padding(top = 12.dp),
                        )
                    }
                    if (accountState.isSavingAddress || accountState.isLoading) {
                        CircularProgressIndicator(strokeWidth = 2.dp)
                    }
                    Button(
                        onClick = {
                            viewModel.saveAddress(
                                addressId = editingAddressId,
                                label = label,
                                recipientName = recipientName,
                                recipientPhone = recipientPhone,
                                addressLine = addressLine,
                                district = district,
                                city = city,
                                province = province,
                                postalCode = postalCode,
                                notes = notes,
                                isDefault = isDefault,
                            )
                        },
                        enabled = label.isNotBlank() &&
                            recipientName.isNotBlank() &&
                            recipientPhone.isNotBlank() &&
                            addressLine.isNotBlank() &&
                            city.isNotBlank() &&
                            province.isNotBlank() &&
                            !accountState.isSavingAddress,
                    ) {
                        Text(if (accountState.isSavingAddress) "Menyimpan..." else "Simpan alamat")
                    }
                    OutlinedButton(
                        onClick = { populateForm(null) },
                    ) {
                        Text("Reset form")
                    }
                }
            }
        }

        if (accountState.addresses.isEmpty() && !accountState.isLoading) {
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            text = "Belum ada alamat tersimpan",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text("Tambahkan alamat pertama Anda agar checkout delivery lebih cepat.")
                    }
                }
            }
        }

        items(accountState.addresses, key = { it.id }) { address ->
            val isBusy = address.id in accountState.pendingAddressIds
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = address.label,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    if (address.isDefault) {
                        Text(
                            text = "Alamat utama",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                    Text("${address.recipientName} • ${address.recipientPhone}")
                    Text(buildAddressSummary(address))
                    address.notes?.takeIf { it.isNotBlank() }?.let { addressNotes ->
                        Text(
                            text = addressNotes,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { populateForm(address) },
                            enabled = !isBusy,
                        ) {
                            Text("Edit")
                        }
                        OutlinedButton(
                            onClick = {
                                viewModel.saveAddress(
                                    addressId = address.id,
                                    label = address.label,
                                    recipientName = address.recipientName,
                                    recipientPhone = address.recipientPhone,
                                    addressLine = address.addressLine,
                                    district = address.district.orEmpty(),
                                    city = address.city,
                                    province = address.province,
                                    postalCode = address.postalCode.orEmpty(),
                                    notes = address.notes.orEmpty(),
                                    isDefault = true,
                                )
                            },
                            enabled = !isBusy && !address.isDefault,
                        ) {
                            Text("Jadikan utama")
                        }
                        OutlinedButton(
                            onClick = { viewModel.deleteAddress(address.id) },
                            enabled = !isBusy,
                        ) {
                            Text(if (isBusy) "Memproses..." else "Hapus")
                        }
                    }
                }
            }
        }
    }
}

private fun buildAddressSummary(
    address: SavedAddress,
): String = listOfNotNull(
    address.addressLine.takeIf { it.isNotBlank() },
    address.district?.takeIf { it.isNotBlank() },
    address.city.takeIf { it.isNotBlank() },
    address.province.takeIf { it.isNotBlank() },
    address.postalCode?.takeIf { it.isNotBlank() },
).joinToString(", ")
