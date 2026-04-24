<?php

namespace App\Support;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerCommerceService
{
    public function __construct(
        private readonly RajaOngkirService $rajaOngkir,
    ) {}

    public function createGuestCart(string $storeCode): Cart
    {
        $this->assertStoreIsActive($storeCode);

        return Cart::create([
            'store_code' => $storeCode,
            'guest_token' => Str::random(48),
            'status' => 'ACTIVE',
            'currency_code' => config('storefront.default_currency', 'IDR'),
            'subtotal' => 0,
            'discount_total' => 0,
            'grand_total' => 0,
        ]);
    }

    public function getGuestCart(string $cartId, string $guestToken): Cart
    {
        return Cart::query()
            ->with(['items.product.images'])
            ->whereKey($cartId)
            ->where('guest_token', $guestToken)
            ->firstOrFail();
    }

    public function addGuestCartItem(Cart $cart, Product $product, int $qty): Cart
    {
        $this->assertCartEditable($cart);
        $this->assertProductPurchasable($product, $qty);

        DB::transaction(function () use ($cart, $product, $qty): void {
            $pricing = $this->resolveProductPricing($product);
            $item = $cart->items()->where('product_id', $product->id)->first();
            $nextQty = ($item?->qty ?? 0) + $qty;

            $this->assertProductPurchasable($product, $nextQty);

            if ($item) {
                $item->update([
                    'qty' => $nextQty,
                    'price_type' => $pricing['price_type'],
                    'unit_price' => $pricing['unit_price'],
                    'subtotal' => $this->lineTotal($pricing['unit_price'], $nextQty),
                    'total' => $this->lineTotal($pricing['unit_price'], $nextQty),
                    'promotion_snapshot' => $pricing['promotion_snapshot'],
                ]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'qty' => $nextQty,
                    'price_type' => $pricing['price_type'],
                    'unit_price' => $pricing['unit_price'],
                    'subtotal' => $this->lineTotal($pricing['unit_price'], $nextQty),
                    'total' => $this->lineTotal($pricing['unit_price'], $nextQty),
                    'promotion_snapshot' => $pricing['promotion_snapshot'],
                ]);
            }

            $this->recalculateCart($cart);
        });

