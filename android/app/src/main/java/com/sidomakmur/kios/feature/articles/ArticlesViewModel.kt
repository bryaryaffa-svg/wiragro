package com.sidomakmur.kios.feature.articles

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.repository.ArticleFeed
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ArticlesUiState(
    val feed: ArticleFeed? = null,
    val isLoading: Boolean = false,
    val message: String? = null,
)

class ArticlesViewModel(
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(ArticlesUiState(isLoading = true))
    val uiState: StateFlow<ArticlesUiState> = _uiState.asStateFlow()

    private var activeSearch = ""

    init {
        refresh()
    }

    fun refresh(
        search: String = activeSearch,
    ) {
        activeSearch = search
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, message = null)
            _uiState.value = runCatching {
                repository.getArticles(search = search)
            }.fold(
                onSuccess = { feed ->
                    ArticlesUiState(
                        feed = feed,
                        isLoading = false,
                    )
                },
                onFailure = { error ->
                    _uiState.value.copy(
                        isLoading = false,
                        message = error.message ?: "Artikel belum dapat dimuat.",
                    )
                },
            )
        }
    }

    fun dismissMessage() {
        _uiState.value = _uiState.value.copy(message = null)
    }

    companion object {
        fun Factory(
            repository: StorefrontRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(ArticlesViewModel::class.java)) {
                    return ArticlesViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
