package com.sidomakmur.kios

import android.app.Application
import com.sidomakmur.kios.data.AppContainer
import com.sidomakmur.kios.data.DefaultAppContainer
import com.sidomakmur.kios.sync.StorefrontSyncWorker

class KiosSidomakmurApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = DefaultAppContainer(applicationContext)
        StorefrontSyncWorker.schedule(applicationContext)
    }
}
