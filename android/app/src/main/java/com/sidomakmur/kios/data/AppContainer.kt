package com.sidomakmur.kios.data

import android.content.Context
import com.sidomakmur.kios.BuildConfig
import com.sidomakmur.kios.data.local.CustomerSessionStore
import com.sidomakmur.kios.data.local.KiosDatabase
import com.sidomakmur.kios.data.local.OfflineCacheStore
import com.sidomakmur.kios.data.local.StoreSelectionStore
import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.StorefrontApi
import com.sidomakmur.kios.data.repository.CartRepository
import com.sidomakmur.kios.data.repository.CustomerRepository
import com.sidomakmur.kios.data.repository.OfflineCheckoutRepository
import com.sidomakmur.kios.data.repository.OrderRepository
import com.sidomakmur.kios.data.repository.StorefrontRepository
import com.sidomakmur.kios.data.repository.WishlistRepository
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

interface AppContainer {
    val storefrontRepository: StorefrontRepository
    val customerRepository: CustomerRepository
    val cartRepository: CartRepository
    val offlineCheckoutRepository: OfflineCheckoutRepository
    val orderRepository: OrderRepository
    val wishlistRepository: WishlistRepository
    val storeSelectionStore: StoreSelectionStore
}

class DefaultAppContainer(
    context: Context,
) : AppContainer {
    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(
            HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.BASIC
                }
            },
        )
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.KIOS_API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    private val errorParser = ApiErrorParser(moshi = moshi)
    private val database = KiosDatabase.create(context)
    private val offlineCacheStore = OfflineCacheStore(
        dao = database.cachedPayloadDao(),
        moshi = moshi,
    )
    private val sessionStore = CustomerSessionStore(context = context, moshi = moshi)
    override val storeSelectionStore: StoreSelectionStore = StoreSelectionStore(
        context = context,
        defaultStoreCode = BuildConfig.KIOS_STORE_CODE,
    )
    private val storefrontApi: StorefrontApi = retrofit.create(StorefrontApi::class.java)
    override val offlineCheckoutRepository: OfflineCheckoutRepository = OfflineCheckoutRepository(
        dao = database.pendingCheckoutDao(),
        moshi = moshi,
        storeSelectionStore = storeSelectionStore,
    )

    override val storefrontRepository: StorefrontRepository = StorefrontRepository(
        api = storefrontApi,
        storeSelectionStore = storeSelectionStore,
        cacheStore = offlineCacheStore,
        errorParser = errorParser,
    )

    override val customerRepository: CustomerRepository = CustomerRepository(
        api = storefrontApi,
        storeSelectionStore = storeSelectionStore,
        sessionStore = sessionStore,
        errorParser = errorParser,
    )

    override val cartRepository: CartRepository = CartRepository(
        api = storefrontApi,
        storeSelectionStore = storeSelectionStore,
        offlineCheckoutRepository = offlineCheckoutRepository,
        context = context,
        errorParser = errorParser,
    )

    override val orderRepository: OrderRepository = OrderRepository(
        api = storefrontApi,
        cacheStore = offlineCacheStore,
        errorParser = errorParser,
    )

    override val wishlistRepository: WishlistRepository = WishlistRepository(
        api = storefrontApi,
        errorParser = errorParser,
    )
}
