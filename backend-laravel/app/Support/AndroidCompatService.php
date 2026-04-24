<?php

namespace App\Support;

use App\Models\Banner;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\WishlistItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AndroidCompatService
{
    public function __construct(
        private readonly RajaOngkirService $rajaOngkir,
        private readonly CustomerPaymentService $paymentService,
    ) {}

    public function resolveStore(?string $storeCode = null): StoreSetting
    {
        $normalizedCode = trim((string) ($storeCode ?: config('storefront.default_store_code', 'SIDO-JATIM-ONLINE')));

        $store = StoreSetting::query()
            ->where('is_active', true)
            ->when(
                $normalizedCode !== '',
                fn ($query) => $query->where('store_code', $normalizedCode)
            )
            ->first();

        if (! $store) {
            $store = StoreSetting::query()
                ->where('is_active', true)
                ->orderBy('store_name')
                ->first();
        }

        if (! $store) {
            throw new NotFoundHttpException('Store tidak ditemukan atau belum diaktifkan.');
        }

        return $store;
    }

    public function storefrontStores(): array
    {
        $items = StoreSetting::query()
            ->where('is_active', true)
            ->orderBy('store_name')
            ->get()
            ->map(function (StoreSetting $store): array {
                return [
                    'code' => $store->store_code,
                    'name' => $store->store_name,
                    'province' => $this->provinceFromStore($store),
                ];
            })
            ->values()
            ->all();

        return [
            'items' => $items,
        ];
    }

    public function storefrontHome(?string $storeCode = null): array
    {
        $store = $this->resolveStore($storeCode);
        $products = $this->productQuery()->limit(24)->get();

        $featured = $products
            ->sortByDesc(fn (Product $product) => $this->isFeaturedProduct($product) ? 1 : 0)
            ->take(8)
            ->values();

        $latest = $products
            ->sortByDesc(fn (Product $product) => optional($product->created_at)->timestamp ?? 0)
            ->take(8)
            ->values();

        $bestSellers = $products
            ->sortByDesc(fn (Product $product) => (int) $product->stock_qty)
            ->take(8)
            ->values();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->limit(8)
            ->get();

        $banners = Banner::query()
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query): void {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->orderBy('sort_order')
            ->limit(8)
            ->get();

        return [
            'store' => [
                'code' => $store->store_code,
                'name' => $store->store_name,
            ],
            'banners' => $banners->map(fn (Banner $banner): array => [
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'target_url' => $banner->link_url,
            ])->values()->all(),
            'featured_products' => $featured->map(fn (Product $product): array => $this->serializeProduct($product))->all(),
            'new_arrivals' => $latest->map(fn (Product $product): array => $this->serializeProduct($product))->all(),
            'best_sellers' => $bestSellers->map(fn (Product $product): array => $this->serializeProduct($product))->all(),
            'category_highlights' => $categories->map(fn (Category $category): array => [
                'name' => $category->name,
                'slug' => $category->slug,
            ])->values()->all(),
        ];
    }

    public function storefrontCategories(?string $storeCode = null): array
    {
        $this->resolveStore($storeCode);

        $items = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): array => [
                'id' => (string) $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent_id' => null,
            ])
            ->values()
            ->all();

        return ['items' => $items];
    }

    public function storefrontProducts(
        ?string $storeCode = null,
        ?string $query = null,
        ?string $categorySlug = null,
        string $sort = 'latest',
        int $page = 1,
        int $pageSize = 12,
        ?Customer $customer = null,
        ?string $memberLevel = null,
    ): array {
        $store = $this->resolveStore($storeCode);
        $normalizedQuery = trim((string) $query);
        $normalizedCategory = trim((string) $categorySlug);

        $rows = $this->productQuery()
            ->when(
                $normalizedQuery !== '',
                fn ($builder) => $builder->where(function ($nested) use ($normalizedQuery): void {
                    $nested->where('name', 'like', '%'.$normalizedQuery.'%')
                        ->orWhere('description', 'like', '%'.$normalizedQuery.'%')
                        ->orWhere('sku', 'like', '%'.$normalizedQuery.'%');
                })
            )
            ->when(
                $normalizedCategory !== '',
                fn ($builder) => $builder->whereHas(
                    'category',
                    fn ($nested) => $nested->where('slug', $normalizedCategory)
                )
            )
            ->get();

        $sorted = $this->sortProducts($rows, $sort, $customer, $memberLevel);
        $paged = $sorted
            ->slice(max(0, ($page - 1) * $pageSize), $pageSize)
            ->values();

        return [
            'items' => $paged
                ->map(fn (Product $product): array => $this->serializeProduct($product, $customer, $memberLevel))
                ->all(),
            'pagination' => [
                'page' => $page,
                'page_size' => $pageSize,
                'count' => $paged->count(),
            ],
            'available_filters' => [
                'category_slug' => $normalizedCategory !== '' ? $normalizedCategory : null,
                'sort' => $sort,
            ],
            'seo' => [
                'title' => 'Katalog Produk '.$store->store_name,
                'description' => 'Katalog produk aktif Kios Sidomakmur dari backend Laravel yang sama dengan website.',
            ],
        ];
    }

    public function storefrontProductDetail(
        string $slug,
        ?string $storeCode = null,
        ?Customer $customer = null,
        ?string $memberLevel = null,
    ): array {
        $this->resolveStore($storeCode);

        $product = $this->productQuery()
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            throw new NotFoundHttpException('Produk tidak ditemukan.');
        }

        $related = $this->productQuery()
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->limit(4)
            ->get();

        return array_merge(
            $this->serializeProduct($product, $customer, $memberLevel),
            [
                'promotions' => $this->productPromotions($product),
                'related_products' => $related
                    ->map(fn (Product $row): array => $this->serializeProduct($row, $customer, $memberLevel))
                    ->values()
                    ->all(),
                'stock_badge' => $this->stockBadge($product),
            ]
        );
    }

    public function storefrontArticles(
        ?string $storeCode = null,
        int $page = 1,
        int $pageSize = 10,
        ?string $query = null,
    ): array {
        $store = $this->resolveStore($storeCode);
        $items = collect($this->articleTemplates($store));
        $normalizedQuery = Str::lower(trim((string) $query));

        if ($normalizedQuery !== '') {
            $items = $items->filter(function (array $item) use ($normalizedQuery): bool {
                return Str::contains(
                    Str::lower($item['title'].' '.$item['excerpt']),
                    $normalizedQuery
                );
            })->values();
        }

        $paged = $items
            ->slice(max(0, ($page - 1) * $pageSize), $pageSize)
            ->values();

        return [
            'items' => $paged->map(fn (array $item): array => $this->serializeContentSummary($item))->all(),
            'pagination' => [
                'page' => $page,
                'page_size' => $pageSize,
                'count' => $paged->count(),
            ],
        ];
    }

    public function storefrontArticleDetail(string $slug, ?string $storeCode = null): array
    {
        $store = $this->resolveStore($storeCode);
        $article = collect($this->articleTemplates($store))
            ->firstWhere('slug', $slug);

        if (! $article) {
            throw new NotFoundHttpException('Artikel tidak ditemukan.');
        }

        return $this->serializeContentDetail($article);
    }

    public function storefrontPages(?string $storeCode = null): array
    {
        $store = $this->resolveStore($storeCode);

        return [
            'items' => collect($this->pageTemplates($store))
                ->map(fn (array $item): array => $this->serializeContentSummary($item))
                ->values()
                ->all(),
        ];
    }

    public function storefrontPageDetail(string $slug, ?string $storeCode = null): array
    {
        $store = $this->resolveStore($storeCode);
        $page = collect($this->pageTemplates($store))
            ->firstWhere('slug', $slug);

        if (! $page) {
            throw new NotFoundHttpException('Halaman tidak ditemukan.');
        }

        return $this->serializeContentDetail($page);
    }

    public function serializeProduct(
        Product $product,
        ?Customer $customer = null,
        ?string $memberLevel = null,
        array $badgeOverrides = [],
    ): array {
        $product->loadMissing(['category', 'images']);
        $pricing = $this->pricingPayload($product, $customer, $memberLevel);

        $featured = $badgeOverrides['featured'] ?? $this->isFeaturedProduct($product);
        $newArrival = $badgeOverrides['new_arrival'] ?? $this->isNewArrivalProduct($product);
        $bestSeller = $badgeOverrides['best_seller'] ?? $this->isBestSellerProduct($product);

        return [
            'id' => (string) $product->id,
            'sku' => $product->sku,
            'slug' => $product->slug,
            'name' => $product->name,
            'summary' => $this->productSummary($product),
            'description' => $product->description,
            'product_type' => $product->category?->name ?? 'Produk',
            'unit' => $product->unit ?: 'pcs',
            'weight_grams' => (string) ((int) $product->weight_grams ?: 0),
            'badges' => [
                'featured' => $featured,
                'new_arrival' => $newArrival,
                'best_seller' => $bestSeller,
            ],
            'price' => array_merge(
                $pricing['active'],
                [
                    'compare_at_amount' => $pricing['compare_at_amount'],
                    'is_promo' => $pricing['compare_at_amount'] !== null,
                ]
            ),
            'pricing' => [
                'mode' => $pricing['mode'],
                'label' => $pricing['label'],
                'active' => $pricing['active'],
                'retail' => $pricing['retail'],
                'reseller' => $pricing['reseller'],
            ],
            'availability' => $this->availabilityPayload($product),
            'category' => $product->category
                ? [
                    'id' => (string) $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ]
                : null,
            'images' => $product->images
                ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
                ->map(fn ($image): array => [
                    'id' => (string) $image->id,
                    'url' => $image->image_url,
                    'alt_text' => $image->alt_text,
                    'is_primary' => (bool) $image->is_primary,
                ])
                ->values()
                ->all(),
            'videos' => [],
            'seo' => [
                'title' => $product->name,
                'description' => $this->productSummary($product),
            ],
        ];
    }

    public function serializeWishlistItem(WishlistItem $item, ?Customer $customer = null): array
    {
        $item->loadMissing('product.category', 'product.images');

        return [
            'product_id' => (string) $item->product_id,
            'product_name' => $item->product?->name ?? 'Produk',
            'product_slug' => $item->product?->slug ?? '',
            'product' => $item->product ? $this->serializeProduct($item->product, $customer) : null,
            'created_at' => optional($item->created_at)?->toIso8601String(),
        ];
    }

    public function serializeCustomerAccount(Customer $customer): array
    {
        $customer->loadMissing('addresses');

        return [
            'customer' => $this->serializeCustomerProfile($customer),
            'role' => $this->roleFor($customer),
            'pricing_mode' => $this->pricingModeFor($customer),
            'addresses' => $customer->addresses
                ->sortByDesc('is_default')
                ->sortByDesc(fn (CustomerAddress $address) => optional($address->created_at)->timestamp ?? 0)
                ->values()
                ->map(fn (CustomerAddress $address): array => $this->serializeAddress($address))
                ->all(),
        ];
    }

    public function serializeAddress(CustomerAddress $address): array
    {
        return [
            'id' => (string) $address->id,
            'label' => $address->label,
            'recipient_name' => $address->recipient_name,
            'recipient_phone' => $address->recipient_phone,
            'address_line' => $address->address_line,
            'district' => $address->district,
            'city' => $address->city,
            'province' => $address->province,
            'postal_code' => $address->postal_code,
            'notes' => $address->notes,
            'is_default' => (bool) $address->is_default,
        ];
    }

    public function currentCustomerCart(Customer $customer): Cart
    {
        $store = $this->resolveStore();

        $cart = Cart::query()
            ->where('customer_id', $customer->id)
            ->where('store_code', $store->store_code)
            ->where('status', 'ACTIVE')
            ->latest('updated_at')
            ->first();

        if (! $cart) {
            $cart = Cart::create([
                'customer_id' => $customer->id,
                'store_code' => $store->store_code,
                'status' => 'ACTIVE',
                'currency_code' => config('storefront.default_currency', 'IDR'),
                'subtotal' => 0,
                'discount_total' => 0,
                'grand_total' => 0,
            ]);
        }

        return $this->refreshCart($cart);
    }

    public function serializeCustomerCart(Customer $customer): array
    {
        return $this->serializeCart($this->currentCustomerCart($customer), $customer);
    }

    public function addCustomerCartItem(Customer $customer, string $productId, int $qty): array
    {
        $cart = $this->currentCustomerCart($customer);
        $product = $this->productQuery()->whereKey($productId)->first();

        if (! $product) {
            throw new NotFoundHttpException('Produk tidak ditemukan.');
        }

        $existing = $cart->items()->where('product_id', $product->id)->first();
        $nextQty = ($existing?->qty ?? 0) + $qty;

        $this->writeCartItem($cart, $product, $nextQty, $customer, $existing);

        return $this->serializeCart($cart, $customer);
    }

    public function updateCustomerCartItem(Customer $customer, string $itemId, int $qty): array
    {
        $cart = $this->currentCustomerCart($customer);
        $item = $cart->items()->whereKey($itemId)->first();

        if (! $item) {
            throw new NotFoundHttpException('Item keranjang tidak ditemukan.');
        }

        if ($qty <= 0) {
            $item->delete();
            $this->recalculateCart($cart, $customer);

            return $this->serializeCart($cart, $customer);
        }

        $product = $this->productQuery()->whereKey($item->product_id)->first();

        if (! $product) {
            throw new NotFoundHttpException('Produk tidak ditemukan.');
        }

        $this->writeCartItem($cart, $product, $qty, $customer, $item);

        return $this->serializeCart($cart, $customer);
    }

    public function checkoutCustomer(Customer $customer, array $payload): array
    {
        $shippingMethod = Str::lower((string) ($payload['shipping_method'] ?? 'delivery'));
        $paymentMethod = (string) ($payload['payment_method'] ?? '');
        $shipping = is_array($payload['shipping'] ?? null) ? $payload['shipping'] : null;

        $cart = $this->currentCustomerCart($customer);
        $cart = $this->refreshCart($cart);
        $this->assertCartHasItems($cart);
        $this->recalculateCart($cart, $customer);
        $this->assertCheckoutAllowed($customer, $cart, $shippingMethod, $paymentMethod);

        $address = $payload['address'] ?? null;
        if ($shippingMethod === 'delivery' && ! is_array($address)) {
            throw new UnprocessableEntityHttpException('Alamat wajib diisi untuk pengiriman delivery.');
        }

        $store = $this->resolveStore();
        $selectedShipping = $shippingMethod === 'delivery' && $shipping
            ? $this->resolveSelectedDeliveryRate($cart, $shipping)
            : null;
        $shippingTotal = $selectedShipping ? (float) $selectedShipping['cost'] : 0.0;

        $order = DB::transaction(function () use (
            $address,
            $cart,
            $customer,
            $paymentMethod,
            $payload,
            $selectedShipping,
            $shippingMethod,
            $shippingTotal,
            $shipping,
            $store
        ): Order {
            $addressSnapshot = $shippingMethod === 'delivery'
                ? array_filter([
                    'recipient_name' => $address['recipient_name'] ?? $customer->full_name,
                    'recipient_phone' => $this->normalizePhone($address['recipient_phone'] ?? $customer->phone),
                    'address_line' => $address['address_line'] ?? null,
                    'district' => $address['district'] ?? null,
                    'city' => $address['city'] ?? null,
                    'province' => $address['province'] ?? null,
                    'postal_code' => $address['postal_code'] ?? null,
                    'notes' => $address['notes'] ?? null,
                    'destination' => array_filter([
                        'id' => (string) ($shipping['destination_id'] ?? ''),
                        'label' => $shipping['destination_label'] ?? null,
                        'province_name' => $shipping['province_name'] ?? ($address['province'] ?? null),
                        'city_name' => $shipping['city_name'] ?? ($address['city'] ?? null),
                        'district_name' => $shipping['district_name'] ?? ($address['district'] ?? null),
                        'subdistrict_name' => $shipping['subdistrict_name'] ?? null,
                        'zip_code' => $shipping['zip_code'] ?? ($address['postal_code'] ?? null),
                    ], static fn (mixed $value): bool => $value !== null && $value !== ''),
                    'shipping' => $selectedShipping,
                ], static fn (mixed $value): bool => $value !== null && $value !== [] && $value !== '')
                : [
                    'pickup_store_code' => $payload['pickup_store_code'] ?? $store->store_code,
                ];

            $status = Str::upper($paymentMethod) === 'COD'
                ? 'MENUNGGU_KONFIRMASI_TOKO'
                : 'MENUNGGU_PEMBAYARAN';
            $paymentStatus = Str::upper($paymentMethod) === 'COD' ? 'COD' : 'PENDING';

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'cart_id' => $cart->id,
                'customer_id' => $customer->id,
                'store_code' => $store->store_code,
                'checkout_type' => 'authenticated',
                'status' => $status,
                'payment_status' => $paymentStatus,
                'fulfillment_status' => 'BELUM_DIPROSES',
                'payment_method' => $paymentMethod,
                'shipping_method' => $shippingMethod,
                'pickup_store_code' => $shippingMethod === 'pickup'
                    ? ($payload['pickup_store_code'] ?? $store->store_code)
                    : null,
                'customer_full_name' => $customer->full_name ?: 'Customer',
                'customer_phone' => $this->normalizePhone($customer->phone),
                'customer_email' => $customer->email,
                'address_snapshot' => $addressSnapshot,
                'notes' => $payload['notes'] ?? null,
                'subtotal' => $cart->subtotal,
                'discount_total' => $cart->discount_total,
                'shipping_total' => $shippingTotal,
                'grand_total' => (float) $cart->grand_total + $shippingTotal,
                'auto_cancel_at' => now()->addHours(config('storefront.order_auto_cancel_hours', 24)),
            ]);

            $cart->loadMissing('items.product');

            foreach ($cart->items as $item) {
                $product = $item->product;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product?->id,
                    'product_name' => $product?->name ?? 'Produk',
                    'product_slug' => $product?->slug,
                    'unit' => $product?->unit ?? 'pcs',
                    'qty' => $item->qty,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->total,
                    'product_snapshot' => [
                        'price_type' => $item->price_type,
                        'amount' => $this->decimalString($item->unit_price),
                        'member_level' => $customer->member_tier,
                        'label' => $this->pricingLabelFor($customer),
                        'pricing_mode' => $this->pricingModeFor($customer),
                    ],
                ]);
            }

            $cart->update([
                'status' => 'CHECKED_OUT',
                'checked_out_at' => now(),
            ]);

            return $order->fresh();
        });

        $paymentInstruction = [
            'method' => $paymentMethod,
            'status' => Str::upper($paymentMethod) === 'COD' ? 'COD' : 'pending',
        ];

        if (Str::lower($paymentMethod) === 'duitku-va') {
            $paymentInstruction = array_merge(
                $paymentInstruction,
                $this->paymentService->createDuitkuPayment(
                    $order,
                    $this->defaultPaymentCallbackUrl(),
                    $this->defaultPaymentReturnUrl(),
                    $customer,
                ),
            );
        }

        return [
            'order' => $this->serializeCheckoutOrder($order, $customer),
            'payment_instruction' => $paymentInstruction,
            'next_action' => Str::upper($paymentMethod) === 'COD'
                ? 'WAIT_STORE_CONFIRMATION'
                : (($paymentInstruction['payment_url'] ?? null) ? 'OPEN_PAYMENT_URL' : 'OPEN_PAYMENT'),
            'invoices' => [],
        ];
    }

    public function listCustomerOrders(Customer $customer, int $limit = 20): array
    {
        $rows = Order::query()
            ->where('customer_id', $customer->id)
            ->latest('created_at')
            ->limit($limit)
            ->get();

        return [
            'items' => $rows
                ->map(fn (Order $order): array => $this->serializeOrderSummary($order, $customer))
                ->values()
                ->all(),
        ];
    }

    public function customerOrderDetail(Customer $customer, string $orderId): array
    {
        $order = Order::query()
            ->where('customer_id', $customer->id)
            ->whereKey($orderId)
            ->first();

        if (! $order) {
            throw new NotFoundHttpException('Order tidak ditemukan untuk akun ini.');
        }

        return $this->serializeOrderDetail($order, $customer);
    }

    public function findCustomerAddress(Customer $customer, string $addressId): CustomerAddress
    {
        $address = CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->whereKey($addressId)
            ->first();

        if (! $address) {
            throw new NotFoundHttpException('Alamat tidak ditemukan.');
        }

        return $address;
    }

    public function normalizePhone(?string $phone): ?string
    {
        $value = trim((string) $phone);
        if ($value === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if ($digits === '') {
            return $value;
        }

        if (Str::startsWith($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (! Str::startsWith($digits, '62')) {
            $digits = '62'.$digits;
        }

        return '+'.$digits;
    }

    private function serializeCustomerProfile(Customer $customer): array
    {
        return [
            'id' => (string) $customer->id,
            'full_name' => $customer->full_name ?: 'Customer',
            'phone' => $customer->phone,
            'email' => $customer->email,
            'member_tier' => $customer->member_tier,
            'username' => $customer->username,
        ];
    }

    private function serializeCart(Cart $cart, ?Customer $customer = null): array
    {
        $cart = $this->refreshCart($cart);
        $this->recalculateCart($cart, $customer);

        return [
            'id' => $cart->id,
            'guest_token' => $cart->guest_token,
            'status' => $cart->status,
            'subtotal' => $this->decimalString($cart->subtotal),
            'discount_total' => $this->decimalString($cart->discount_total),
            'grand_total' => $this->decimalString($cart->grand_total),
            'pricing_mode' => $this->pricingModeFor($customer),
            'customer_role' => $this->roleFor($customer),
            'checkout_rules' => $this->checkoutRules($customer),
            'items' => $cart->items
                ->map(function (CartItem $item) use ($customer): array {
                    $product = $item->product;
                    $pricing = $product ? $this->pricingPayload($product, $customer) : null;

                    return [
                        'id' => (string) $item->id,
                        'product_id' => (string) $item->product_id,
                        'product_name' => $product?->name,
                        'qty' => $item->qty,
                        'price_snapshot' => [
                            'price_type' => $item->price_type,
                            'amount' => $this->decimalString($item->unit_price),
                            'member_level' => $customer?->member_tier,
                            'label' => $pricing['label'] ?? $this->pricingLabelFor($customer),
                            'pricing_mode' => $pricing['mode'] ?? $this->pricingModeFor($customer),
                        ],
                        'promotion_snapshot' => [
                            'matched_promotions' => data_get($item->promotion_snapshot, 'matched_promotions', []),
                        ],
                        'subtotal' => $this->decimalString($item->subtotal),
                        'total' => $this->decimalString($item->total),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    private function checkoutRules(?Customer $customer = null): array
    {
        $role = $this->roleFor($customer);
        $allowCod = in_array('COD', config('storefront.allowed_payment_methods', ['duitku-va', 'COD']), true);
        $allowPickup = in_array('pickup', config('storefront.allowed_shipping_methods', ['delivery', 'pickup']), true);
        $allowDelivery = in_array('delivery', config('storefront.allowed_shipping_methods', ['delivery', 'pickup']), true);

        $shippingMethods = [];
        if ($allowDelivery) {
            $shippingMethods[] = ['code' => 'delivery', 'label' => 'Kirim langsung oleh toko'];
        }
        if ($allowPickup) {
            $shippingMethods[] = ['code' => 'pickup', 'label' => 'Ambil di toko'];
        }

        $paymentMethods = [['code' => 'duitku-va', 'label' => 'Pembayaran online Duitku']];
        if ($allowCod) {
            $paymentMethods[] = ['code' => 'COD', 'label' => 'Bayar di tempat (COD)'];
        }

        return [
            'role' => $role,
            'pricing_mode' => $this->pricingModeFor($customer),
            'minimum_order_amount' => $role === 'reseller'
                ? $this->decimalString(config('storefront.reseller_minimum_order_amount', 500000))
                : null,
            'apply_minimum_order' => $role === 'reseller',
            'allow_cod' => $allowCod,
            'allow_store_delivery' => $allowDelivery,
            'allow_pickup' => $allowPickup,
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
            'shipping_methods' => $shippingMethods,
            'payment_methods' => $paymentMethods,
        ];
    }

    private function serializeCheckoutOrder(Order $order, Customer $customer): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'grand_total' => $this->decimalString($order->grand_total),
            'shipping_total' => $this->decimalString($order->shipping_total),
            'auto_cancel_at' => optional($order->auto_cancel_at)?->toIso8601String(),
            'payment_due_at' => optional($order->auto_cancel_at)?->toIso8601String(),
            'shipping_method' => $order->shipping_method,
            'payment_method' => $order->payment_method,
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
            'customer_role' => $this->roleFor($customer),
        ];
    }

    private function serializeOrderSummary(Order $order, Customer $customer): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'fulfillment_status' => $order->fulfillment_status,
            'grand_total' => $this->decimalString($order->grand_total),
            'created_at' => optional($order->created_at)?->toIso8601String(),
            'shipping_method' => $order->shipping_method,
            'payment_method' => $order->payment_method,
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
            'customer_role' => $this->roleFor($customer),
        ];
    }

    private function serializeOrderDetail(Order $order, Customer $customer): array
    {
        $order->loadMissing(['items.product', 'items.product.images', 'payments']);
        $payment = $order->payments()->latest('id')->first();

        return array_merge(
            $this->serializeOrderSummary($order, $customer),
            [
                'payment_due_at' => optional($order->auto_cancel_at)?->toIso8601String(),
                'auto_cancel_at' => optional($order->auto_cancel_at)?->toIso8601String(),
                'notes' => $order->notes,
                'customer' => [
                    'full_name' => $order->customer_full_name,
                    'phone' => $order->customer_phone,
                    'email' => $order->customer_email,
                ],
                'address' => $order->address_snapshot ?? [],
                'pricing' => [
                    'subtotal' => $this->decimalString($order->subtotal),
                    'discount_total' => $this->decimalString($order->discount_total),
                    'shipping_total' => $this->decimalString($order->shipping_total),
                    'grand_total' => $this->decimalString($order->grand_total),
                    'payment_method' => $order->payment_method,
                    'shipping_method' => $order->shipping_method,
                    'invoice_source' => config('storefront.invoice_source', 'STORE'),
                ],
                'shipment' => [
                    'shipment_number' => null,
                    'status' => null,
                    'tracking_number' => data_get($order->address_snapshot, 'tracking_number'),
                    'delivery_method' => $order->shipping_method,
                    'pickup_store_code' => $order->pickup_store_code,
                    'courier_code' => data_get($order->address_snapshot, 'shipping.courier_code'),
                    'courier_name' => data_get($order->address_snapshot, 'shipping.courier_name'),
                    'service_code' => data_get($order->address_snapshot, 'shipping.service_code'),
                    'service_name' => data_get($order->address_snapshot, 'shipping.service_name'),
                    'etd' => data_get($order->address_snapshot, 'shipping.etd'),
                ],
                'payment' => [
                    'reference' => $payment?->payment_reference,
                    'status' => $payment?->status ?? $order->payment_status,
                    'gateway_code' => $payment?->gateway_code ?? (Str::upper($order->payment_method) === 'COD' ? null : 'duitku'),
                    'method_code' => $payment?->method_code ?? $order->payment_method,
                    'amount' => $payment ? $this->decimalString($payment->amount) : $this->decimalString($order->grand_total),
                    'paid_at' => optional($payment?->paid_at)?->toIso8601String(),
                ],
                'can_pay_online' => $order->payment_status === 'PENDING'
                    && Str::lower((string) $order->payment_method) === 'duitku-va',
                'items' => $order->items
                    ->map(fn (OrderItem $item): array => [
                        'id' => (string) $item->id,
                        'product_id' => (string) $item->product_id,
                        'product_name' => $item->product_name,
                        'product_slug' => $item->product_slug,
                        'qty' => $item->qty,
                        'unit_price' => $this->decimalString($item->unit_price),
                        'discount_total' => '0.00',
                        'line_total' => $this->decimalString($item->line_total),
                        'price_snapshot' => $item->product_snapshot ?? [],
                    ])
                    ->values()
                    ->all(),
                'invoices' => [],
            ]
        );
    }

    private function writeCartItem(
        Cart $cart,
        Product $product,
        int $qty,
        Customer $customer,
        ?CartItem $existing = null,
    ): void {
        $this->assertProductPurchasable($product, $qty);
        $pricing = $this->pricingPayload($product, $customer);
        $priceType = $this->priceTypeFor($product, $customer);
        $lineTotal = $qty * (float) $pricing['active']['amount'];

        DB::transaction(function () use ($cart, $existing, $lineTotal, $priceType, $pricing, $product, $qty, $customer): void {
            if ($existing) {
                $existing->update([
                    'qty' => $qty,
                    'price_type' => $priceType,
                    'unit_price' => $pricing['active']['amount'],
                    'subtotal' => $lineTotal,
                    'total' => $lineTotal,
                    'promotion_snapshot' => $this->promotionSnapshot($product, $customer),
                ]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'price_type' => $priceType,
                    'unit_price' => $pricing['active']['amount'],
                    'subtotal' => $lineTotal,
                    'total' => $lineTotal,
                    'promotion_snapshot' => $this->promotionSnapshot($product, $customer),
                ]);
            }
        });
    }

    private function refreshCart(Cart $cart): Cart
    {
        return Cart::query()
            ->with(['items.product.category', 'items.product.images'])
            ->findOrFail($cart->id);
    }

    private function recalculateCart(Cart $cart, ?Customer $customer = null): void
    {
        $cart->loadMissing('items.product');

        $subtotal = 0.0;
        foreach ($cart->items as $item) {
            $product = $item->product;
            if (! $product || ! $product->is_active) {
                continue;
            }

            $pricing = $this->pricingPayload($product, $customer);
            $priceType = $this->priceTypeFor($product, $customer);
            $lineTotal = $item->qty * (float) $pricing['active']['amount'];

            $item->update([
                'price_type' => $priceType,
                'unit_price' => $pricing['active']['amount'],
                'subtotal' => $lineTotal,
                'total' => $lineTotal,
                'promotion_snapshot' => $this->promotionSnapshot($product, $customer),
            ]);

            $subtotal += $lineTotal;
        }

        $cart->update([
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'grand_total' => $subtotal,
        ]);
    }

    private function sortProducts(
        Collection $rows,
        string $sort,
        ?Customer $customer = null,
        ?string $memberLevel = null,
    ): Collection {
        return (match ($sort) {
            'best_seller' => $rows->sortByDesc(fn (Product $product) => (int) $product->stock_qty),
            'price_asc' => $rows->sortBy(
                fn (Product $product) => (float) $this->pricingPayload($product, $customer, $memberLevel)['active']['amount']
            ),
            'price_desc' => $rows->sortByDesc(
                fn (Product $product) => (float) $this->pricingPayload($product, $customer, $memberLevel)['active']['amount']
            ),
            'name_asc' => $rows->sortBy(fn (Product $product) => Str::lower($product->name)),
            default => $rows->sortByDesc(fn (Product $product) => optional($product->created_at)->timestamp ?? 0),
        })->values();
    }

    private function pricingPayload(
        Product $product,
        ?Customer $customer = null,
        ?string $memberLevel = null,
    ): array {
        $retail = (float) $product->price;
        $promo = (float) ($product->promo_price ?: 0);
        $reseller = (float) ($product->reseller_price ?: 0);
        $isReseller = $this->isResellerContext($customer, $memberLevel);

        $retailActive = $promo > 0 && $promo < $retail ? $promo : $retail;
        $resellerActive = $reseller > 0 ? $reseller : $retailActive;
        $activeAmount = $isReseller ? $resellerActive : $retailActive;

        $compareAt = null;
        if ($isReseller && $reseller > 0 && $reseller < $retail) {
            $compareAt = $this->decimalString($retail);
        } elseif (! $isReseller && $promo > 0 && $promo < $retail) {
            $compareAt = $this->decimalString($retail);
        }

        return [
            'mode' => $isReseller ? 'reseller' : 'retail',
            'label' => $isReseller ? 'Harga reseller' : 'Harga toko',
            'compare_at_amount' => $compareAt,
            'active' => [
                'type' => $this->priceTypeFor($product, $customer, $memberLevel),
                'amount' => $this->decimalString($activeAmount),
                'min_qty' => 1,
                'member_level' => $memberLevel ?: $customer?->member_tier,
                'label' => $isReseller ? 'Harga reseller' : ($compareAt ? 'Harga promo' : 'Harga retail'),
            ],
            'retail' => [
                'type' => $promo > 0 && $promo < $retail ? 'PROMO' : 'NORMAL',
                'amount' => $this->decimalString($retailActive),
                'min_qty' => 1,
                'member_level' => null,
                'label' => $compareAt && ! $isReseller ? 'Harga promo' : 'Harga retail',
            ],
            'reseller' => [
                'type' => $reseller > 0 ? 'RESELLER' : 'NORMAL',
                'amount' => $this->decimalString($resellerActive),
                'min_qty' => 1,
                'member_level' => $memberLevel ?: $customer?->member_tier ?: 'reseller',
                'label' => 'Harga reseller',
            ],
        ];
    }

    private function availabilityPayload(Product $product): array
    {
        $stock = max(0, (int) $product->stock_qty);

        if ($stock <= 0) {
            return ['state' => 'out_of_stock', 'label' => 'Stok habis', 'stock_qty' => 0];
        }

        if ($stock <= 10) {
            return ['state' => 'low_stock', 'label' => 'Stok menipis', 'stock_qty' => $stock];
        }

        return ['state' => 'in_stock', 'label' => 'Tersedia', 'stock_qty' => $stock];
    }

    private function promotionSnapshot(Product $product, ?Customer $customer = null): array
    {
        $pricing = $this->pricingPayload($product, $customer);

        if ($pricing['compare_at_amount'] === null) {
            return ['matched_promotions' => []];
        }

        return [
            'matched_promotions' => [[
                'promotion_code' => 'PROMO-HARGA',
                'name' => 'Harga aktif lebih hemat',
                'benefit' => $pricing['label'],
            ]],
        ];
    }

    private function productPromotions(Product $product): array
    {
        if ((float) ($product->promo_price ?: 0) > 0 && (float) $product->promo_price < (float) $product->price) {
            return [[
                'code' => 'PROMO-HARGA',
                'name' => 'Harga promo aktif',
                'rule_payload' => [
                    'normal_price' => $this->decimalString($product->price),
                    'promo_price' => $this->decimalString($product->promo_price),
                ],
            ]];
        }

        return [];
    }

    private function stockBadge(Product $product): array
    {
        $stock = max(0, (int) $product->stock_qty);

        if ($stock <= 0) {
            return ['state' => 'empty', 'message' => 'Stok habis'];
        }

        if ($stock <= 10) {
            return ['state' => 'low', 'message' => 'Stok menipis'];
        }

        return ['state' => 'available', 'message' => 'Tersedia untuk diproses'];
    }

    private function productSummary(Product $product): string
    {
        $summary = trim((string) $product->description);

        if ($summary !== '') {
            return Str::limit(strip_tags($summary), 160);
        }

        return 'Produk aktif dari katalog Sidomakmur yang siap diproses dari backend Laravel.';
    }

    private function serializeContentSummary(array $item): array
    {
        return [
            'slug' => $item['slug'],
            'title' => $item['title'],
            'excerpt' => $item['excerpt'],
            'published_at' => $item['published_at'],
        ];
    }

    private function serializeContentDetail(array $item): array
    {
        return [
            'slug' => $item['slug'],
            'title' => $item['title'],
            'excerpt' => $item['excerpt'],
            'body_html' => $item['body_html'],
            'seo' => [
                'title' => $item['title'],
                'description' => $item['excerpt'],
            ],
        ];
    }

    private function pageTemplates(StoreSetting $store): array
    {
        $name = $store->store_name;
        $address = $store->store_address ?: '-';
        $whatsapp = $store->whatsapp_number ?: '-';
        $hours = $store->operational_hours ?: '-';

        return [
            [
                'slug' => 'tentang-kami',
                'title' => 'Tentang '.$name,
                'excerpt' => $name.' terhubung ke katalog, harga, dan stok dari backend Laravel yang sama untuk website dan Android.',
                'published_at' => null,
                'body_html' => '<p>'.$name.' menghadirkan katalog pertanian dan kebutuhan toko dari satu sumber data yang sama.</p>'
                    .'<p>Penyatuan backend ini membuat promo, produk, wishlist, checkout, dan halaman informasi lebih konsisten di web maupun aplikasi.</p>'
                    .'<p><strong>Alamat toko:</strong> '.$address.'</p>'
                    .'<p><strong>Jam operasional:</strong> '.$hours.'</p>',
            ],
            [
                'slug' => 'kontak',
                'title' => 'Kontak Toko',
                'excerpt' => 'Hubungi '.$name.' lewat alamat dan WhatsApp resmi yang dikelola dari backend utama.',
                'published_at' => null,
                'body_html' => '<p><strong>Nama toko:</strong> '.$name.'</p>'
                    .'<p><strong>Alamat:</strong> '.$address.'</p>'
                    .'<p><strong>WhatsApp:</strong> '.$whatsapp.'</p>'
                    .'<p><strong>Jam operasional:</strong> '.$hours.'</p>',
            ],
            [
                'slug' => 'faq',
                'title' => 'FAQ',
                'excerpt' => 'Jawaban singkat untuk pertanyaan yang paling sering muncul saat memakai storefront Sidomakmur.',
                'published_at' => null,
                'body_html' => '<h2>Apakah harga di aplikasi dan website sama?</h2>'
                    .'<p>Ya. Keduanya sekarang membaca backend Laravel yang sama, sehingga data harga, produk, dan status order lebih konsisten.</p>'
                    .'<h2>Bagaimana cara menghubungi toko?</h2>'
                    .'<p>Anda bisa menghubungi toko melalui WhatsApp resmi: '.$whatsapp.'</p>'
                    .'<h2>Apakah stok selalu real-time?</h2>'
                    .'<p>Status stok mengikuti data produk aktif yang dikelola admin di backend utama.</p>',
            ],
            [
                'slug' => 'kebijakan-privasi',
                'title' => 'Kebijakan Privasi',
                'excerpt' => 'Ringkasan cara data customer dipakai untuk proses login, wishlist, dan pesanan.',
                'published_at' => null,
                'body_html' => '<p>Data customer digunakan untuk login, penyimpanan wishlist, buku alamat, dan pelacakan transaksi.</p>'
                    .'<p>Backend utama menjaga agar website dan aplikasi membaca data akun dari sumber yang sama.</p>',
            ],
            [
                'slug' => 'syarat-dan-ketentuan',
                'title' => 'Syarat dan Ketentuan',
                'excerpt' => 'Ketentuan umum belanja, pembayaran, dan pengiriman di ekosistem Kios Sidomakmur.',
                'published_at' => null,
                'body_html' => '<p>Pesanan mengikuti harga aktif saat checkout dan kebijakan pengiriman yang berlaku di toko.</p>'
                    .'<p>Pembayaran online masih memakai link Duitku, sedangkan opsi COD mengikuti konfigurasi toko.</p>',
            ],
        ];
    }

    private function articleTemplates(StoreSetting $store): array
    {
        $name = $store->store_name;

        return [
            [
                'slug' => 'panduan-memilih-pupuk',
                'title' => 'Panduan memilih pupuk sesuai kebutuhan tanaman',
                'excerpt' => 'Mulai dari pemupukan dasar sampai penguatan akar, artikel ini membantu customer memilih produk dengan lebih tepat.',
                'published_at' => null,
                'body_html' => '<p>'.$name.' menyusun katalog pupuk agar customer lebih mudah membandingkan kebutuhan dasar, lanjutan, dan kondisi lahan.</p>'
                    .'<p>Mulai dari membaca tujuan pemupukan, cek dosis kemasan, lalu pastikan produk yang dipilih cocok dengan pola aplikasi di lapangan.</p>',
            ],
            [
                'slug' => 'dasar-memilih-benih',
                'title' => 'Cara membaca kualitas benih sebelum membeli',
                'excerpt' => 'Panduan cepat untuk menilai benih, varietas, dan hal-hal yang perlu dicek sebelum checkout.',
                'published_at' => null,
                'body_html' => '<p>Sebelum checkout, cek kecocokan varietas, umur tanam, dan reputasi produk yang tersedia di katalog.</p>'
                    .'<p>Dengan backend yang sama, artikel dan katalog sekarang bisa berjalan lebih selaras di website maupun Android.</p>',
            ],
            [
                'slug' => 'manajemen-belanja-toko',
                'title' => 'Belanja kebutuhan kios dan pertanian dengan lebih efisien',
                'excerpt' => 'Gabungkan kebutuhan toko, stok harian, dan produk inti pertanian dalam ritme belanja yang lebih tertata.',
                'published_at' => null,
                'body_html' => '<p>Belanja yang efisien dimulai dari daftar kebutuhan yang jelas, produk favorit tersimpan di wishlist, dan order yang mudah dilacak.</p>'
                    .'<p>Penyatuan backend membantu alur itu tetap konsisten di semua channel.</p>',
            ],
        ];
    }

    private function roleFor(?Customer $customer = null): string
    {
        if (! $customer) {
            return 'guest';
        }

        return $this->isResellerContext($customer) ? 'reseller' : 'customer';
    }

    private function pricingModeFor(?Customer $customer = null): string
    {
        return $this->roleFor($customer) === 'reseller' ? 'reseller' : 'retail';
    }

    private function pricingLabelFor(?Customer $customer = null): string
    {
        return $this->roleFor($customer) === 'reseller' ? 'Harga reseller' : 'Harga toko';
    }

    private function isResellerContext(?Customer $customer = null, ?string $memberLevel = null): bool
    {
        $value = Str::lower(trim((string) ($memberLevel ?: $customer?->member_tier)));

        return $value !== '' && Str::startsWith($value, 'reseller');
    }

    private function isFeaturedProduct(Product $product): bool
    {
        return (float) ($product->promo_price ?: 0) > 0;
    }

    private function isNewArrivalProduct(Product $product): bool
    {
        return optional($product->created_at)?->greaterThanOrEqualTo(now()->subDays(30)) ?? false;
    }

    private function isBestSellerProduct(Product $product): bool
    {
        return (int) $product->stock_qty >= 20;
    }

    private function priceTypeFor(
        Product $product,
        ?Customer $customer = null,
        ?string $memberLevel = null,
    ): string {
        if ($this->isResellerContext($customer, $memberLevel) && (float) ($product->reseller_price ?: 0) > 0) {
            return 'RESELLER';
        }

        if ((float) ($product->promo_price ?: 0) > 0 && (float) $product->promo_price < (float) $product->price) {
            return 'PROMO';
        }

        return 'NORMAL';
    }

    private function assertCartHasItems(Cart $cart): void
    {
        if (! $cart->items()->exists()) {
            throw new UnprocessableEntityHttpException('Keranjang kosong dan belum bisa di-checkout.');
        }
    }

    private function assertProductPurchasable(Product $product, int $qty): void
    {
        if (! $product->is_active) {
            throw new NotFoundHttpException('Produk tidak aktif.');
        }

        if ($qty <= 0) {
            throw new UnprocessableEntityHttpException('Jumlah produk harus lebih dari nol.');
        }

        if ((int) $product->stock_qty < $qty) {
            throw new UnprocessableEntityHttpException('Stok produk tidak mencukupi.');
        }
    }

    private function resolveSelectedDeliveryRate(Cart $cart, array $shipping): array
    {
        $destinationId = (string) ($shipping['destination_id'] ?? '');
        $courierCode = Str::lower((string) ($shipping['courier_code'] ?? ''));
        $serviceCode = Str::upper((string) ($shipping['service_code'] ?? ''));
        $submittedCost = isset($shipping['cost']) ? (float) $shipping['cost'] : null;

        if ($destinationId === '' || $courierCode === '' || $serviceCode === '') {
            throw new UnprocessableEntityHttpException('Pilih layanan pengiriman sebelum checkout.');
        }

        $availableRates = $this->rajaOngkir->calculateDomesticCost(
            $destinationId,
            $this->calculateCartWeight($cart),
            $courierCode,
        );

        $selectedRate = collect($availableRates)
            ->first(function (array $item) use ($courierCode, $serviceCode): bool {
                return Str::lower((string) ($item['courier_code'] ?? '')) === $courierCode
                    && Str::upper((string) ($item['service_code'] ?? '')) === $serviceCode;
            });

        if (! $selectedRate) {
            throw new UnprocessableEntityHttpException('Layanan pengiriman yang dipilih sudah tidak tersedia.');
        }

        $resolvedCost = (float) ($selectedRate['cost'] ?? 0);
        if ($submittedCost !== null && abs($resolvedCost - $submittedCost) > 0.01) {
            throw new UnprocessableEntityHttpException('Biaya pengiriman berubah. Silakan cek ongkir lagi.');
        }

        return [
            'destination_id' => $destinationId,
            'courier_code' => $selectedRate['courier_code'],
            'courier_name' => $selectedRate['courier_name'],
            'service_code' => $selectedRate['service_code'],
            'service_name' => $selectedRate['service_name'],
            'description' => $selectedRate['description'] ?? null,
            'cost' => $resolvedCost,
            'etd' => $selectedRate['etd'] ?? null,
            'total_weight_grams' => $this->calculateCartWeight($cart),
        ];
    }

    private function calculateCartWeight(Cart $cart): int
    {
        $cart->loadMissing('items.product');
        $defaultWeight = max(1, (int) config('rajaongkir.default_weight_grams', 1000));

        $totalWeight = (int) $cart->items->sum(function (CartItem $item) use ($defaultWeight): int {
            $weight = (int) ($item->product?->weight_grams ?? $defaultWeight);

            return max(1, $weight) * $item->qty;
        });

        return max($defaultWeight, $totalWeight);
    }

    private function assertCheckoutAllowed(
        Customer $customer,
        Cart $cart,
        string $shippingMethod,
        string $paymentMethod,
    ): void {
        $rules = $this->checkoutRules($customer);
        $allowedShipping = collect($rules['shipping_methods'])->pluck('code')->all();
        $allowedPayment = collect($rules['payment_methods'])->pluck('code')->all();

        if (! in_array($shippingMethod, $allowedShipping, true)) {
            throw new UnprocessableEntityHttpException('Metode pengiriman tidak didukung.');
        }

        if (! in_array($paymentMethod, $allowedPayment, true)) {
            throw new UnprocessableEntityHttpException('Metode pembayaran tidak didukung.');
        }

        if (
            $rules['apply_minimum_order']
            && (float) $cart->grand_total < (float) config('storefront.reseller_minimum_order_amount', 500000)
        ) {
            throw new UnprocessableEntityHttpException('Minimum order reseller adalah Rp500.000 per transaksi.');
        }
    }

    private function productQuery()
    {
        return Product::query()
            ->with(['category', 'images'])
            ->where('is_active', true);
    }

    private function decimalString(float|int|string|null $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }

    private function defaultPaymentCallbackUrl(): string
    {
        return rtrim((string) config('app.url', 'http://localhost'), '/').'/api/v1/payments/duitku/callback';
    }

    private function defaultPaymentReturnUrl(): string
    {
        return rtrim((string) config('app.url', 'http://localhost'), '/').'/android/duitku-return';
    }

    private function provinceFromStore(StoreSetting $store): string
    {
        $address = Str::lower((string) $store->store_address);

        return Str::contains($address, 'jawa timur') ? 'Jawa Timur' : 'Jawa Timur';
    }

    private function generateOrderNumber(): string
    {
        do {
            $value = 'KSM-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        } while (Order::query()->where('order_number', $value)->exists());

        return $value;
    }
}
