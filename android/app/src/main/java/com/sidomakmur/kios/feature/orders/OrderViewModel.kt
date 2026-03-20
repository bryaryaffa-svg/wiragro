package com.sidomakmur.kios.feature.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.CustomerSession
import com.sidomakmur.kios.data.remote.DuitkuCreateResponse
import com.sidomakmur.kios.data.remote.OrderDetailResponse
import com.sidomakmur.kios.data.remote.OrderSummary
import com.sidomakmur.kios.data.repository.CustomerRepository
import com.sidomakmur.kios.data.repository.OrderRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OrderUiState(
    val session: CustomerSession? = null,
    val isLoadingHistory: Boolean = false,
    val isLoadingDetail: Boolean = false,
    val isCreatingPayment: Boolean = false,
    val items: List<OrderSummary> = emptyList(),
    val selectedOrder: OrderDetailResponse? = null,
    val selectedOrderId: String? = null,
    val lastPayment: DuitkuCreateResponse? = null,
    val paymentUrlToOpen: String? = null,
    val message: String? = null,
)

class OrderViewModel(
    private val customerRepository: CustomerRepository,
    private val orderRepository: OrderRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(OrderUiState())
    val uiState: StateFlow<OrderUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            customerRepository.session.collectLatest { session ->
                _uiState.update {
                    it.copy(
                        session = session,
                        items = if (session == null) emptyList() else it.items,
                        selectedOrder = if (session == null) null else it.selectedOrder,
                        selectedOrderId = if (session == null) null else it.selectedOrderId,
                        paymentUrlToOpen = null,
                        lastPayment = null,
                        message = null,
                    )
                }
                if (session == null) {
                    _uiState.value = OrderUiState()
                } else {
                    refreshHistory()
                }
            }
        }
    }

    fun refreshHistory() {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingHistory = true, message = null) }
            runCatching {
                orderRepository.getOrders(session.accessToken)
            }.onSuccess { response ->
                _uiState.update {
                    it.copy(
                        items = response.items,
                        isLoadingHistory = false,
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isLoadingHistory = false,
                        message = error.message ?: "Riwayat pesanan belum bisa dimuat.",
                    )
                }
            }
        }
    }

    fun openOrder(orderId: String) {
        _uiState.update { it.copy(selectedOrderId = orderId, selectedOrder = null, lastPayment = null) }
        refreshSelectedOrder()
    }

    fun refreshSelectedOrder() {
        val session = _uiState.value.session ?: return
        val orderId = _uiState.value.selectedOrderId ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingDetail = true, message = null) }
            runCatching {
                orderRepository.getOrderDetail(
                    accessToken = session.accessToken,
                    orderId = orderId,
                )
            }.onSuccess { order ->
                _uiState.update {
                    it.copy(
                        selectedOrder = order,
                        isLoadingDetail = false,
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isLoadingDetail = false,
                        message = error.message ?: "Detail pesanan belum bisa dimuat.",
                    )
                }
            }
        }
    }

    fun createPayment(orderId: String) {
        val session = _uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isCreatingPayment = true, message = null, paymentUrlToOpen = null) }
            runCatching {
                orderRepository.createDuitkuPayment(
                    accessToken = session.accessToken,
                    orderId = orderId,
                )
            }.onSuccess { payment ->
                _uiState.update {
                    it.copy(
                        isCreatingPayment = false,
                        lastPayment = payment,
                        paymentUrlToOpen = payment.paymentUrl,
                        message = "Link pembayaran Duitku siap dibuka.",
                    )
                }
                refreshSelectedOrder()
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isCreatingPayment = false,
                        message = error.message ?: "Link pembayaran Duitku belum bisa dibuat.",
                    )
                }
            }
        }
    }

    fun consumePaymentUrl() {
        _uiState.update { it.copy(paymentUrlToOpen = null) }
    }

    fun dismissMessage() {
        _uiState.update { it.copy(message = null) }
    }

    fun clearSelectedOrder() {
        _uiState.update { it.copy(selectedOrder = null, selectedOrderId = null, lastPayment = null, message = null) }
    }

    fun resolveDocumentUrl(
        documentUrl: String?,
    ): String? = orderRepository.resolveDocumentUrl(documentUrl)

    companion object {
        fun Factory(
            customerRepository: CustomerRepository,
            orderRepository: OrderRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(OrderViewModel::class.java)) {
                    return OrderViewModel(
                        customerRepository = customerRepository,
                        orderRepository = orderRepository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
