package com.sidomakmur.kios.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.sidomakmur.kios.KiosSidomakmurApplication
import com.sidomakmur.kios.data.repository.CatalogQuery
import java.util.concurrent.TimeUnit

class StorefrontSyncWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val app = applicationContext as KiosSidomakmurApplication
        val container = app.container
        val session = container.customerRepository.session.value
        val memberLevel = session?.customer?.memberTier

        return runCatching {
            if (session != null) {
                container.cartRepository.retryPendingCheckouts(
                    accessToken = session.accessToken,
                    customerId = session.customer.id,
                )
            }
            container.storefrontRepository.getHomeFeed()
            container.storefrontRepository.getCatalog(
                CatalogQuery(
                    memberLevel = memberLevel,
                ),
            )
            container.storefrontRepository.getArticles()
            container.storefrontRepository.getStaticPages()
            if (session != null) {
                container.orderRepository.getOrders(session.accessToken)
            }
            Result.success()
        }.getOrElse {
            Result.retry()
        }
    }

    companion object {
        private const val UNIQUE_PERIODIC_WORK = "kios_sidomakmur_periodic_sync"
        private const val UNIQUE_INITIAL_WORK = "kios_sidomakmur_initial_sync"
        private const val UNIQUE_IMMEDIATE_RETRY_WORK = "kios_sidomakmur_immediate_retry_sync"

        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            val workManager = WorkManager.getInstance(context)
            workManager.enqueueUniquePeriodicWork(
                UNIQUE_PERIODIC_WORK,
                ExistingPeriodicWorkPolicy.UPDATE,
                PeriodicWorkRequestBuilder<StorefrontSyncWorker>(15, TimeUnit.MINUTES)
                    .setConstraints(constraints)
                    .build(),
            )
            workManager.enqueueUniqueWork(
                UNIQUE_INITIAL_WORK,
                ExistingWorkPolicy.REPLACE,
                OneTimeWorkRequestBuilder<StorefrontSyncWorker>()
                    .setConstraints(constraints)
                    .build(),
            )
        }

        fun enqueueImmediateRetry(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_IMMEDIATE_RETRY_WORK,
                ExistingWorkPolicy.REPLACE,
                OneTimeWorkRequestBuilder<StorefrontSyncWorker>()
                    .setConstraints(constraints)
                    .build(),
            )
        }
    }
}
