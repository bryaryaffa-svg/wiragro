package com.sidomakmur.kios.data.local

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class StoreSelectionStore(
    context: Context,
    defaultStoreCode: String,
) {
    private val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
    private val _selectedStoreCode = MutableStateFlow(
        preferences.getString(KEY_SELECTED_STORE_CODE, defaultStoreCode) ?: defaultStoreCode,
    )
    val selectedStoreCode: StateFlow<String> = _selectedStoreCode.asStateFlow()

    fun currentStoreCode(): String = _selectedStoreCode.value

    fun updateStoreCode(storeCode: String) {
        preferences.edit().putString(KEY_SELECTED_STORE_CODE, storeCode).apply()
        _selectedStoreCode.value = storeCode
    }

    private companion object {
        const val PREFERENCES_NAME = "kios_sidomakmur_store_selection"
        const val KEY_SELECTED_STORE_CODE = "selected_store_code"
    }
}
