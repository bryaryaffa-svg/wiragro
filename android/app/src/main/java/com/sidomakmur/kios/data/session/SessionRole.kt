package com.sidomakmur.kios.data.session

import com.sidomakmur.kios.data.remote.CustomerSession

enum class SessionRole {
    GUEST,
    CUSTOMER,
    RESELLER,
}

fun CustomerSession?.asSessionRole(): SessionRole {
    return when (this?.role?.trim()?.lowercase()) {
        "reseller" -> SessionRole.RESELLER
        "customer" -> SessionRole.CUSTOMER
        else -> SessionRole.GUEST
    }
}

fun SessionRole.label(): String {
    return when (this) {
        SessionRole.GUEST -> "Guest"
        SessionRole.CUSTOMER -> "Member"
        SessionRole.RESELLER -> "Reseller"
    }
}
