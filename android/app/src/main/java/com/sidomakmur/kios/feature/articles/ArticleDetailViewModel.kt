package com.sidomakmur.kios.feature.articles

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.ArticleDetailResponse
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ArticleDetailUiState {
    data object Loading : ArticleDetailUiState
    data class Success(val article: ArticleDetailResponse) : ArticleDetailUiState
    data class Error(val message: String) : ArticleDetailUiState
}

class ArticleDetailViewModel(
    private val slug: String,
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<ArticleDetailUiState>(ArticleDetailUiState.Loading)
    val uiState: StateFlow<ArticleDetailUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = ArticleDetailUiState.Loading
            _uiState.value = runCatching {
                repository.getArticleDetail(slug = slug)
            }.fold(
                onSuccess = { ArticleDetailUiState.Success(it) },
                onFailure = { error ->
                    ArticleDetailUiState.Error(
                        error.message ?: "Detail artikel belum dapat dimuat.",
                    )
                },
            )
        }
    }

    companion object {
        fun Factory(
            slug: String,
            repository: StorefrontRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(ArticleDetailViewModel::class.java)) {
                    return ArticleDetailViewModel(
                        slug = slug,
                        repository = repository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
