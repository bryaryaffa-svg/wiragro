<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RajaOngkirCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'rajaongkir.api_key' => 'test-rajaongkir-key',
            'rajaongkir.origin_id' => '152',
            'rajaongkir.couriers' => ['jne', 'jnt'],
            'storefront.allowed_shipping_methods' => ['delivery', 'pickup'],
            'storefront.allowed_payment_methods' => ['duitku-va', 'COD'],
        ]);
    }

    public function test_it_searches_shipping_destinations_from_raja_ongkir(): void
    {
        Http::fake([
            'https://rajaongkir.komerce.id/api/v1/destination/domestic-destination*' => Http::response([
                'data' => [
                    [
                        'id' => 41972,
                        'label' => 'Sumberagung, Rejotangan, Tulungagung',
                        'province_name' => 'Jawa Timur',
                        'city_name' => 'Tulungagung',
                        'district_name' => 'Rejotangan',
                        'subdistrict_name' => null,
                        'zip_code' => '66293',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/customer/shipping/destinations?search=rejotangan');

        $response
            ->assertOk()
            ->assertJson([
                'items' => [
                    [
                        'id' => '41972',
                        'label' => 'Sumberagung, Rejotangan, Tulungagung',
                        'province_name' => 'Jawa Timur',
                        'city_name' => 'Tulungagung',
                        'district_name' => 'Rejotangan',
                        'subdistrict_name' => null,
                        'zip_code' => '66293',
                    ],
                ],
            ]);
    }

    public function test_it_quotes_guest_shipping_rates_using_cart_weight(): void
    {
        $cart = $this->createGuestCart(weightGrams: 750, qty: 2);

        Http::fake(function ($request) {
            $this->assertSame('152', (string) $request['origin']);
            $this->assertSame('41972', (string) $request['destination']);
            $this->assertSame(1500, (int) $request['weight']);
            $this->assertSame('jne:jnt', (string) $request['courier']);

            return Http::response([
                'data' => [
                    [
                        'code' => 'jne',
                        'name' => 'JNE',
                        'service' => 'REG',
                        'description' => 'Layanan Reguler',
                        'cost' => 18000,
                        'etd' => '2-3 hari',
                    ],
                    [
                        'code' => 'jnt',
                        'name' => 'J&T',
                        'service' => 'EZ',
                        'description' => 'J&T EZ',
                        'cost' => 20000,
                        'etd' => '1-2 hari',
                    ],
                ],
            ], 200);
        });

        $response = $this->postJson('/api/v1/customer/shipping/rates', [
            'cart_id' => $cart->id,
            'guest_token' => $cart->guest_token,
            'destination_id' => '41972',
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'destination_id' => '41972',
                'total_weight_grams' => 1500,
                'items' => [
                    [
                        'id' => 'jne:REG',
                        'courier_code' => 'jne',
                        'courier_name' => 'JNE',
                        'service_code' => 'REG',
                        'service_name' => 'Layanan Reguler',
                        'description' => 'Layanan Reguler',
                        'cost' => '18000.00',
                        'etd' => '2-3 hari',
                    ],
                    [
                        'id' => 'jnt:EZ',
                        'courier_code' => 'jnt',
                        'courier_name' => 'J&T',
                        'service_code' => 'EZ',
                        'service_name' => 'J&T EZ',
                        'description' => 'J&T EZ',
                        'cost' => '20000.00',
                        'etd' => '1-2 hari',
                    ],
                ],
            ]);
    }

    public function test_it_checks_out_guest_order_with_selected_raja_ongkir_rate(): void
    {
        $cart = $this->createGuestCart(weightGrams: 1200, qty: 2, unitPrice: 50000);

        Http::fake(function ($request) {
            $this->assertSame('152', (string) $request['origin']);
            $this->assertSame('41972', (string) $request['destination']);
            $this->assertSame(2400, (int) $request['weight']);
            $this->assertSame('jne', (string) $request['courier']);

            return Http::response([
                'data' => [
                    [
                        'code' => 'jne',
                        'name' => 'JNE',
                        'service' => 'REG',
                        'description' => 'Layanan Reguler',
                        'cost' => 18000,
                        'etd' => '2-3 hari',
                    ],
                ],
            ], 200);
        });

        $response = $this->postJson('/api/v1/customer/checkout/guest', [
            'cart_id' => $cart->id,
            'guest_token' => $cart->guest_token,
            'customer' => [
                'full_name' => 'Bryan Test',
                'phone' => '081234567890',
                'email' => 'bryan@example.com',
            ],
            'shipping_method' => 'delivery',
            'address' => [
                'recipient_name' => 'Bryan Test',
                'recipient_phone' => '081234567890',
                'address_line' => 'Jl. Raya Sidomakmur No. 1',
                'district' => 'Rejotangan',
                'city' => 'Tulungagung',
                'province' => 'Jawa Timur',
                'postal_code' => '66293',
            ],
            'shipping' => [
                'destination_id' => '41972',
                'destination_label' => 'Sumberagung, Rejotangan, Tulungagung',
                'province_name' => 'Jawa Timur',
                'city_name' => 'Tulungagung',
                'district_name' => 'Rejotangan',
                'zip_code' => '66293',
                'courier_code' => 'jne',
                'courier_name' => 'JNE',
                'service_code' => 'REG',
                'service_name' => 'Layanan Reguler',
                'description' => 'Layanan Reguler',
                'cost' => 18000,
                'etd' => '2-3 hari',
            ],
            'payment_method' => 'duitku-va',
            'notes' => 'Mohon kirim sore hari.',
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'order' => [
                    'status' => 'MENUNGGU_PEMBAYARAN',
                    'payment_status' => 'PENDING',
                    'shipping_total' => '18000.00',
                    'grand_total' => '118000.00',
                    'shipping_method' => 'delivery',
                    'payment_method' => 'duitku-va',
                    'shipping_service' => 'Layanan Reguler',
                ],
                'next_action' => 'OPEN_PAYMENT',
            ]);

        $order = Order::query()->firstOrFail();

        $this->assertSame('delivery', $order->shipping_method);
        $this->assertSame('18000.00', number_format((float) $order->shipping_total, 2, '.', ''));
        $this->assertSame('118000.00', number_format((float) $order->grand_total, 2, '.', ''));
        $this->assertSame('jne', data_get($order->address_snapshot, 'shipping.courier_code'));
        $this->assertSame('REG', data_get($order->address_snapshot, 'shipping.service_code'));
        $this->assertSame('41972', data_get($order->address_snapshot, 'destination.id'));

        $cart->refresh();
        $this->assertSame('CHECKED_OUT', $cart->status);
    }

    private function createGuestCart(
        int $weightGrams,
        int $qty,
        float $unitPrice = 25000,
    ): Cart {
        StoreSetting::create([
            'store_name' => 'Kios Sidomakmur',
            'store_code' => 'SIDO-JATIM-ONLINE',
            'store_address' => 'Desa Panjerejo, Rejotangan, Tulungagung',
            'whatsapp_number' => '6281234567890',
            'operational_hours' => '08:00 - 17:00',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Pupuk',
            'slug' => 'pupuk',
            'description' => 'Kategori pupuk',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'sku' => sprintf('SKU-%s', $weightGrams),
            'name' => 'Pupuk Organik',
            'slug' => sprintf('pupuk-organik-%s', $weightGrams),
            'description' => 'Pupuk untuk test checkout RajaOngkir',
            'unit' => 'sak',
            'weight_grams' => $weightGrams,
            'price' => $unitPrice,
            'promo_price' => null,
            'reseller_price' => null,
            'stock_qty' => 50,
            'is_active' => true,
        ]);

        $cart = Cart::create([
            'store_code' => 'SIDO-JATIM-ONLINE',
            'guest_token' => str_repeat('g', 48),
            'status' => 'ACTIVE',
            'currency_code' => 'IDR',
            'subtotal' => $unitPrice * $qty,
            'discount_total' => 0,
            'grand_total' => $unitPrice * $qty,
        ]);

        $cart->items()->create([
            'product_id' => $product->id,
            'qty' => $qty,
            'price_type' => 'NORMAL',
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice * $qty,
            'total' => $unitPrice * $qty,
            'promotion_snapshot' => [
                'matched_promotions' => [],
            ],
        ]);

        return $cart->fresh(['items.product']);
    }
}
