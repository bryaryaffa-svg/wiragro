package com.sidomakmur.kios.feature.account

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.CustomerProfile
import com.sidomakmur.kios.data.remote.CustomerSession
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.remote.SavedAddress
import com.sidomakmur.kios.data.remote.WishlistItem
import com.sidomakmur.kios.data.repository.CustomerRepository
import com.sidomakmur.kios.data.repository.WishlistRepository
import com.sidomakmur.kios.data.session.SessionRole
import com.sidomakmur.kios.data.session.asSessionRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OtpChallengeState(
    val challengeId: String,
    val phone: String,
    val expiresInSeconds: Int,
    val debugCode: String? = null,
)

data class ResellerActivationState(
    val username: String,
    val status: String,
    val canSetPassword: Boolean,
    val message: String,
)

data class SessionUiState(
    val session: CustomerSession? = null,
    val role: SessionRole = SessionRole.GUEST,
    val isBusy: Boolean = false,
    val otpChallenge: OtpChallengeState? = null,
    val resellerActivation: ResellerActivationState? = null,
    val message: String? = null,
)

data class AccountDataUiState(
    val profile: CustomerProfile? = null,
    val addresses: List<SavedAddress> = emptyList(),
    val isLoading: Boolean = false,
    val isSavingProfile: Boolean = false,
    val isSavingAddress: Boolean = false,
    val pendingAddressIds: Set<String> = emptySet(),
    val message: String? = null,
)

data class WishlistUiState(
    val items: List<WishlistItem> = emptyList(),
    val isLoading: Boolean = false,
    val pendingProductIds: Set<String> = emptySet(),
    val message: String? = null,
)

