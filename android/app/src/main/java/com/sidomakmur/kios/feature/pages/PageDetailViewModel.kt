package com.sidomakmur.kios.feature.pages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.StaticPageDetailResponse
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface PageDetailUiState {
    data object Loading : PageDetailUiState
    data class Success(val page: StaticPageDetailResponse) : PageDetailUiState
    data class Error(val message: String) : PageDetailUiState
}

class PageDetailViewModel(
    private val slug: String,
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<PageDetailUiState>(PageDetailUiState.Loading)
    val uiState: StateFlow<PageDetailUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = PageDetailUiState.Loading
            _uiState.value = runCatching {
                repository.getStaticPageDetail(slug)
            }.fold(
                onSuccess = { PageDetailUiState.Success(it) },
                onFailure = { error ->
                    PageDetailUiState.Error(
                        error.message ?: "Halaman statis belum dapat dimuat.",
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
                if (modelClass.isAssignableFrom(PageDetailViewModel::class.java)) {
                    return PageDetailViewModel(
                        slug = slug,
                        repository = repository,
                    ) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
