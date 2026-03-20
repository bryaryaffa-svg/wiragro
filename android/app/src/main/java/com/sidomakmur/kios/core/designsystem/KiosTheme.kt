package com.sidomakmur.kios.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF5DAF52),
    onPrimary = Color(0xFF0E2C15),
    primaryContainer = Color(0xFFD8F2D0),
    onPrimaryContainer = Color(0xFF13341A),
    secondary = Color(0xFF6A8F42),
    onSecondary = Color.White,
    background = Color(0xFFF7FBF2),
    onBackground = Color(0xFF18271C),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF18271C),
    surfaceVariant = Color(0xFFE8F2E2),
    onSurfaceVariant = Color(0xFF405248),
    outline = Color(0xFFB8C7B5),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF8CD67F),
    onPrimary = Color(0xFF123019),
    primaryContainer = Color(0xFF214A28),
    onPrimaryContainer = Color(0xFFD8F2D0),
    secondary = Color(0xFFABC98B),
    onSecondary = Color(0xFF223417),
    background = Color(0xFF101A13),
    onBackground = Color(0xFFE7F0E4),
    surface = Color(0xFF162219),
    onSurface = Color(0xFFE7F0E4),
    surfaceVariant = Color(0xFF223128),
    onSurfaceVariant = Color(0xFFC4D2C1),
    outline = Color(0xFF8A9B88),
)

@Composable
fun KiosTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
