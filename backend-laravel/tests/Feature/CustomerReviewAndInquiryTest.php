<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\B2BInquiry;
use App\Models\User;
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
            'commodity_slug' => 'cabai',
            'bundle_slug' => 'jalur-cabai',
            'product_slug' => 'paket-cabai-inti',
            'product_name' => 'Paket Cabai Inti',
            'preferred_follow_up' => 'whatsapp',
            'monthly_volume' => 'Belanja rutin mingguan',
            'fulfillment_type' => 'delivery',
            'budget_hint' => '5-10 juta per bulan',
            'need_summary' => 'Butuh jalur pembelian rutin untuk kios dan rekomendasi paket yang bisa diulang.',
            'requested_items' => [
                [
                    'label' => 'Paket cabai untuk kios',
                    'qty' => '20',
                    'unit' => 'pak',
                    'notes' => 'Fokus untuk rotasi mingguan.',
                ],
            ],
            'notes' => 'Mohon follow-up pada jam kerja.',
            'source_page' => '/b2b',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'inquiry_number',
                    'status',
                    'status_label',
                    'preferred_follow_up',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'new',
                    'status_label' => 'Menunggu ditinjau',
                    'preferred_follow_up' => 'whatsapp',
                ],
            ]);
    }

    public function test_authenticated_customer_can_submit_and_list_b2b_quote_flow(): void
    {
        $customer = Customer::create([
            'full_name' => 'B2B Customer',
            'phone' => '+6281234567891',
            'email' => 'b2b-customer@example.com',
            'whatsapp_verified' => true,
            'is_guest' => false,
        ]);
        $token = $customer->createToken('customer-b2b-test')->plainTextToken;

        $storeResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/customer/b2b-inquiries/me', [
                'store_code' => 'SIDO-JATIM-ONLINE',
                'buyer_type' => 'kebun',
                'business_name' => 'Kebun Maju',
                'contact_name' => 'Nama Akan Diambil Dari Akun',
                'phone' => '081234567891',
                'email' => 'other@example.com',
                'commodity_focus' => 'Cabai merah',
                'commodity_slug' => 'cabai',
                'campaign_slug' => 'cabai-musim-hujan',
                'product_slug' => 'nutrisi-cabai-premium',
                'product_name' => 'Nutrisi Cabai Premium',
                'preferred_follow_up' => 'whatsapp',
                'monthly_volume' => 'Dua minggu sekali',
                'fulfillment_type' => 'delivery',
                'budget_hint' => '15 juta per bulan',
                'need_summary' => 'Butuh quote ringan untuk pembelian kebun cabai dengan pengiriman rutin dan pilihan paket yang lebih stabil.',
                'requested_items' => [
                    [
                        'label' => 'Program nutrisi cabai',
                        'qty' => '40',
                        'unit' => 'botol',
                        'notes' => 'Prioritas fase vegetatif ke generatif.',
                    ],
                ],
                'notes' => 'Follow-up lewat WhatsApp sore hari.',
                'source_page' => '/kampanye/cabai-musim-hujan',
            ]);

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.status_label', 'Menunggu ditinjau');

        $inquiryId = $storeResponse->json('data.id');

        B2BInquiry::query()
            ->whereKey($inquiryId)
            ->update([
                'status' => 'quoted',
                'quote_items' => [
                    [
                        'label' => 'Program nutrisi cabai',
                        'qty' => '40',
                        'unit' => 'botol',
                        'notes' => 'Estimasi untuk dua minggu pertama.',
                        'unit_estimate_amount' => '95000.00',
                        'line_estimate_amount' => '3800000.00',
                    ],
                ],
                'estimate_subtotal' => 3800000,
                'estimate_shipping' => 150000,
                'estimate_total' => 3950000,
                'sales_note' => 'Estimasi awal ini masih menunggu konfirmasi stok dan jadwal kirim.',
                'quoted_at' => now(),
                'contacted_at' => now(),
            ]);

        $listResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/customer/b2b-inquiries/me');

        $listResponse
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $inquiryId)
            ->assertJsonPath('data.items.0.status', 'quoted')
            ->assertJsonPath('data.items.0.quote.total_amount', '3950000.00')
            ->assertJsonPath('data.items.0.quote.items.0.label', 'Program nutrisi cabai')
            ->assertJsonPath(
                'data.items.0.quote.sales_note',
                'Estimasi awal ini masih menunggu konfirmasi stok dan jadwal kirim.'
            );

        $detailResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(sprintf('/api/v1/customer/b2b-inquiries/me/%s', $inquiryId));

        $detailResponse
            ->assertOk()
            ->assertJsonPath('data.contact_name', $customer->full_name)
            ->assertJsonPath('data.phone', $customer->phone)
            ->assertJsonPath('data.commodity_slug', 'cabai')
            ->assertJsonPath('data.campaign_slug', 'cabai-musim-hujan')
            ->assertJsonPath('data.product_slug', 'nutrisi-cabai-premium')
            ->assertJsonPath('data.product_name', 'Nutrisi Cabai Premium')
            ->assertJsonPath('data.requested_items.0.label', 'Program nutrisi cabai');
    }

    public function test_authenticated_customer_only_sees_own_and_guest_matched_b2b_inquiries(): void
    {
        $customer = Customer::create([
            'full_name' => 'Customer Cocok',
            'phone' => '+6281234567000',
            'email' => 'matched@example.com',
            'whatsapp_verified' => true,
            'is_guest' => false,
        ]);
        $otherCustomer = Customer::create([
            'full_name' => 'Customer Lain',
            'phone' => '+6281234567999',
            'email' => 'other@example.com',
            'whatsapp_verified' => true,
            'is_guest' => false,
        ]);
        $token = $customer->createToken('customer-b2b-ownership-test')->plainTextToken;

        $ownedInquiry = B2BInquiry::query()->create([
            'customer_id' => $customer->id,
            'store_code' => 'SIDO-JATIM-ONLINE',
            'buyer_type' => 'kebun',
            'contact_name' => 'Customer Cocok',
            'phone' => $customer->phone,
            'email' => $customer->email,
            'preferred_follow_up' => 'whatsapp',
            'need_summary' => 'Inquiry milik customer login.',
            'requested_items' => [
                ['label' => 'Paket tanam inti'],
            ],
            'status' => 'new',
        ]);
        $guestMatchedInquiry = B2BInquiry::query()->create([
            'store_code' => 'SIDO-JATIM-ONLINE',
            'buyer_type' => 'reseller',
            'contact_name' => 'Guest Cocok',
            'phone' => $customer->phone,
            'email' => $customer->email,
            'preferred_follow_up' => 'whatsapp',
            'need_summary' => 'Inquiry guest lama yang harus tetap muncul.',
            'requested_items' => [
                ['label' => 'Kebutuhan kios'],
            ],
            'status' => 'contacted',
        ]);
        B2BInquiry::query()->create([
            'customer_id' => $otherCustomer->id,
            'store_code' => 'SIDO-JATIM-ONLINE',
            'buyer_type' => 'proyek',
            'contact_name' => 'Customer Lain',
            'phone' => $customer->phone,
            'email' => $customer->email,
            'preferred_follow_up' => 'whatsapp',
            'need_summary' => 'Inquiry customer lain dengan kontak serupa tidak boleh ikut tampil.',
            'requested_items' => [
                ['label' => 'Project pack'],
            ],
            'status' => 'quoted',
        ]);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/customer/b2b-inquiries/me');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data.items')
            ->assertJsonFragment(['id' => (string) $ownedInquiry->id])
            ->assertJsonFragment(['id' => (string) $guestMatchedInquiry->id]);

        $this->assertSame(
            collect([$ownedInquiry->id, $guestMatchedInquiry->id])->sort()->values()->all(),
            collect($response->json('data.items'))->pluck('id')->sort()->values()->all()
        );
    }

    public function test_admin_can_update_b2b_inquiry_with_quote_payload(): void
    {
        $inquiry = B2BInquiry::query()->create([
            'store_code' => 'SIDO-JATIM-ONLINE',
            'buyer_type' => 'reseller',
            'business_name' => 'Kios Tani Hebat',
            'contact_name' => 'Sinta',
            'phone' => '+628123450000',
            'email' => 'sinta@example.com',
            'preferred_follow_up' => 'whatsapp',
            'need_summary' => 'Butuh draft quote sederhana untuk pembelian kios.',
            'requested_items' => [
                [
                    'label' => 'Paket kios cabai',
                    'qty' => '10',
                    'unit' => 'pak',
                ],
            ],
            'status' => 'new',
        ]);

        $admin = User::create([
            'name' => 'Admin QA',
            'email' => 'admin-b2b@example.com',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);
        $token = $admin->createToken('admin-b2b-test')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson(sprintf('/api/v1/admin/b2b-inquiries/%s', $inquiry->id), [
                'status' => 'quoted',
                'quote_items' => [
                    [
                        'label' => 'Paket kios cabai',
                        'qty' => '10',
                        'unit' => 'pak',
                        'notes' => 'Estimasi batch awal.',
                        'unit_estimate_amount' => 225000,
                        'line_estimate_amount' => 2250000,
                    ],
                ],
                'estimate_subtotal' => 2250000,
                'estimate_shipping' => 100000,
                'estimate_total' => 2350000,
                'sales_note' => 'Harga final akan dikunci setelah stok gudang dikonfirmasi.',
                'internal_note' => 'Prioritas follow-up reseller area timur.',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.status', 'quoted')
            ->assertJsonPath('data.estimate_total', '2350000.00')
            ->assertJsonPath('data.sales_note', 'Harga final akan dikunci setelah stok gudang dikonfirmasi.')
            ->assertJsonPath('data.quote_items.0.label', 'Paket kios cabai');
    }

    public function test_customer_orders_expose_review_status_only_for_paid_orders(): void
    {
        [$customer, $product] = $this->createPaidPurchase();
        $paidOrder = Order::query()
            ->where('customer_id', $customer->id)
            ->latest('created_at')
            ->firstOrFail();
        $pendingOrder = Order::create([
            'order_number' => 'SO-20260424-PENDING',
            'customer_id' => $customer->id,
            'store_code' => 'SIDO-JATIM-ONLINE',
            'checkout_type' => 'customer',
            'status' => 'MENUNGGU_PEMBAYARAN',
            'payment_status' => 'PENDING',
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
            'order_id' => $pendingOrder->id,
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

        ProductReview::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'order_id' => $paidOrder->id,
            'rating' => 4,
            'title' => 'Sedang dicek',
            'body' => 'Review ini harus tampil sebagai pending di order paid.',
            'usage_context' => 'Cabai vegetatif',
            'verified_purchase' => true,
            'moderation_status' => 'pending',
            'submitted_at' => now(),
        ]);

        $token = $customer->createToken('customer-order-review-test')->plainTextToken;

        $historyResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/customer/orders/me');

        $historyResponse->assertOk();

        $historyItems = collect($historyResponse->json('items'));
        $paidPayload = $historyItems->firstWhere('id', $paidOrder->id);
        $pendingPayload = $historyItems->firstWhere('id', $pendingOrder->id);

        $this->assertNotNull($paidPayload);
        $this->assertNotNull($pendingPayload);
        $this->assertTrue($paidPayload['review_summary']['order_eligible']);
        $this->assertSame(0, $paidPayload['review_summary']['ready_item_count']);
        $this->assertSame(1, $paidPayload['review_summary']['pending_item_count']);
        $this->assertSame('pending', $paidPayload['review_summary']['items'][0]['state']);
        $this->assertFalse($pendingPayload['review_summary']['order_eligible']);
        $this->assertSame(0, $pendingPayload['review_summary']['ready_item_count']);
        $this->assertSame('awaiting_payment', $pendingPayload['review_summary']['items'][0]['state']);

        $detailResponse = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(sprintf('/api/v1/customer/orders/me/%s', $paidOrder->id));

        $detailResponse
            ->assertOk()
            ->assertJsonPath('review_summary.pending_item_count', 1)
            ->assertJsonPath('items.0.review_status.state', 'pending');
    }

    public function test_public_product_payload_includes_only_approved_review_summary(): void
    {
        [$customer, $product] = $this->createPaidPurchase();
        $orderId = Order::query()->value('id');
        $secondCustomer = Customer::create([
            'full_name' => 'Rina Review',
            'phone' => '+6281234567000',
            'email' => 'reviewer-two@example.com',
            'whatsapp_verified' => true,
            'is_guest' => false,
        ]);

        ProductReview::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'order_id' => $orderId,
            'rating' => 5,
            'title' => 'Mantap untuk fase awal',
            'body' => 'Hasil review publik yang sudah lolos moderasi.',
            'usage_context' => 'Cabai vegetatif',
            'verified_purchase' => true,
            'moderation_status' => 'approved',
            'submitted_at' => now()->subDay(),
            'approved_at' => now(),
        ]);

        ProductReview::create([
            'customer_id' => $secondCustomer->id,
            'product_id' => $product->id,
            'order_id' => $orderId,
            'rating' => 1,
            'title' => 'Masih antre moderasi',
            'body' => 'Review ini belum boleh masuk agregat publik.',
            'usage_context' => 'Cabai vegetatif',
            'verified_purchase' => true,
            'moderation_status' => 'pending',
            'submitted_at' => now(),
        ]);

        $listResponse = $this->getJson('/api/v1/public/products');

        $listResponse
            ->assertOk()
            ->assertJsonPath('data.data.0.slug', $product->slug)
            ->assertJsonPath('data.data.0.review_summary.total_reviews', 1)
            ->assertJsonPath('data.data.0.review_summary.average_rating', 5);

        $detailResponse = $this->getJson(sprintf('/api/v1/public/products/%s', $product->slug));

        $detailResponse
            ->assertOk()
            ->assertJsonPath('data.slug', $product->slug)
            ->assertJsonPath('data.review_summary.total_reviews', 1)
            ->assertJsonPath('data.review_summary.average_rating', 5);
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
