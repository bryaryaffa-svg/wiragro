package com.sidomakmur.kios.data.repository

import com.sidomakmur.kios.BuildConfig
import com.sidomakmur.kios.data.local.OfflineCacheStore
import com.sidomakmur.kios.data.local.StoreSelectionStore
import com.sidomakmur.kios.data.remote.ApiErrorParser
import com.sidomakmur.kios.data.remote.ArticleDetailResponse
import com.sidomakmur.kios.data.remote.ArticleSummary
import com.sidomakmur.kios.data.remote.BannerItem
import com.sidomakmur.kios.data.remote.CategoryItem
import com.sidomakmur.kios.data.remote.StaticPageDetailResponse
import com.sidomakmur.kios.data.remote.StaticPageSummary
import com.sidomakmur.kios.data.remote.CategoryHighlight
import com.sidomakmur.kios.data.remote.PaginationPayload
import com.sidomakmur.kios.data.remote.ProductDetailResponse
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.remote.StoreBranch
import com.sidomakmur.kios.data.remote.StorefrontApi

data class HomeFeed(
    val storeName: String,
    val storeCode: String,
    val apiBaseUrl: String,
    val availableStores: List<StoreBranch>,
    val banners: List<BannerItem>,
    val categories: List<CategoryHighlight>,
    val featuredProducts: List<ProductSummary>,
    val newArrivals: List<ProductSummary>,
    val bestSellers: List<ProductSummary>,
    val catalogPreview: List<ProductSummary>,
)

data class CatalogQuery(
    val search: String = "",
    val categorySlug: String? = null,
    val sort: String = "latest",
    val page: Int = 1,
    val pageSize: Int = 24,
    val memberLevel: String? = null,
)

data class CatalogFeed(
    val items: List<ProductSummary>,
    val categories: List<CategoryItem>,
    val pagination: PaginationPayload,
    val query: CatalogQuery,
)

data class ArticleFeed(
    val items: List<ArticleSummary>,
    val pagination: PaginationPayload,
    val search: String = "",
)

data class StaticPageFeed(
    val items: List<StaticPageSummary>,
)

class StorefrontRepository(
    private val api: StorefrontApi,
    private val storeSelectionStore: StoreSelectionStore,
    private val cacheStore: OfflineCacheStore,
    private val errorParser: ApiErrorParser,
) {
    suspend fun getHomeFeed(): HomeFeed {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "home"
        return runCatching {
            val stores = api.getStores()
            val home = api.getHome(storeCode = storeCode)
            val catalog = api.getProducts(storeCode = storeCode)
            HomeFeed(
                storeName = home.store.name.ifBlank { "Kios Sidomakmur" },
                storeCode = home.store.code.ifBlank { storeCode },
                apiBaseUrl = BuildConfig.KIOS_API_BASE_URL,
                availableStores = stores.items,
                banners = home.banners,
                categories = home.categoryHighlights,
                featuredProducts = home.featuredProducts,
                newArrivals = home.newArrivals,
                bestSellers = home.bestSellers,
                catalogPreview = catalog.items,
            )
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = HomeFeed::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = HomeFeed::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Katalog Android belum berhasil dimuat dari backend."),
            )
        }
    }

    suspend fun getProductDetail(
        slug: String,
        memberLevel: String? = null,
    ): ProductDetailResponse {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "product-detail:$slug:${memberLevel.orEmpty()}"
        return runCatching {
            api.getProductDetail(
                slug = slug,
                storeCode = storeCode,
                memberLevel = memberLevel,
            )
        }.mapCatching { response ->
            if (response.id.isBlank()) {
                throw IllegalStateException(response.detail ?: "Produk tidak ditemukan.")
            }
            response
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = ProductDetailResponse::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = ProductDetailResponse::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Detail produk belum dapat dimuat."),
            )
        }
    }

    suspend fun getCatalog(
        query: CatalogQuery = CatalogQuery(),
    ): CatalogFeed {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "catalog:${query.search}:${query.categorySlug.orEmpty()}:${query.sort}:${query.memberLevel.orEmpty()}"
        return runCatching {
            val categories = api.getCategories(storeCode = storeCode)
            val products = api.getProducts(
                storeCode = storeCode,
                query = query.search.trim().ifBlank { null },
                categorySlug = query.categorySlug,
                sort = query.sort,
                page = query.page,
                pageSize = query.pageSize,
                memberLevel = query.memberLevel,
            )
            CatalogFeed(
                items = products.items,
                categories = categories.items,
                pagination = products.pagination,
                query = query,
            )
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = CatalogFeed::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = CatalogFeed::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Katalog produk belum dapat dimuat."),
            )
        }
    }

    suspend fun getArticles(
        search: String = "",
        page: Int = 1,
        pageSize: Int = 12,
    ): ArticleFeed {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "articles:${search.trim()}:$page:$pageSize"
        return runCatching {
            val response = api.getArticles(
                storeCode = storeCode,
                page = page,
                pageSize = pageSize,
                query = search.trim().ifBlank { null },
            )
            ArticleFeed(
                items = response.items,
                pagination = response.pagination,
                search = search,
            )
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = ArticleFeed::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = ArticleFeed::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Artikel belum dapat dimuat."),
            )
        }
    }

    suspend fun getArticleDetail(
        slug: String,
    ): ArticleDetailResponse {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "article-detail:$slug"
        return runCatching {
            api.getArticleDetail(
                slug = slug,
                storeCode = storeCode,
            )
        }.mapCatching { response ->
            if (response.slug.isBlank()) {
                throw IllegalStateException(response.detail ?: "Artikel tidak ditemukan.")
            }
            response
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = ArticleDetailResponse::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = ArticleDetailResponse::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Detail artikel belum dapat dimuat."),
            )
        }
    }

    suspend fun getStaticPages(): StaticPageFeed {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "static-pages"
        return runCatching {
            val response = api.getPages(storeCode = storeCode)
            StaticPageFeed(items = response.items)
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = StaticPageFeed::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = StaticPageFeed::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Halaman statis belum dapat dimuat."),
            )
        }
    }

    suspend fun getStaticPageDetail(
        slug: String,
    ): StaticPageDetailResponse {
        val storeCode = storeSelectionStore.currentStoreCode()
        val cacheKey = "static-page-detail:$slug"
        return runCatching {
            api.getPageDetail(
                slug = slug,
                storeCode = storeCode,
            )
        }.mapCatching { response ->
            if (response.slug.isBlank()) {
                throw IllegalStateException(response.detail ?: "Halaman tidak ditemukan.")
            }
            response
        }.onSuccess { cache ->
            cacheStore.write(
                storeCode = storeCode,
                cacheKey = cacheKey,
                value = cache,
                type = StaticPageDetailResponse::class.java,
            )
        }.getOrElse { error ->
            cacheStore.read(
                storeCode = storeCode,
                cacheKey = cacheKey,
                type = StaticPageDetailResponse::class.java,
            ) ?: throw IllegalStateException(
                errorParser.message(error, "Halaman statis belum dapat dimuat."),
            )
        }
    }

    suspend fun getStores(): List<StoreBranch> {
        return runCatching {
            api.getStores().items
        }.getOrElse {
            listOf(
                StoreBranch(
                    code = currentStoreCode(),
                    name = currentStoreCode(),
                    province = "",
                ),
            )
        }
    }

    fun currentStoreCode(): String = storeSelectionStore.currentStoreCode()

    fun switchStore(storeCode: String) {
        storeSelectionStore.updateStoreCode(storeCode)
    }
}
