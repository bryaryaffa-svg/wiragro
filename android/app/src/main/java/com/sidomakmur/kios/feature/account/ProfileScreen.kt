package com.sidomakmur.kios.feature.account

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
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

@Composable
fun ProfileRoute(
    viewModel: SessionViewModel,
    modifier: Modifier = Modifier,
) {
    val sessionState = viewModel.sessionUiState.collectAsStateWithLifecycle().value
    val accountState = viewModel.accountDataUiState.collectAsStateWithLifecycle().value
    val profile = accountState.profile ?: sessionState.session?.customer

    if (sessionState.session == null || profile == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = "Profil akun belum tersedia",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Silakan login terlebih dahulu agar data profil bisa dikelola.",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 12.dp),
            )
        }
        return
    }

    var fullName by rememberSaveable(profile.id, profile.fullName) { mutableStateOf(profile.fullName) }
    var phone by rememberSaveable(profile.id, profile.phone) { mutableStateOf(profile.phone.orEmpty()) }
    var email by rememberSaveable(profile.id, profile.email) { mutableStateOf(profile.email.orEmpty()) }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Edit Profil Akun",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "Perubahan profil disimpan ke backend dan langsung menyegarkan session akun.",
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
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Nama lengkap") },
                        singleLine = true,
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Nomor WhatsApp") },
                        singleLine = true,
                    )
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Email") },
                        singleLine = true,
                    )
                    if (accountState.isLoading || accountState.isSavingProfile) {
                        CircularProgressIndicator(strokeWidth = 2.dp)
                    }
                    Button(
                        onClick = {
                            viewModel.saveProfile(
                                fullName = fullName,
                                phone = phone,
                                email = email,
                            )
                        },
                        enabled = fullName.isNotBlank() && !accountState.isSavingProfile,
                    ) {
                        Text(if (accountState.isSavingProfile) "Menyimpan..." else "Simpan profil")
                    }
                    Button(onClick = viewModel::refreshAccountData) {
                        Text("Muat ulang profil")
                    }
                }
            }
        }
    }
}
