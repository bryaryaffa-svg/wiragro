package com.sidomakmur.kios.feature.catalog

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.repository.CatalogFeed
import com.sidomakmur.kios.data.repository.CatalogQuery
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CatalogUiState(
    val feed: CatalogFeed? = null,
    val isLoading: Boolean = false,
    val message: String? = null,
)

class CatalogViewModel(
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(CatalogUiState(isLoading = true))
    val uiState: StateFlow<CatalogUiState> = _uiState.asStateFlow()

    private var activeQuery = CatalogQuery()

    init {
        refresh()
    }

    fun refresh(
        memberLevel: String? = activeQuery.memberLevel,
    ) {
        loadCatalog(activeQuery.copy(memberLevel = memberLevel))
    }

    fun applyFilters(
        search: String,
        categorySlug: String?,
        sort: String,
        memberLevel: String?,
    ) {
        loadCatalog(
            CatalogQuery(
                search = search,
                categorySlug = categorySlug,
                sort = sort,
                memberLevel = memberLevel,
            ),
        )
    }

    fun dismissMessage() {
        _uiState.value = _uiState.value.copy(message = null)
    }

    private fun loadCatalog(
        query: CatalogQuery,
    ) {
        activeQuery = query
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                message = null,
            )
            _uiState.value = runCatching {
                repository.getCatalog(query)
            }.fold(
                onSuccess = { feed ->
                    CatalogUiState(
                        feed = feed,
                        isLoading = false,
                    )
                },
                onFailure = { error ->
                    _uiState.value.copy(
                        isLoading = false,
                        message = error.message ?: "Katalog belum dapat dimuat.",
                    )
                },
            )
        }
    }

    companion object {
        fun Factory(
            repository: StorefrontRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(CatalogViewModel::class.java)) {
                    return CatalogViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
