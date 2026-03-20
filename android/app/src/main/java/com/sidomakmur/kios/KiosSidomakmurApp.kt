package com.sidomakmur.kios

import android.net.Uri
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.LargeTopAppBar
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.sidomakmur.kios.core.designsystem.KiosTheme
import com.sidomakmur.kios.data.AppContainer
import com.sidomakmur.kios.feature.account.AccountRoute
import com.sidomakmur.kios.feature.account.AddressBookRoute
import com.sidomakmur.kios.feature.account.ProfileRoute
import com.sidomakmur.kios.feature.account.SessionViewModel
import com.sidomakmur.kios.feature.articles.ArticleDetailRoute
import com.sidomakmur.kios.feature.articles.ArticleDetailViewModel
import com.sidomakmur.kios.feature.articles.ArticlesRoute
import com.sidomakmur.kios.feature.articles.ArticlesViewModel
import com.sidomakmur.kios.feature.cart.CartRoute
import com.sidomakmur.kios.feature.cart.CartViewModel
import com.sidomakmur.kios.feature.catalog.CatalogRoute
import com.sidomakmur.kios.feature.catalog.CatalogViewModel
import com.sidomakmur.kios.feature.checkout.CheckoutRoute
import com.sidomakmur.kios.feature.home.HomeRoute
import com.sidomakmur.kios.feature.home.HomeViewModel
import com.sidomakmur.kios.feature.orders.OrderDetailRoute
import com.sidomakmur.kios.feature.orders.OrderHistoryRoute
import com.sidomakmur.kios.feature.orders.OrderViewModel
import com.sidomakmur.kios.feature.pages.PageDetailRoute
import com.sidomakmur.kios.feature.pages.PageDetailViewModel
import com.sidomakmur.kios.feature.pages.PagesRoute
import com.sidomakmur.kios.feature.pages.PagesViewModel
import com.sidomakmur.kios.feature.product.ProductDetailRoute
import com.sidomakmur.kios.feature.product.ProductDetailViewModel
import com.sidomakmur.kios.feature.wishlist.WishlistRoute

private data class BottomDestination(
    val route: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
)

private object AppRoute {
    const val Home = "home"
    const val Catalog = "catalog"
    const val Articles = "articles"
    const val ArticleDetail = "articles/{slug}"
    const val Pages = "pages"
    const val PageDetail = "pages/{slug}"
    const val Cart = "cart"
    const val Wishlist = "wishlist"
    const val Account = "account"
    const val Profile = "account/profile"
    const val Addresses = "account/addresses"
    const val Checkout = "checkout"
    const val OrderHistory = "orders"
    const val OrderDetail = "orders/{orderId}"
    const val ProductDetail = "product/{slug}"

    fun articleDetail(slug: String): String = "articles/${Uri.encode(slug)}"
    fun pageDetail(slug: String): String = "pages/${Uri.encode(slug)}"
    fun productDetail(slug: String): String = "product/${Uri.encode(slug)}"
    fun orderDetail(orderId: String): String = "orders/${Uri.encode(orderId)}"
}

