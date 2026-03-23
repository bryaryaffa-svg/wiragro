package com.sidomakmur.kios.feature.catalog

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.repository.CatalogFeed
import com.sidomakmur.kios.data.repository.CatalogQuery
import com.sidomakmur.kios.data.repository.HomeFeed
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CatalogUiState(
    val homeFeed: HomeFeed? = null,
    val feed: CatalogFeed? = null,
    val isLoading: Boolean = false,
    val message: String? = null,
    val searchHistory: List<String> = emptyList(),
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
        rememberSearchTerm(search)
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

    fun clearSearchHistory() {
        _uiState.update { it.copy(searchHistory = emptyList()) }
    }

    private fun loadCatalog(
        query: CatalogQuery,
    ) {
        activeQuery = query
        viewModelScope.launch {
            val previous = _uiState.value
            _uiState.value = previous.copy(
                isLoading = true,
                message = null,
            )
            _uiState.value = runCatching {
                coroutineScope {
                    val homeDeferred = async { repository.getHomeFeed() }
                    val catalogDeferred = async { repository.getCatalog(query) }
                    homeDeferred.await() to catalogDeferred.await()
                }
            }.fold(
                onSuccess = { (homeFeed, feed) ->
                    CatalogUiState(
                        homeFeed = homeFeed,
                        feed = feed,
                        isLoading = false,
                        searchHistory = previous.searchHistory,
                    )
                },
                onFailure = { error ->
                    previous.copy(
                        isLoading = false,
                        message = error.message ?: "Katalog belum dapat dimuat.",
                    )
                },
            )
        }
    }

    private fun rememberSearchTerm(
        term: String,
    ) {
        val normalized = term.trim()
        if (normalized.isBlank()) {
            return
        }
        _uiState.update { state ->
            state.copy(
                searchHistory = buildList {
                    add(normalized)
                    state.searchHistory.forEach { existing ->
                        if (!existing.equals(normalized, ignoreCase = true)) {
                            add(existing)
                        }
                    }
                }.take(6),
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