class SessionViewModel(
    private val customerRepository: CustomerRepository,
    private val wishlistRepository: WishlistRepository,
) : ViewModel() {
    private val _sessionUiState = MutableStateFlow(
        SessionUiState(
            session = customerRepository.session.value,
            role = customerRepository.session.value.asSessionRole(),
        ),
    )
    val sessionUiState: StateFlow<SessionUiState> = _sessionUiState.asStateFlow()

    private val _accountDataUiState = MutableStateFlow(AccountDataUiState())
    val accountDataUiState: StateFlow<AccountDataUiState> = _accountDataUiState.asStateFlow()

    private val _wishlistUiState = MutableStateFlow(WishlistUiState())
    val wishlistUiState: StateFlow<WishlistUiState> = _wishlistUiState.asStateFlow()

    init {
        viewModelScope.launch {
            customerRepository.session.collectLatest { session ->
                _sessionUiState.update { current ->
                    current.copy(
                        session = session,
                        role = session.asSessionRole(),
                        isBusy = false,
                        otpChallenge = null,
                        resellerActivation = null,
                        message = if (session == null) current.message else current.message,
                    )
                }
                if (session == null) {
                    _accountDataUiState.value = AccountDataUiState()
                    _wishlistUiState.value = WishlistUiState()
                } else {
                    loadAccountData(accessToken = session.accessToken, silent = false)
                    loadWishlist(accessToken = session.accessToken, silent = false)
                }
            }
        }
    }

    fun loginGoogle(
        idToken: String,
    ) {
        viewModelScope.launch {
            _sessionUiState.update { it.copy(isBusy = true, message = null, resellerActivation = null) }
            runCatching {
                customerRepository.loginWithGoogle(idToken)
            }.onSuccess {
                _sessionUiState.update { current ->
                    current.copy(
                        isBusy = false,
                        message = "Login Google berhasil.",
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        message = error.message ?: "Login Google gagal.",
                    )
                }
            }
        }
    }

    fun checkResellerActivation(
        username: String,
    ) {
        viewModelScope.launch {
            _sessionUiState.update { it.copy(isBusy = true, message = null, otpChallenge = null) }
            runCatching {
                customerRepository.checkResellerActivation(username)
            }.onSuccess { response ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        resellerActivation = ResellerActivationState(
                            username = response.username,
                            status = response.status,
                            canSetPassword = response.canSetPassword,
                            message = response.message,
                        ),
                        message = response.message,
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        resellerActivation = null,
                        message = error.message ?: "Username reseller belum siap diaktivasi.",
                    )
                }
            }
        }
    }

    fun setResellerPassword(
        username: String,
        password: String,
    ) {
        viewModelScope.launch {
            _sessionUiState.update { it.copy(isBusy = true, message = null) }
            runCatching {
                customerRepository.setResellerPassword(username, password)
            }.onSuccess { response ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        resellerActivation = ResellerActivationState(
                            username = response.username,
                            status = "ready_for_login",
                            canSetPassword = false,
                            message = response.message,
                        ),
                        message = response.message,
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        message = error.message ?: "Password reseller belum bisa disimpan.",
                    )
                }
            }
        }
    }

    fun loginReseller(
        username: String,
        password: String,
    ) {
        viewModelScope.launch {
            _sessionUiState.update { it.copy(isBusy = true, message = null, otpChallenge = null) }
            runCatching {
                customerRepository.loginReseller(username, password)
            }.onSuccess {
                _sessionUiState.update { current ->
                    current.copy(
                        isBusy = false,
                        message = "Login reseller berhasil. Mode reseller aktif.",
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        message = error.message ?: "Login reseller gagal.",
                    )
                }
            }
        }
    }

    fun requestOtpCode(
        phone: String,
    ) {
        viewModelScope.launch {
            _sessionUiState.update {
                it.copy(
                    isBusy = true,
                    message = null,
                    otpChallenge = null,
                    resellerActivation = null,
                )
            }
            runCatching {
                customerRepository.requestWhatsAppOtp(phone)
            }.onSuccess { challenge ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        otpChallenge = OtpChallengeState(
                            challengeId = challenge.challengeId,
                            phone = phone,
                            expiresInSeconds = challenge.expiresInSeconds,
                            debugCode = challenge.debugOtpCode,
                        ),
                        message = "OTP WhatsApp siap diverifikasi.",
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        message = error.message ?: "Permintaan OTP gagal.",
                    )
                }
            }
        }
    }

    fun verifyOtpCode(
        otpCode: String,
    ) {
        val challenge = _sessionUiState.value.otpChallenge ?: return
        viewModelScope.launch {
            _sessionUiState.update { it.copy(isBusy = true, message = null) }
            runCatching {
                customerRepository.verifyWhatsAppOtp(
                    challengeId = challenge.challengeId,
                    otpCode = otpCode,
                )
            }.onSuccess {
                _sessionUiState.update { current ->
                    current.copy(
                        isBusy = false,
                        message = "Login WhatsApp OTP berhasil.",
                    )
                }
            }.onFailure { error ->
                _sessionUiState.update {
                    it.copy(
                        isBusy = false,
                        message = error.message ?: "Verifikasi OTP gagal.",
                    )
                }
            }
        }
    }

    fun clearOtpChallenge() {
        _sessionUiState.update { it.copy(otpChallenge = null, message = null) }
    }

    fun clearResellerActivation() {
        _sessionUiState.update { it.copy(resellerActivation = null, message = null) }
    }

    fun dismissSessionMessage() {
        _sessionUiState.update { it.copy(message = null) }
    }

    fun refreshAccountData() {
        val session = _sessionUiState.value.session ?: return
        viewModelScope.launch {
            loadAccountData(accessToken = session.accessToken, silent = false)
        }
    }

    fun saveProfile(
        fullName: String,
        phone: String,
        email: String,
    ) {
        val session = _sessionUiState.value.session ?: return
        viewModelScope.launch {
            _accountDataUiState.update { it.copy(isSavingProfile = true, message = null) }
            runCatching {
                customerRepository.updateMyAccount(
                    accessToken = session.accessToken,
                    fullName = fullName,
                    phone = phone,
                    email = email,
                )
            }.onSuccess { account ->
                _accountDataUiState.update {
                    it.copy(
                        profile = account.customer,
                        addresses = account.addresses,
                        isSavingProfile = false,
                        message = "Profil akun berhasil diperbarui.",
                    )
                }
            }.onFailure { error ->
                _accountDataUiState.update {
                    it.copy(
                        isSavingProfile = false,
                        message = error.message ?: "Profil akun belum bisa diperbarui.",
                    )
                }
            }
        }
    }

    fun saveAddress(
        addressId: String?,
        label: String,
        recipientName: String,
        recipientPhone: String,
        addressLine: String,
        district: String,
        city: String,
        province: String,
        postalCode: String,
        notes: String,
        isDefault: Boolean,
    ) {
        val session = _sessionUiState.value.session ?: return
        val pendingKey = addressId ?: "new"
        viewModelScope.launch {
            _accountDataUiState.update {
                it.copy(
                    isSavingAddress = true,
                    pendingAddressIds = it.pendingAddressIds + pendingKey,
                    message = null,
                )
            }
            runCatching {
                customerRepository.saveMyAddress(
                    accessToken = session.accessToken,
                    addressId = addressId,
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
            }.onSuccess {
                loadAccountData(accessToken = session.accessToken, silent = true)
                _accountDataUiState.update {
                    it.copy(
                        isSavingAddress = false,
                        pendingAddressIds = it.pendingAddressIds - pendingKey,
                        message = "Alamat berhasil disimpan.",
                    )
                }
            }.onFailure { error ->
                _accountDataUiState.update {
                    it.copy(
                        isSavingAddress = false,
                        pendingAddressIds = it.pendingAddressIds - pendingKey,
                        message = error.message ?: "Alamat belum bisa disimpan.",
                    )
                }
            }
        }
    }

    fun deleteAddress(
        addressId: String,
    ) {
        val session = _sessionUiState.value.session ?: return
        viewModelScope.launch {
            _accountDataUiState.update {
                it.copy(
                    pendingAddressIds = it.pendingAddressIds + addressId,
                    message = null,
                )
            }
            runCatching {
                customerRepository.deleteMyAddress(
                    accessToken = session.accessToken,
                    addressId = addressId,
                )
            }.onSuccess {
                loadAccountData(accessToken = session.accessToken, silent = true)
                _accountDataUiState.update {
                    it.copy(
                        pendingAddressIds = it.pendingAddressIds - addressId,
                        message = "Alamat berhasil dihapus.",
                    )
                }
            }.onFailure { error ->
                _accountDataUiState.update {
                    it.copy(
                        pendingAddressIds = it.pendingAddressIds - addressId,
                        message = error.message ?: "Alamat belum bisa dihapus.",
                    )
                }
            }
        }
    }

    fun dismissAccountMessage() {
        _accountDataUiState.update { it.copy(message = null) }
    }

    fun refreshWishlist() {
        val session = _sessionUiState.value.session ?: return
        viewModelScope.launch {
            loadWishlist(accessToken = session.accessToken, silent = false)
        }
    }

    fun toggleWishlist(
        product: ProductSummary,
    ) {
        val session = _sessionUiState.value.session
        if (session == null) {
            _wishlistUiState.update { it.copy(message = "Silakan login untuk menggunakan wishlist.") }
            return
        }

        viewModelScope.launch {
            _wishlistUiState.update {
                it.copy(
                    pendingProductIds = it.pendingProductIds + product.id,
                    message = null,
                )
            }
            val isAlreadyWishlisted = isWishlisted(product.id)
            runCatching {
                if (isAlreadyWishlisted) {
                    wishlistRepository.removeItem(
                        accessToken = session.accessToken,
                        productId = product.id,
                    )
                } else {
                    wishlistRepository.addItem(
                        accessToken = session.accessToken,
                        productId = product.id,
                    )
                }
                loadWishlist(accessToken = session.accessToken, silent = true)
            }.onFailure { error ->
                _wishlistUiState.update {
                    it.copy(message = error.message ?: "Wishlist belum bisa diproses.")
                }
            }
            _wishlistUiState.update {
                it.copy(pendingProductIds = it.pendingProductIds - product.id)
            }
        }
    }

    fun dismissWishlistMessage() {
        _wishlistUiState.update { it.copy(message = null) }
    }

    fun isWishlisted(
        productId: String,
    ): Boolean = _wishlistUiState.value.items.any { it.productId == productId }

    fun logout() {
        customerRepository.logout()
        _sessionUiState.value = SessionUiState()
        _wishlistUiState.value = WishlistUiState()
    }

    private suspend fun loadWishlist(
        accessToken: String,
        silent: Boolean,
    ) {
        _wishlistUiState.update {
            it.copy(
                isLoading = !silent,
                message = null,
            )
        }
        runCatching {
            wishlistRepository.getWishlist(accessToken = accessToken)
        }.onSuccess { response ->
            _wishlistUiState.update {
                it.copy(
                    items = response.items,
                    isLoading = false,
                    message = null,
                )
            }
        }.onFailure { error ->
            _wishlistUiState.update {
                it.copy(
                    isLoading = false,
                    message = error.message ?: "Wishlist belum dapat dimuat.",
                )
            }
        }
    }

    private suspend fun loadAccountData(
        accessToken: String,
        silent: Boolean,
    ) {
        _accountDataUiState.update {
            it.copy(
                isLoading = !silent,
                message = if (silent) it.message else null,
            )
        }
        runCatching {
            customerRepository.getMyAccount(accessToken = accessToken)
        }.onSuccess { account ->
            _accountDataUiState.update {
                it.copy(
                    profile = account.customer,
                    addresses = account.addresses,
                    isLoading = false,
                    message = null,
                )
            }
        }.onFailure { error ->
            _accountDataUiState.update {
                it.copy(
                    isLoading = false,
                    message = error.message ?: "Profil akun belum dapat dimuat.",
                )
            }
        }
    }

    companion object {
        fun Factory(
            customerRepository: CustomerRepository,
            wishlistRepository: WishlistRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(SessionViewModel::class.java)) {
                    return SessionViewModel(
                        customerRepository = customerRepository,
                        wishlistRepository = wishlistRepository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
