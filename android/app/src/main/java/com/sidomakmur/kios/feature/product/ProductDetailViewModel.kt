package com.sidomakmur.kios.feature.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.ProductDetailResponse
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ProductDetailUiState {
    data object Loading : ProductDetailUiState
    data class Success(val product: ProductDetailResponse) : ProductDetailUiState
    data class Error(val message: String) : ProductDetailUiState
}

class ProductDetailViewModel(
    private val slug: String,
    private val memberLevel: String?,
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<ProductDetailUiState>(ProductDetailUiState.Loading)
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = ProductDetailUiState.Loading
            _uiState.value = runCatching {
                repository.getProductDetail(
                    slug = slug,
                    memberLevel = memberLevel,
                )
            }.fold(
                onSuccess = { ProductDetailUiState.Success(it) },
                onFailure = {
                    ProductDetailUiState.Error(it.message ?: "Detail produk belum dapat dimuat.")
                },
            )
        }
    }

    companion object {
        fun Factory(
            slug: String,
            memberLevel: String?,
            repository: StorefrontRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(ProductDetailViewModel::class.java)) {
                    return ProductDetailViewModel(
                        slug = slug,
                        memberLevel = memberLevel,
                        repository = repository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
