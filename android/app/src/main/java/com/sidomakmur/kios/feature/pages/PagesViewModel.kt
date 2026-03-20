package com.sidomakmur.kios.feature.pages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.sidomakmur.kios.data.remote.StaticPageSummary
import com.sidomakmur.kios.data.repository.StorefrontRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PagesUiState(
    val items: List<StaticPageSummary> = emptyList(),
    val isLoading: Boolean = false,
    val message: String? = null,
)

class PagesViewModel(
    private val repository: StorefrontRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(PagesUiState(isLoading = true))
    val uiState: StateFlow<PagesUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, message = null)
            _uiState.value = runCatching {
                repository.getStaticPages()
            }.fold(
                onSuccess = { feed ->
                    PagesUiState(
                        items = feed.items,
                        isLoading = false,
                    )
                },
                onFailure = { error ->
                    _uiState.value.copy(
                        isLoading = false,
                        message = error.message ?: "Halaman statis belum dapat dimuat.",
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
                if (modelClass.isAssignableFrom(PagesViewModel::class.java)) {
                    return PagesViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}