private val bottomDestinations = listOf(
    BottomDestination(
        route = AppRoute.Home,
        label = "Beranda",
        icon = Icons.Outlined.Home,
    ),
    BottomDestination(
        route = AppRoute.Cart,
        label = "Cart",
        icon = Icons.Outlined.ShoppingCart,
    ),
    BottomDestination(
        route = AppRoute.Wishlist,
        label = "Wishlist",
        icon = Icons.Outlined.FavoriteBorder,
    ),
    BottomDestination(
        route = AppRoute.Account,
        label = "Akun",
        icon = Icons.Outlined.Person,
    ),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KiosSidomakmurApp(
    container: AppContainer,
) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination
    val currentRoute = currentDestination?.route
    val sessionViewModel: SessionViewModel = viewModel(
        factory = SessionViewModel.Factory(
            customerRepository = container.customerRepository,
            wishlistRepository = container.wishlistRepository,
        ),
    )
    val homeViewModel: HomeViewModel = viewModel(
        factory = HomeViewModel.Factory(container.storefrontRepository),
    )
    val catalogViewModel: CatalogViewModel = viewModel(
        factory = CatalogViewModel.Factory(container.storefrontRepository),
    )
    val articlesViewModel: ArticlesViewModel = viewModel(
        factory = ArticlesViewModel.Factory(container.storefrontRepository),
    )
    val pagesViewModel: PagesViewModel = viewModel(
        factory = PagesViewModel.Factory(container.storefrontRepository),
    )
    val cartViewModel: CartViewModel = viewModel(
        factory = CartViewModel.Factory(
            customerRepository = container.customerRepository,
            cartRepository = container.cartRepository,
        ),
    )
    val orderViewModel: OrderViewModel = viewModel(
        factory = OrderViewModel.Factory(
            customerRepository = container.customerRepository,
            orderRepository = container.orderRepository,
        ),
    )
    val sessionState = sessionViewModel.sessionUiState.collectAsStateWithLifecycle().value
    val accountDataState = sessionViewModel.accountDataUiState.collectAsStateWithLifecycle().value
    val wishlistState = sessionViewModel.wishlistUiState.collectAsStateWithLifecycle().value
    val cartState = cartViewModel.uiState.collectAsStateWithLifecycle().value

    KiosTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = androidx.compose.material3.MaterialTheme.colorScheme.background,
        ) {
            Scaffold(
                modifier = Modifier.fillMaxSize(),
                containerColor = androidx.compose.material3.MaterialTheme.colorScheme.background,
                topBar = {
                    LargeTopAppBar(
                        title = {
                            Text(
                                text = when {
                                    currentRoute == AppRoute.Cart -> "Keranjang"
                                    currentRoute == AppRoute.Wishlist -> "Wishlist"
                                    currentRoute == AppRoute.Account -> "Akun"
                                    currentRoute == AppRoute.Profile -> "Edit Profil"
                                    currentRoute == AppRoute.Addresses -> "Buku Alamat"
                                    currentRoute == AppRoute.Catalog -> "Katalog"
                                    currentRoute == AppRoute.Articles -> "Artikel"
                                    currentRoute == AppRoute.ArticleDetail -> "Detail Artikel"
                                    currentRoute == AppRoute.Pages -> "Halaman Info"
                                    currentRoute == AppRoute.PageDetail -> "Detail Halaman"
                                    currentRoute == AppRoute.Checkout -> "Checkout"
                                    currentRoute == AppRoute.OrderHistory -> "Pesanan"
                                    currentRoute == AppRoute.OrderDetail -> "Detail Pesanan"
                                    currentRoute == AppRoute.ProductDetail -> "Detail Produk"
                                    else -> "Kios Sidomakmur"
                                },
                                fontWeight = FontWeight.Bold,
                            )
                        },
                        colors = TopAppBarDefaults.largeTopAppBarColors(),
                    )
                },
                bottomBar = {
                    if (
                        currentRoute != AppRoute.ProductDetail &&
                        currentRoute != AppRoute.Checkout &&
                        currentRoute != AppRoute.OrderDetail &&
                        currentRoute != AppRoute.ArticleDetail &&
                        currentRoute != AppRoute.PageDetail &&
                        currentRoute != AppRoute.Profile &&
                        currentRoute != AppRoute.Addresses
                    ) {
                        NavigationBar {
                            bottomDestinations.forEach { item ->
                                NavigationBarItem(
                                    selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                                    onClick = {
                                        navController.navigate(item.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = {
                                        Icon(
                                            imageVector = item.icon,
                                            contentDescription = item.label,
                                        )
                                    },
                                    label = { Text(item.label) },
                                )
                            }
                        }
                    }
                },
            ) { innerPadding ->
                NavHost(
                    navController = navController,
                    startDestination = AppRoute.Home,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                ) {
                    composable(AppRoute.Home) {
                        HomeRoute(
                            viewModel = homeViewModel,
                            sessionRole = sessionState.role,
                            wishlistProductIds = wishlistState.items.mapTo(linkedSetOf()) { it.productId },
                            pendingWishlistProductIds = wishlistState.pendingProductIds,
                            pendingCartProductIds = cartState.pendingProductIds,
                            onToggleWishlist = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    sessionViewModel.toggleWishlist(product)
                                }
                            },
                            onAddToCart = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    cartViewModel.addProduct(product.id)
                                }
                            },
                            onOpenProduct = { slug ->
                                navController.navigate(AppRoute.productDetail(slug))
                            },
                            onOpenCatalog = {
                                catalogViewModel.applyFilters(
                                    search = "",
                                    categorySlug = null,
                                    sort = "latest",
                                    memberLevel = sessionState.session?.customer?.memberTier,
                                )
                                navController.navigate(AppRoute.Catalog)
                            },
                            onOpenCatalogCategory = { categorySlug ->
                                catalogViewModel.applyFilters(
                                    search = "",
                                    categorySlug = categorySlug,
                                    sort = "latest",
                                    memberLevel = sessionState.session?.customer?.memberTier,
                                )
                                navController.navigate(AppRoute.Catalog)
                            },
                            onOpenArticles = {
                                navController.navigate(AppRoute.Articles)
                            },
                            onOpenPages = {
                                navController.navigate(AppRoute.Pages)
                            },
                            onSwitchStore = { storeCode ->
                                if (container.storeSelectionStore.currentStoreCode() != storeCode) {
                                    container.storeSelectionStore.updateStoreCode(storeCode)
                                    sessionViewModel.logout()
                                    homeViewModel.refresh()
                                    catalogViewModel.refresh(memberLevel = null)
                                    articlesViewModel.refresh()
                                    pagesViewModel.refresh()
                                    navController.navigate(AppRoute.Home) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = false
                                        }
                                        launchSingleTop = true
                                    }
                                }
                            },
                        )
                    }

                    composable(AppRoute.Catalog) {
                        CatalogRoute(
                            viewModel = catalogViewModel,
                            sessionRole = sessionState.role,
                            memberLevel = sessionState.session?.customer?.memberTier,
                            wishlistProductIds = wishlistState.items.mapTo(linkedSetOf()) { it.productId },
                            pendingWishlistProductIds = wishlistState.pendingProductIds,
                            pendingCartProductIds = cartState.pendingProductIds,
                            onToggleWishlist = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    sessionViewModel.toggleWishlist(product)
                                }
                            },
                            onAddToCart = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    cartViewModel.addProduct(product.id)
                                }
                            },
                            onOpenProduct = { slug ->
                                navController.navigate(AppRoute.productDetail(slug))
                            },
                        )
                    }

                    composable(AppRoute.Articles) {
                        ArticlesRoute(
                            viewModel = articlesViewModel,
                            onOpenArticle = { slug ->
                                navController.navigate(AppRoute.articleDetail(slug))
                            },
                        )
                    }

                    composable(AppRoute.Pages) {
                        PagesRoute(
                            viewModel = pagesViewModel,
                            onOpenPage = { slug ->
                                navController.navigate(AppRoute.pageDetail(slug))
                            },
                        )
                    }

                    composable(AppRoute.ArticleDetail) { articleEntry ->
                        val slug = articleEntry.arguments?.getString("slug").orEmpty()
                        val detailViewModel: ArticleDetailViewModel = viewModel(
                            key = "article-$slug",
                            factory = ArticleDetailViewModel.Factory(
                                slug = slug,
                                repository = container.storefrontRepository,
                            ),
                        )
                        ArticleDetailRoute(
                            viewModel = detailViewModel,
                        )
                    }

                    composable(AppRoute.PageDetail) { pageEntry ->
                        val slug = pageEntry.arguments?.getString("slug").orEmpty()
                        val detailViewModel: PageDetailViewModel = viewModel(
                            key = "page-$slug",
                            factory = PageDetailViewModel.Factory(
                                slug = slug,
                                repository = container.storefrontRepository,
                            ),
                        )
                        PageDetailRoute(
                            viewModel = detailViewModel,
                        )
                    }

                    composable(AppRoute.Cart) {
                        CartRoute(
                            viewModel = cartViewModel,
                            onOpenAccount = {
                                navController.navigate(AppRoute.Account) {
                                    launchSingleTop = true
                                }
                            },
                            onOpenCheckout = {
                                navController.navigate(AppRoute.Checkout)
                            },
                        )
                    }

                    composable(AppRoute.Wishlist) {
                        WishlistRoute(
                            viewModel = sessionViewModel,
                            sessionRole = sessionState.role,
                            pendingCartProductIds = cartState.pendingProductIds,
                            onAddToCart = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    cartViewModel.addProduct(product.id)
                                }
                            },
                            onOpenProduct = { slug ->
                                navController.navigate(AppRoute.productDetail(slug))
                            },
                            onOpenAccount = {
                                navController.navigate(AppRoute.Account) {
                                    launchSingleTop = true
                                }
                            },
                        )
                    }

                    composable(AppRoute.Account) {
                        AccountRoute(
                            viewModel = sessionViewModel,
                            onOpenOrders = {
                                navController.navigate(AppRoute.OrderHistory)
                            },
                            onOpenProfile = {
                                navController.navigate(AppRoute.Profile)
                            },
                            onOpenAddresses = {
                                navController.navigate(AppRoute.Addresses)
                            },
                        )
                    }

                    composable(AppRoute.Profile) {
                        ProfileRoute(
                            viewModel = sessionViewModel,
                        )
                    }

                    composable(AppRoute.Addresses) {
                        AddressBookRoute(
                            viewModel = sessionViewModel,
                        )
                    }

                    composable(AppRoute.Checkout) {
                        CheckoutRoute(
                            viewModel = cartViewModel,
                            savedAddresses = accountDataState.addresses,
                            onOpenAddresses = {
                                navController.navigate(AppRoute.Addresses)
                            },
                            onOpenOrderDetail = { orderId ->
                                cartViewModel.finishCheckoutFlow()
                                orderViewModel.openOrder(orderId)
                                navController.navigate(AppRoute.orderDetail(orderId))
                            },
                            onBackToCart = {
                                cartViewModel.finishCheckoutFlow()
                                navController.navigate(AppRoute.Cart) {
                                    popUpTo(AppRoute.Cart) {
                                        inclusive = true
                                    }
                                }
                            },
                        )
                    }

                    composable(AppRoute.OrderHistory) {
                        OrderHistoryRoute(
                            viewModel = orderViewModel,
                            onOpenAccount = {
                                navController.navigate(AppRoute.Account) {
                                    launchSingleTop = true
                                }
                            },
                            onOpenOrderDetail = { orderId ->
                                orderViewModel.openOrder(orderId)
                                navController.navigate(AppRoute.orderDetail(orderId))
                            },
                        )
                    }

                    composable(AppRoute.OrderDetail) { orderEntry ->
                        val orderId = orderEntry.arguments?.getString("orderId").orEmpty()
                        OrderDetailRoute(
                            viewModel = orderViewModel,
                            orderId = orderId,
                            onBack = {
                                orderViewModel.clearSelectedOrder()
                                navController.popBackStack()
                            },
                        )
                    }

                    composable(AppRoute.ProductDetail) { productEntry ->
                        val slug = productEntry.arguments?.getString("slug").orEmpty()
                        val detailViewModel: ProductDetailViewModel = viewModel(
                            key = "product-$slug-${sessionState.session?.customer?.memberTier.orEmpty()}",
                            factory = ProductDetailViewModel.Factory(
                                slug = slug,
                                memberLevel = sessionState.session?.customer?.memberTier,
                                repository = container.storefrontRepository,
                            ),
                        )
                        ProductDetailRoute(
                            viewModel = detailViewModel,
                            sessionViewModel = sessionViewModel,
                            sessionRole = sessionState.role,
                            pendingCartProductIds = cartState.pendingProductIds,
                            onOpenProduct = { relatedSlug ->
                                navController.navigate(AppRoute.productDetail(relatedSlug))
                            },
                            onAddToCart = { product ->
                                if (sessionState.session == null) {
                                    navController.navigate(AppRoute.Account)
                                } else {
                                    cartViewModel.addProduct(product.id)
                                }
                            },
                            onRequireLogin = {
                                navController.navigate(AppRoute.Account)
                            },
                        )
                    }
                }
            }
        }
    }
}
