package com.sidomakmur.kios

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setBackgroundDrawableResource(R.color.kios_window_background)
        window.navigationBarColor = ContextCompat.getColor(this, R.color.kios_window_background)

        val application = application as KiosSidomakmurApplication
        setContent {
            KiosSidomakmurApp(container = application.container)
        }
    }
}