        return $this->freshCart($cart);
    }

    public function updateGuestCartItem(Cart $cart, CartItem $item, int $qty): Cart
    {
        $this->assertCartEditable($cart);

        if ($item->cart_id !== $cart->id) {
            throw new ModelNotFoundException('Item keranjang tidak ditemukan.');
        }

        DB::transaction(function () use ($cart, $item, $qty): void {
            if ($qty <= 0) {
                $item->delete();
                $this->recalculateCart($cart);
                return;
            }

            $product = $item->product()->firstOrFail();
            $this->assertProductPurchasable($product, $qty);

            $pricing = $this->resolveProductPricing($product);

            $item->update([
                'qty' => $qty,
                'price_type' => $pricing['price_type'],
                'unit_price' => $pricing['unit_price'],
                'subtotal' => $this->lineTotal($pricing['unit_price'], $qty),
                'total' => $this->lineTotal($pricing['unit_price'], $qty),
                'promotion_snapshot' => $pricing['promotion_snapshot'],
            ]);

            $this->recalculateCart($cart);
        });

        return $this->freshCart($cart);
    }

    public function quoteGuestShippingRates(
        Cart $cart,
        string $destinationId,
        ?string $courier = null,
    ): array {
        $this->assertCartEditable($cart);
        $this->assertCartHasItems($cart);

        $totalWeight = $this->calculateCartWeight($cart);
        $items = $this->rajaOngkir->calculateDomesticCost($destinationId, $totalWeight, $courier);

        return [
            'destination_id' => $destinationId,
            'total_weight_grams' => $totalWeight,
            'items' => $items,
        ];
    }

    public function checkoutGuest(Cart $cart, array $payload): array
    {
        $this->assertCartEditable($cart);
        $this->assertCartHasItems($cart);

        $shippingMethod = $payload['shipping_method'];
        $paymentMethod = $payload['payment_method'];
        $selectedShipping = $shippingMethod === 'delivery'
            ? $this->resolveSelectedDeliveryRate($cart, $payload['shipping'] ?? [])
            : null;
        $shippingTotal = $selectedShipping ? (float) $selectedShipping['cost'] : 0.0;
        $grandTotal = (float) $cart->grand_total + $shippingTotal;

        $this->assertShippingMethodAllowed($shippingMethod);
        $this->assertPaymentMethodAllowed($paymentMethod);

        $order = DB::transaction(function () use (
            $cart,
            $payload,
            $paymentMethod,
            $shippingMethod,
            $selectedShipping,
            $shippingTotal,
            $grandTotal
        ): Order {
            $customerPayload = $payload['customer'];
            $normalizedPhone = $this->normalizePhone($customerPayload['phone']);
            $normalizedEmail = $this->normalizeEmail($customerPayload['email'] ?? null);
            $addressSnapshot = null;

            if ($shippingMethod === 'delivery') {
                $addressSnapshot = array_merge($payload['address'] ?? [], [
                    'destination' => [
                        'id' => (string) ($payload['shipping']['destination_id'] ?? ''),
                        'label' => $payload['shipping']['destination_label'] ?? null,
                        'province_name' => $payload['shipping']['province_name'] ?? null,
                        'city_name' => $payload['shipping']['city_name'] ?? null,
                        'district_name' => $payload['shipping']['district_name'] ?? null,
                        'subdistrict_name' => $payload['shipping']['subdistrict_name'] ?? null,
                        'zip_code' => $payload['shipping']['zip_code'] ?? null,
                    ],
                    'shipping' => $selectedShipping,
                ]);
            }

            $customer = Customer::query()->firstOrCreate(
                ['phone' => $normalizedPhone],
                [
                    'full_name' => $customerPayload['full_name'],
                    'email' => $normalizedEmail,
                    'is_guest' => true,
                ]
            );

            $customer->fill([
                'full_name' => $customerPayload['full_name'],
                'email' => $normalizedEmail,
                'is_guest' => true,
                'last_order_at' => now(),
            ]);
            $customer->save();

            $orderNumber = $this->generateOrderNumber();

            $status = $paymentMethod === 'COD'
                ? 'MENUNGGU_KONFIRMASI_TOKO'
                : 'MENUNGGU_PEMBAYARAN';
            $paymentStatus = $paymentMethod === 'COD' ? 'COD' : 'PENDING';

            /** @var Order $order */
            $order = Order::create([
                'order_number' => $orderNumber,
                'cart_id' => $cart->id,
                'customer_id' => $customer->id,
                'store_code' => $cart->store_code,
                'checkout_type' => 'guest',
                'status' => $status,
                'payment_status' => $paymentStatus,
                'fulfillment_status' => 'BELUM_DIPROSES',
                'payment_method' => $paymentMethod,
                'shipping_method' => $shippingMethod,
                'pickup_store_code' => $shippingMethod === 'pickup'
                    ? ($payload['pickup_store_code'] ?? $cart->store_code)
                    : null,
                'customer_full_name' => $customerPayload['full_name'],
                'customer_phone' => $normalizedPhone,
                'customer_email' => $normalizedEmail,
                'address_snapshot' => $addressSnapshot,
                'notes' => $payload['notes'] ?? null,
                'subtotal' => $cart->subtotal,
                'discount_total' => $cart->discount_total,
                'shipping_total' => $shippingTotal,
                'grand_total' => $grandTotal,
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
                        'sku' => $product?->sku,
                        'name' => $product?->name,
                        'slug' => $product?->slug,
                        'unit' => $product?->unit,
                        'price_type' => $item->price_type,
                    ],
                ]);
            }

            $cart->update([
                'status' => 'CHECKED_OUT',
                'checked_out_at' => now(),
            ]);

            return $order->fresh('items');
        });

        return [
            'order' => $this->serializeCheckoutOrder($order),
            'payment_instruction' => [
                'method' => $order->payment_method,
                'status' => $order->payment_status,
            ],
            'next_action' => $order->payment_method === 'COD'
                ? 'WAIT_STORE_CONFIRMATION'
                : 'OPEN_PAYMENT',
            'invoices' => [],
        ];
    }

    public function trackOrder(string $orderNumber, string $phone): array
    {
        $order = $this->resolveGuestOrder($orderNumber, $phone);

        return [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'fulfillment_status' => $order->fulfillment_status,
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
            'shipment' => [
                'shipment_number' => null,
                'status' => null,
                'tracking_number' => null,
                'courier_code' => data_get($order->address_snapshot, 'shipping.courier_code'),
                'courier_name' => data_get($order->address_snapshot, 'shipping.courier_name'),
                'service_code' => data_get($order->address_snapshot, 'shipping.service_code'),
                'service_name' => data_get($order->address_snapshot, 'shipping.service_name'),
                'etd' => data_get($order->address_snapshot, 'shipping.etd'),
            ],
            'invoices' => [],
        ];
    }

    public function showGuestOrder(string $orderNumber, string $phone): array
    {
        $order = $this->resolveGuestOrder($orderNumber, $phone);
        $order->loadMissing('items.product.images');

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'fulfillment_status' => $order->fulfillment_status,
            'payment_due_at' => optional($order->auto_cancel_at)?->toIso8601String(),
            'auto_cancel_at' => optional($order->auto_cancel_at)?->toIso8601String(),
            'notes' => $order->notes,
            'customer' => [
                'full_name' => $order->customer_full_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
            ],
            'address' => $order->address_snapshot,
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
                'tracking_number' => null,
                'delivery_method' => $order->shipping_method,
                'pickup_store_code' => $order->pickup_store_code,
                'courier_code' => data_get($order->address_snapshot, 'shipping.courier_code'),
                'courier_name' => data_get($order->address_snapshot, 'shipping.courier_name'),
                'service_code' => data_get($order->address_snapshot, 'shipping.service_code'),
                'service_name' => data_get($order->address_snapshot, 'shipping.service_name'),
                'etd' => data_get($order->address_snapshot, 'shipping.etd'),
            ],
            'payment' => [
                'reference' => null,
                'status' => $order->payment_status,
                'gateway_code' => $order->payment_method === 'COD' ? null : 'duitku',
                'method_code' => $order->payment_method,
                'amount' => $this->decimalString($order->grand_total),
                'paid_at' => null,
            ],
            'can_pay_online' => $order->payment_status === 'PENDING'
                && strcasecmp((string) $order->payment_method, 'duitku-va') === 0,
            'items' => $order->items->map(function (OrderItem $item): array {
                return [
                    'id' => (string) $item->id,
                    'product_id' => $item->product_id ? (string) $item->product_id : null,
                    'product_name' => $item->product_name,
                    'product_slug' => $item->product_slug,
                    'qty' => $item->qty,
                    'unit_price' => $this->decimalString($item->unit_price),
                    'discount_total' => '0.00',
                    'line_total' => $this->decimalString($item->line_total),
                    'price_snapshot' => $item->product_snapshot ?? [],
                ];
            })->values()->all(),
            'invoices' => [],
        ];
    }

    public function serializeCart(Cart $cart): array
    {
        $cart->loadMissing(['items.product.images']);

        return [
            'id' => $cart->id,
            'store_code' => $cart->store_code,
            'guest_token' => $cart->guest_token,
            'status' => $cart->status,
            'pricing_mode' => 'retail',
            'customer_role' => 'guest',
            'checkout_rules' => $this->checkoutRules(),
            'subtotal' => $this->decimalString($cart->subtotal),
            'discount_total' => $this->decimalString($cart->discount_total),
            'grand_total' => $this->decimalString($cart->grand_total),
            'total_weight_grams' => $this->calculateCartWeight($cart),
            'items' => $cart->items->map(function (CartItem $item): array {
                $product = $item->product;

                return [
                    'id' => (string) $item->id,
                    'product_id' => (string) $item->product_id,
                    'product_name' => $product?->name,
                    'product_slug' => $product?->slug,
                    'product_unit' => $product?->unit,
                    'product_image_url' => $product?->primary_image_url,
                    'qty' => $item->qty,
                    'price_snapshot' => [
                        'amount' => $this->decimalString($item->unit_price),
                        'price_type' => $item->price_type,
                    ],
                    'weight_grams' => (int) ($product?->weight_grams ?? config('rajaongkir.default_weight_grams', 1000)),
                    'promotion_snapshot' => [
                        'matched_promotions' => $item->promotion_snapshot['matched_promotions'] ?? [],
                    ],
                    'subtotal' => $this->decimalString($item->subtotal),
                    'total' => $this->decimalString($item->total),
                ];
            })->values()->all(),
        ];
    }

    private function serializeCheckoutOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'shipping_total' => $this->decimalString($order->shipping_total),
            'grand_total' => $this->decimalString($order->grand_total),
            'auto_cancel_at' => optional($order->auto_cancel_at)?->toIso8601String(),
            'shipping_method' => $order->shipping_method,
            'payment_method' => $order->payment_method,
            'shipping_service' => data_get($order->address_snapshot, 'shipping.service_name'),
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
            'customer_role' => 'guest',
        ];
    }

    private function freshCart(Cart $cart): Cart
    {
        return Cart::query()
            ->with(['items.product.images'])
            ->findOrFail($cart->id);
    }

    private function recalculateCart(Cart $cart): void
    {
        $cart->load('items');

        $subtotal = $cart->items->sum(fn (CartItem $item) => (float) $item->subtotal);
        $discountTotal = 0.0;

        $cart->update([
            'subtotal' => $subtotal,
            'discount_total' => $discountTotal,
            'grand_total' => $subtotal - $discountTotal,
        ]);
    }

    private function resolveProductPricing(Product $product): array
    {
        $isPromo = $product->promo_price !== null && (float) $product->promo_price > 0;
        $unitPrice = $isPromo ? (float) $product->promo_price : (float) $product->price;

        return [
            'unit_price' => $unitPrice,
            'price_type' => $isPromo ? 'PROMO' : 'NORMAL',
            'promotion_snapshot' => [
                'matched_promotions' => $isPromo
                    ? [[
                        'promotion_code' => 'PROMO-HARGA',
                        'name' => 'Harga promo aktif',
                        'benefit' => 'Potongan harga langsung',
                    ]]
                    : [],
            ],
        ];
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

        $availableRates = $this->quoteGuestShippingRates($cart, $destinationId, $courierCode);
        $selectedRate = collect($availableRates['items'])
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
            'total_weight_grams' => $availableRates['total_weight_grams'],
        ];
    }

    private function lineTotal(float $unitPrice, int $qty): float
    {
        return round($unitPrice * $qty, 2);
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

    private function assertStoreIsActive(string $storeCode): void
    {
        $exists = StoreSetting::query()
            ->where('store_code', $storeCode)
            ->where('is_active', true)
            ->exists();

        if (! $exists) {
            throw new ModelNotFoundException('Store tidak ditemukan atau tidak aktif.');
        }
    }

    private function assertCartEditable(Cart $cart): void
    {
        if ($cart->status !== 'ACTIVE') {
            throw new ModelNotFoundException('Keranjang tidak aktif.');
        }
    }

    private function assertCartHasItems(Cart $cart): void
    {
        if (! $cart->items()->exists()) {
            throw new UnprocessableEntityHttpException('Keranjang kosong dan tidak dapat di-checkout.');
        }
    }

    private function assertProductPurchasable(Product $product, int $qty): void
    {
        if (! $product->is_active) {
            throw new ModelNotFoundException('Produk tidak aktif.');
        }

        if ($product->stock_qty < $qty) {
            throw new UnprocessableEntityHttpException('Stok produk tidak mencukupi.');
        }
    }

    private function assertShippingMethodAllowed(string $shippingMethod): void
    {
        if (! in_array($shippingMethod, config('storefront.allowed_shipping_methods', ['delivery', 'pickup']), true)) {
            throw new UnprocessableEntityHttpException('Metode pengiriman tidak tersedia.');
        }
    }

    private function assertPaymentMethodAllowed(string $paymentMethod): void
    {
        if (! in_array($paymentMethod, config('storefront.allowed_payment_methods', ['duitku-va', 'COD']), true)) {
            throw new UnprocessableEntityHttpException('Metode pembayaran tidak tersedia.');
        }
    }

    private function resolveGuestOrder(string $orderNumber, string $phone): Order
    {
        $order = Order::query()->where('order_number', $orderNumber)->firstOrFail();

        if ($this->normalizePhone($phone) !== $order->customer_phone) {
            throw new AccessDeniedHttpException('Data pelacakan tidak cocok.');
        }

        return $order;
    }

    private function checkoutRules(): array
    {
        return [
            'minimum_order_amount' => $this->decimalString(config('storefront.guest_minimum_order_amount', 0)),
            'allowed_shipping_methods' => config('storefront.allowed_shipping_methods', ['delivery', 'pickup']),
            'allowed_payment_methods' => config('storefront.allowed_payment_methods', ['duitku-va', 'COD']),
            'invoice_source' => config('storefront.invoice_source', 'STORE'),
        ];
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return $phone;
        }

        if (Str::startsWith($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (! Str::startsWith($digits, '62')) {
            $digits = '62'.$digits;
        }

        return '+'.$digits;
    }

    private function normalizeEmail(?string $email): ?string
    {
        return $email ? Str::lower(trim($email)) : null;
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = sprintf('SO-%s-%s', now()->format('Ymd'), Str::upper(Str::random(6)));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    private function decimalString(string|float|int|null $value): string
    {
        return number_format((float) ($value ?? 0), 2, '.', '');
    }
}
