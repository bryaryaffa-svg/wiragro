package com.sidomakmur.kios.feature.account

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.sidomakmur.kios.BuildConfig
import com.sidomakmur.kios.data.session.label
import kotlinx.coroutines.launch

@Composable
fun AccountRoute(
    viewModel: SessionViewModel,
    onOpenOrders: () -> Unit,
    onOpenProfile: () -> Unit,
    onOpenAddresses: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = viewModel.sessionUiState.collectAsStateWithLifecycle().value
    val accountData = viewModel.accountDataUiState.collectAsStateWithLifecycle().value
    val context = LocalContext.current
    val activity = context.findActivity()
    val scope = rememberCoroutineScope()

    var resellerActivationUsername by rememberSaveable { mutableStateOf("") }
    var resellerLoginUsername by rememberSaveable { mutableStateOf("") }
    var resellerPassword by rememberSaveable { mutableStateOf("") }
    var resellerActivationPassword by rememberSaveable { mutableStateOf("") }
    var resellerActivationPasswordConfirm by rememberSaveable { mutableStateOf("") }
    var googleMessage by rememberSaveable { mutableStateOf<String?>(null) }

    val launchGoogleSignIn: () -> Unit = {
        googleMessage = null
        val googleServerClientId = readGoogleServerClientId()
        if (googleServerClientId.isBlank()) {
            googleMessage = "KIOS_GOOGLE_SERVER_CLIENT_ID belum dikonfigurasi di build Android."
        } else if (activity == null) {
            googleMessage = "Activity Android tidak tersedia untuk login Google."
        } else {
            scope.launch {
                runCatching {
                    val credentialManager = CredentialManager.create(context)
                    val request = GetCredentialRequest.Builder()
                        .addCredentialOption(
                            GetSignInWithGoogleOption.Builder(
                                googleServerClientId,
                            ).build(),
                        )
                        .build()
                    val result = credentialManager.getCredential(
                        context = activity,
                        request = request,
                    )
                    val credential = result.credential
                    if (
                        credential is CustomCredential &&
                        credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                    ) {
                        GoogleIdTokenCredential.createFrom(credential.data).idToken
                    } else {
                        throw IllegalStateException("Kredensial Google yang diterima tidak valid.")
                    }
                }.onSuccess { idToken ->
                    viewModel.loginGoogle(idToken)
                }.onFailure { error ->
                    googleMessage = error.message ?: "Login Google dibatalkan atau gagal."
                }
            }
        }
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            AccountHeadline(roleLabel = state.role.label())
        }

        state.message?.let { message ->
            item {
                MessageCard(
                    text = message,
                    onDismiss = viewModel::dismissSessionMessage,
                )
            }
        }

        googleMessage?.let { message ->
            item {
                MessageCard(
                    text = message,
                    onDismiss = { googleMessage = null },
                )
            }
        }

        accountData.message?.let { message ->
            item {
                MessageCard(
                    text = message,
                    onDismiss = viewModel::dismissAccountMessage,
                )
            }
        }

        val session = state.session
        if (session != null) {
            val profile = accountData.profile ?: session.customer
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(
                            text = profile.fullName,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                        )
                        profile.email?.takeIf { it.isNotBlank() }?.let { email ->
                            Text(text = email, style = MaterialTheme.typography.bodyLarge)
                        }
                        profile.phone?.takeIf { it.isNotBlank() }?.let { phone ->
                            Text(text = phone, style = MaterialTheme.typography.bodyLarge)
                        }
                        profile.username?.takeIf { it.isNotBlank() }?.let { username ->
                            Text(
                                text = "Username reseller: $username",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                        Text(
                            text = "Role aktif: ${state.role.label()}",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary,
                        )
                        session.pricingMode.takeIf { it.isNotBlank() }?.let { pricingMode ->
                            Text(
                                text = "Mode harga: $pricingMode",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                        session.mode?.takeIf { it.isNotBlank() }?.let { mode ->
                            Text(
                                text = "Mode login: $mode",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                        Text(
                            text = "Alamat tersimpan: ${accountData.addresses.size}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        if (accountData.isLoading) {
                            CircularProgressIndicator(strokeWidth = 2.dp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = onOpenProfile) {
                            Text("Edit profil akun")
                        }
                        Button(onClick = onOpenAddresses) {
                            Text("Kelola alamat tersimpan")
                        }
                        Button(
                            onClick = {
                                googleMessage = null
                                viewModel.logout()
                            },
                        ) {
                            Text("Logout")
                        }
                        Button(onClick = onOpenOrders) {
                            Text("Riwayat pesanan")
                        }
                        Button(onClick = viewModel::refreshAccountData) {
                            Text("Muat ulang akun")
                        }
                    }
                }
            }
        } else {
            item {
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text(
                            text = "Masuk sebagai Member",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Gunakan akun Google untuk login member biasa. Member melihat harga normal dan tetap bisa checkout lewat akun pribadi.",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        Button(
                            onClick = launchGoogleSignIn,
                            enabled = !state.isBusy,
                        ) {
                            if (state.isBusy) {
                                CircularProgressIndicator(strokeWidth = 2.dp)
                            } else {
                                Text("Masuk dengan Google")
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
                            text = "Masuk sebagai Reseller",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Username reseller dibuat admin Kios Sidomakmur di SiGe setelah Anda chat admin. Aplikasi ini tidak menyediakan pendaftaran reseller bebas.",
                            style = MaterialTheme.typography.bodyMedium,
                        )

                        OutlinedTextField(
                            value = resellerLoginUsername,
                            onValueChange = { resellerLoginUsername = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Username reseller") },
                            singleLine = true,
                            enabled = !state.isBusy,
                        )
                        OutlinedTextField(
                            value = resellerPassword,
                            onValueChange = { resellerPassword = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Password reseller") },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true,
                            enabled = !state.isBusy,
                        )
                        Button(
                            onClick = { viewModel.loginReseller(resellerLoginUsername, resellerPassword) },
                            enabled = resellerLoginUsername.isNotBlank() && resellerPassword.isNotBlank() && !state.isBusy,
                        ) {
                            Text("Login reseller")
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Aktivasi / atur password reseller",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        OutlinedTextField(
                            value = resellerActivationUsername,
                            onValueChange = { resellerActivationUsername = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Username reseller dari admin") },
                            singleLine = true,
                            enabled = !state.isBusy,
                        )
                        Button(
                            onClick = { viewModel.checkResellerActivation(resellerActivationUsername) },
                            enabled = resellerActivationUsername.isNotBlank() && !state.isBusy,
                        ) {
                            Text("Cek username reseller")
                        }

                        state.resellerActivation?.let { activation ->
                            Surface(
                                color = MaterialTheme.colorScheme.secondaryContainer,
                                shape = MaterialTheme.shapes.large,
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp),
                                ) {
                                    Text(
                                        text = activation.message,
                                        style = MaterialTheme.typography.bodyMedium,
                                    )
                                    Text(
                                        text = "Status: ${activation.status}",
                                        style = MaterialTheme.typography.labelLarge,
                                        color = MaterialTheme.colorScheme.primary,
                                    )
                                }
                            }

                            if (activation.canSetPassword && activation.username.equals(resellerActivationUsername.trim(), ignoreCase = true)) {
                                OutlinedTextField(
                                    value = resellerActivationPassword,
                                    onValueChange = { resellerActivationPassword = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    label = { Text("Password reseller baru") },
                                    visualTransformation = PasswordVisualTransformation(),
                                    singleLine = true,
                                    enabled = !state.isBusy,
                                )
                                OutlinedTextField(
                                    value = resellerActivationPasswordConfirm,
                                    onValueChange = { resellerActivationPasswordConfirm = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    label = { Text("Konfirmasi password reseller") },
                                    visualTransformation = PasswordVisualTransformation(),
                                    singleLine = true,
                                    enabled = !state.isBusy,
                                )
                                Button(
                                    onClick = {
                                        if (resellerActivationPassword == resellerActivationPasswordConfirm) {
                                            viewModel.setResellerPassword(
                                                username = resellerActivationUsername,
                                                password = resellerActivationPassword,
                                            )
                                        } else {
                                            googleMessage = "Konfirmasi password reseller tidak cocok."
                                        }
                                    },
                                    enabled = resellerActivationPassword.length >= 8 &&
                                        resellerActivationPasswordConfirm.length >= 8 &&
                                        !state.isBusy,
                                ) {
                                    Text("Simpan password reseller")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AccountHeadline(
    roleLabel: String,
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = "Akun Kios Sidomakmur",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Role aktif saat ini: $roleLabel",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.primary,
        )
        Text(
            text = "Member biasa login dengan Google. Reseller login dengan username dan password dari admin SiGe.",
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}

@Composable
private fun MessageCard(
    text: String,
    onDismiss: () -> Unit,
) {
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
            Text(
                text = text,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
            Button(onClick = onDismiss) {
                Text("Tutup")
            }
        }
    }
}

private fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

private fun readGoogleServerClientId(): String {
    return runCatching {
        BuildConfig::class.java.getField("KIOS_GOOGLE_SERVER_CLIENT_ID").get(null) as? String
    }.getOrNull().orEmpty().trim()
}
