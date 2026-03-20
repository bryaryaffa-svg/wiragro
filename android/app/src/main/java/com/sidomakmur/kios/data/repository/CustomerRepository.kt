package com.sidomakmur.kios.data.repository

import com.sidomakmur.kios.data.local.CustomerSessionStore
import com.sidomakmur.kios.data.local.StoreSelectionStore
import com.sidomakmur.kios.data.remote.AddressUpsertRequest
import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.CustomerAccountResponse
import com.sidomakmur.kios.data.remote.CustomerSession
import com.sidomakmur.kios.data.remote.GoogleLoginRequest
import com.sidomakmur.kios.data.remote.ProfileUpdateRequest
import com.sidomakmur.kios.data.remote.ResellerActivationRequest
import com.sidomakmur.kios.data.remote.ResellerActivationResponse
import com.sidomakmur.kios.data.remote.ResellerLoginRequest
import com.sidomakmur.kios.data.remote.ResellerPasswordResponse
import com.sidomakmur.kios.data.remote.ResellerSetPasswordRequest
import com.sidomakmur.kios.data.remote.SavedAddress
import com.sidomakmur.kios.data.remote.StorefrontApi
import com.sidomakmur.kios.data.remote.WhatsAppOtpChallengeResponse
import com.sidomakmur.kios.data.remote.WhatsAppOtpRequest
import com.sidomakmur.kios.data.remote.WhatsAppOtpVerifyRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CustomerRepository(
    private val api: StorefrontApi,
    private val storeSelectionStore: StoreSelectionStore,
    private val sessionStore: CustomerSessionStore,
    private val errorParser: ApiErrorParser,
) {
    private val _session = MutableStateFlow(sessionStore.read())
    val session: StateFlow<CustomerSession?> = _session.asStateFlow()

    suspend fun loginWithGoogle(
        idToken: String,
    ): CustomerSession {
        return runCatching {
            api.loginGoogle(
                GoogleLoginRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    idToken = idToken,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Login Google gagal."))
        }.also(::persistSession)
    }

    suspend fun checkResellerActivation(
        username: String,
    ): ResellerActivationResponse {
        return runCatching {
            api.checkResellerActivation(
                ResellerActivationRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    username = username.trim(),
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Username reseller belum valid atau belum dibuat admin."))
        }
    }

    suspend fun setResellerPassword(
        username: String,
        password: String,
    ): ResellerPasswordResponse {
        return runCatching {
            api.setResellerPassword(
                ResellerSetPasswordRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    username = username.trim(),
                    password = password,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Password reseller belum bisa disimpan."))
        }
    }

    suspend fun loginReseller(
        username: String,
        password: String,
    ): CustomerSession {
        return runCatching {
            api.loginReseller(
                ResellerLoginRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    username = username.trim(),
                    password = password,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Login reseller gagal."))
        }.also(::persistSession)
    }

    suspend fun requestWhatsAppOtp(
        phone: String,
    ): WhatsAppOtpChallengeResponse {
        return runCatching {
            api.requestWhatsAppOtp(
                WhatsAppOtpRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    phone = phone,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Permintaan OTP WhatsApp gagal."))
        }
    }

    suspend fun verifyWhatsAppOtp(
        challengeId: String,
        otpCode: String,
    ): CustomerSession {
        return runCatching {
            api.verifyWhatsAppOtp(
                WhatsAppOtpVerifyRequest(
                    storeCode = storeSelectionStore.currentStoreCode(),
                    challengeId = challengeId,
                    otpCode = otpCode,
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Verifikasi OTP gagal."))
        }.also(::persistSession)
    }

    fun logout() {
        sessionStore.clear()
        _session.value = null
    }

    suspend fun getMyAccount(
        accessToken: String,
    ): CustomerAccountResponse {
        return runCatching {
            api.getMyAccount(authorization = bearer(accessToken))
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Profil akun belum dapat dimuat."))
        }
    }

    suspend fun updateMyAccount(
        accessToken: String,
        fullName: String,
        phone: String?,
        email: String?,
    ): CustomerAccountResponse {
        return runCatching {
            api.updateMyAccount(
                authorization = bearer(accessToken),
                payload = ProfileUpdateRequest(
                    fullName = fullName.trim(),
                    phone = phone?.trim()?.ifBlank { null },
                    email = email?.trim()?.ifBlank { null },
                ),
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Profil akun belum bisa diperbarui."))
        }.also(::mergeAccountIntoSession)
    }

    suspend fun getMyAddresses(
        accessToken: String,
    ): List<SavedAddress> {
        return runCatching {
            api.getMyAddresses(authorization = bearer(accessToken)).items
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Daftar alamat belum dapat dimuat."))
        }
    }

    suspend fun saveMyAddress(
        accessToken: String,
        addressId: String?,
        label: String,
        recipientName: String,
        recipientPhone: String,
        addressLine: String,
        district: String?,
        city: String,
        province: String,
        postalCode: String?,
        notes: String?,
        isDefault: Boolean,
    ): SavedAddress {
        return runCatching {
            val payload = AddressUpsertRequest(
                label = label.trim(),
                recipientName = recipientName.trim(),
                recipientPhone = recipientPhone.trim(),
                addressLine = addressLine.trim(),
                district = district?.trim()?.ifBlank { null },
                city = city.trim(),
                province = province.trim(),
                postalCode = postalCode?.trim()?.ifBlank { null },
                notes = notes?.trim()?.ifBlank { null },
                isDefault = isDefault,
            )
            if (addressId.isNullOrBlank()) {
                api.createMyAddress(
                    authorization = bearer(accessToken),
                    payload = payload,
                ).address
            } else {
                api.updateMyAddress(
                    authorization = bearer(accessToken),
                    addressId = addressId,
                    payload = payload,
                ).address
            }
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Alamat belum bisa disimpan."))
        }
    }

    suspend fun deleteMyAddress(
        accessToken: String,
        addressId: String,
    ) {
        runCatching {
            api.deleteMyAddress(
                authorization = bearer(accessToken),
                addressId = addressId,
            )
        }.getOrElse { error ->
            throw IllegalStateException(errorParser.message(error, "Alamat belum bisa dihapus."))
        }
    }

    private fun persistSession(
        session: CustomerSession,
    ) {
        sessionStore.save(session)
        _session.value = session
    }

    private fun mergeAccountIntoSession(
        account: CustomerAccountResponse,
    ) {
        val current = _session.value ?: return
        persistSession(
            current.copy(
                customer = account.customer,
                role = account.role,
                pricingMode = account.pricingMode,
            ),
        )
    }

    private fun bearer(accessToken: String): String = "Bearer $accessToken"
}
