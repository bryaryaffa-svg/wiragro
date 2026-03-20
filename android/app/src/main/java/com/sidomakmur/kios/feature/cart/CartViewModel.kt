package com.sidomakmur.kios.feature.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.AuthCartResponse
import com.sidomakmur.kios.data.remote.CheckoutResponse
import com.sidomakmur.kios.data.remote.CustomerSession
import com.sidomakmur.kios.data.repository.CartRepository
import com.sidomakmur.kios.data.repository.CheckoutDraft
import com.sidomakmur.kios.data.repository.CustomerRepository
import com.sidomakmur.kios.data.repository.PendingCheckoutItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CartUiState(
    val cart: AuthCartResponse? = null,
    val session: CustomerSession? = null,
    val isLoading: Boolean = false,
    val isSubmitting: Boolean = false,
    val pendingProductIds: Set<String> = emptySet(),
    val pendingItemIds: Set<String> = emptySet(),
    val pendingOfflineCheckouts: List<PendingCheckoutItem> = emptyList(),
    val isSyncingPendingCheckouts: Boolean = false,
    val checkoutResult: CheckoutResponse? = null,
    val message: String? = null,
)

class CartViewModel(
    private val customerRepository: CustomerRepository,
    private val cartRepository: CartRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            customerRepository.session.collectLatest { session ->
                _uiState.update {
                    it.copy(
                        session = session,
                        cart = if (session == null) null else it.cart,
                        pendingOfflineCheckouts = if (session == null) emptyList() else it.pendingOfflineCheckouts,
                        checkoutResult = if (session == null) null else it.checkoutResult,
                        message = null,
                    )
                }
                if (session == null) {
                    _uiState.value = CartUiState()
                } else {
                    refresh()
                    refreshPendingOfflineCheckouts()
                }
            }
        }
    }

    fun refresh() {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, message = null) }
            runCatching {
                cartRepository.getCart(session.accessToken)
            }.onSuccess { cart ->
                _uiState.update {
                    it.copy(
                        cart = cart,
                        isLoading = false,
                        message = null,
                    )
                }
                refreshPendingOfflineCheckouts()
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        message = error.message ?: "Keranjang belum bisa dimuat.",
                    )
                }
                refreshPendingOfflineCheckouts()
            }
        }
    }

    fun addProduct(
        productId: String,
    ) {
        val session = _uiState.value.session ?: run {
            _uiState.update { it.copy(message = "Login dulu agar keranjang tersimpan pada akun Anda.") }
            return
        }
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    pendingProductIds = it.pendingProductIds + productId,
                    message = null,
                )
            }
            runCatching {
                cartRepository.addItem(
                    accessToken = session.accessToken,
                    productId = productId,
                    qty = 1,
                )
            }.onSuccess { cart ->
                _uiState.update {
                    it.copy(
                        cart = cart,
                        pendingProductIds = it.pendingProductIds - productId,
                        message = "Produk masuk ke keranjang.",
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        pendingProductIds = it.pendingProductIds - productId,
                        message = error.message ?: "Produk belum bisa ditambahkan ke keranjang.",
                    )
                }
            }
        }
    }

    fun updateItemQty(
        itemId: String,
        qty: Int,
    ) {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    pendingItemIds = it.pendingItemIds + itemId,
                    message = null,
                )
            }
            runCatching {
                cartRepository.updateItem(
                    accessToken = session.accessToken,
                    itemId = itemId,
                    qty = qty,
                )
            }.onSuccess { cart ->
                _uiState.update {
                    it.copy(
                        cart = cart,
                        pendingItemIds = it.pendingItemIds - itemId,
                        message = null,
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        pendingItemIds = it.pendingItemIds - itemId,
                        message = error.message ?: "Keranjang belum bisa diperbarui.",
                    )
                }
            }
        }
    }

    fun submitCheckout(
        draft: CheckoutDraft,
    ) {
        val session = _uiState.value.session ?: return
        val cart = _uiState.value.cart ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, message = null, checkoutResult = null) }
            runCatching {
                cartRepository.checkout(
                    accessToken = session.accessToken,
                    customerId = session.customer.id,
                    customerName = session.customer.fullName,
                    cart = cart,
                    draft = draft,
                )
            }.onSuccess { outcome ->
                refreshPendingOfflineCheckouts()
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        checkoutResult = outcome.response,
                        message = if (outcome.wasQueuedOffline) {
                            "Koneksi backend sedang tidak tersedia. Draft checkout disimpan ke antrian offline dan akan dicoba ulang otomatis saat online."
                        } else {
                            "Order berhasil dibuat."
                        },
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        message = error.message ?: "Checkout belum berhasil diproses.",
                    )
                }
            }
        }
    }

    fun refreshPendingOfflineCheckouts() {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            runCatching {
                cartRepository.getPendingCheckouts(session.customer.id)
            }.onSuccess { pending ->
                _uiState.update { it.copy(pendingOfflineCheckouts = pending) }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        message = error.message ?: "Antrian checkout offline belum dapat dimuat.",
                    )
                }
            }
        }
    }

    fun retryPendingOfflineCheckouts() {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSyncingPendingCheckouts = true, message = null) }
            runCatching {
                cartRepository.retryPendingCheckouts(
                    accessToken = session.accessToken,
                    customerId = session.customer.id,
                )
            }.onSuccess { result ->
                _uiState.update {
                    it.copy(
                        isSyncingPendingCheckouts = false,
                        pendingOfflineCheckouts = result.pendingItems,
                        message = when {
                            result.submittedCount > 0 -> "Antrian offline berhasil disinkronkan: ${result.submittedCount} draft terkirim."
                            result.blockedCount > 0 -> "Sebagian antrian offline ditahan karena ditolak backend. Periksa detail draft yang berstatus blocked."
                            else -> "Tidak ada draft offline yang perlu dikirim ulang."
                        },
                    )
                }
                refresh()
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isSyncingPendingCheckouts = false,
                        message = error.message ?: "Retry antrian offline belum berhasil.",
                    )
                }
            }
        }
    }

    fun dismissMessage() {
        _uiState.update { it.copy(message = null) }
    }

    fun clearCheckoutResult() {
        _uiState.update { it.copy(checkoutResult = null) }
    }

    fun finishCheckoutFlow() {
        clearCheckoutResult()
        refresh()
        refreshPendingOfflineCheckouts()
    }

    companion object {
        fun Factory(
            customerRepository: CustomerRepository,
            cartRepository: CartRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(CartViewModel::class.java)) {
                    return CartViewModel(
                        customerRepository = customerRepository,
                        cartRepository = cartRepository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
