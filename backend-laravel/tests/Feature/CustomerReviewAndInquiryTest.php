<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerReviewAndInquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_customer_can_submit_product_review(): void
    {
        [$customer, $product] = $this->createPaidPurchase();
        $token = $customer->createToken('customer-review-test')->plainTextToken;

        $statusResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(sprintf('/api/v1/customer/products/%s/review-status', $product->id));

        $statusResponse
            ->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'eligible' => true,
                    'product_id' => (string) $product->id,
                    'existing_review' => null,
                ],
            ]);

        $submitResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(sprintf('/api/v1/customer/products/%s/reviews', $product->id), [
                'rating' => 5,
                'title' => 'Cocok untuk awal tanam',
                'body' => 'Produk ini membantu fase awal tanam jadi lebih rapi dan stoknya juga jelas.',
                'usage_context' => 'Cabai fase vegetatif',
            ]);

        $submitResponse
            ->assertCreated()
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'submitted',
                    'review' => [
                        'rating' => 5,
                        'moderation_status' => 'pending',
                        'verified_purchase' => true,
                    ],
                ],
            ]);
    }

    public function test_guest_can_submit_b2b_inquiry(): void
    {
        $response = $this->postJson('/api/v1/customer/b2b-inquiries', [
            'store_code' => 'SIDO-JATIM-ONLINE',
            'buyer_type' => 'reseller',
            'business_name' => 'Kios Tani Maju',
            'contact_name' => 'Budi',
            'phone' => '081234567890',
            'email' => 'budi@example.com',
            'commodity_focus' => 'Cabai dan sayuran daun',
            'bundle_slug' => 'jalur-cabai',
            'preferred_follow_up' => 'whatsapp',
            'monthly_volume' => 'Belanja rutin mingguan',
            'fulfillment_type' => 'delivery',
            'budget_hint' => '5-10 juta per bulan',
            'need_summary' => 'Butuh jalur pembelian rutin untuk kios dan rekomendasi paket yang bisa diulang.',
            'notes' => 'Mohon follow-up pada jam kerja.',
            'source_page' => '/b2b',
        ]);

        $response
            ->assertCreated()
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'new',
                    'preferred_follow_up' => 'whatsapp',
                ],
            ]);
    }

    /**
     * @return array{Customer, Product}
     */
    private function createPaidPurchase(): array
    {
        $category = Category::create([
            'name' => 'Pupuk',
            'slug' => 'pupuk',
            'description' => 'Kategori pupuk',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'sku' => 'PUPUK-01',
            'name' => 'Pupuk NPK Uji',
            'slug' => 'pupuk-npk-uji',
            'description' => 'Produk uji untuk review terverifikasi.',
            'unit' => 'sak',
            'weight_grams' => 1000,
            'price' => 75000,
            'promo_price' => null,
            'reseller_price' => null,
            'stock_qty' => 25,
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'full_name' => 'Bryan Review',
            'phone' => '+6281234567890',
            'email' => 'reviewer@example.com',
            'whatsapp_verified' => true,
            'is_guest' => false,
        ]);

        $order = Order::create([
            'order_number' => 'SO-20260423-REVIEW',
            'customer_id' => $customer->id,
            'store_code' => 'SIDO-JATIM-ONLINE',
            'checkout_type' => 'customer',
            'status' => 'DIPROSES',
            'payment_status' => 'PAID',
            'fulfillment_status' => 'BELUM_DIPROSES',
            'payment_method' => 'duitku-va',
            'shipping_method' => 'delivery',
            'customer_full_name' => $customer->full_name,
            'customer_phone' => $customer->phone,
            'customer_email' => $customer->email,
            'subtotal' => 75000,
            'discount_total' => 0,
            'shipping_total' => 10000,
            'grand_total' => 85000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'unit' => $product->unit,
            'qty' => 1,
            'unit_price' => 75000,
            'line_total' => 75000,
            'product_snapshot' => [
                'sku' => $product->sku,
                'name' => $product->name,
                'slug' => $product->slug,
            ],
        ]);

        return [$customer, $product];
    }
}
