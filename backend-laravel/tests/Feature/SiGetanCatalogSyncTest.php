<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Support\SiGetanCatalogSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SiGetanCatalogSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'sigetan.catalog_sync_enabled' => true,
            'sigetan.base_url' => 'https://sigetan.test',
            'sigetan.catalog_api_key' => 'test-sigetan-key',
            'sigetan.source_code' => 'WIRAGRO_WEB',
            'sigetan.source_name' => 'Wiragro Website',
            'sigetan.target_code' => 'WIRAGRO_WEB',
        ]);
    }

    public function test_it_pushes_catalog_snapshots_to_si_getan_when_catalog_changes(): void
    {
        Http::fake([
            'https://sigetan.test/*' => Http::response(['status' => 'ok'], 200),
        ]);

        $category = Category::create([
            'name' => 'Pupuk',
            'slug' => 'pupuk',
            'description' => 'Kategori pupuk',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'sku' => 'WG-001',
            'name' => 'Pupuk Organik',
            'slug' => 'pupuk-organik',
            'description' => 'Produk live Wiragro',
            'unit' => 'sak',
            'weight_grams' => 25000,
            'price' => 125000,
            'promo_price' => null,
            'reseller_price' => null,
            'stock_qty' => 7,
            'is_active' => true,
        ]);

        $product->delete();

        Http::assertSent(function ($request) use ($category) {
            return $request->url() === 'https://sigetan.test/api/v1/sync/upstream-catalog/ingest'
                && $request->hasHeader('X-Integration-Key', 'test-sigetan-key')
                && $request['source_code'] === 'WIRAGRO_WEB'
                && count($request['categories'] ?? []) >= 1
                && ($request['categories'][0]['external_id'] ?? null) === (string) $category->id;
        });

        Http::assertSent(function ($request) {
            return $request->url() === 'https://sigetan.test/api/v1/sync/upstream-catalog/ingest'
                && count($request['products'] ?? []) === 1
                && ($request['products'][0]['sku'] ?? null) === 'WG-001'
                && ($request['products'][0]['stock_qty'] ?? null) === '7';
        });

        Http::assertSent(function ($request) {
            return $request->url() === 'https://sigetan.test/api/v1/sync/upstream-catalog/ingest'
                && ($request['replace_missing'] ?? false) === true
                && count($request['products'] ?? []) === 0;
        });
    }

    public function test_it_adds_ngrok_bypass_header_for_free_ngrok_urls(): void
    {
        config([
            'sigetan.base_url' => 'https://demo.ngrok-free.dev',
        ]);

        Http::fake([
            'https://demo.ngrok-free.dev/*' => Http::response(['status' => 'ok'], 200),
        ]);

        app(SiGetanCatalogSyncService::class)->syncCurrentCatalogSnapshot();

        Http::assertSent(function ($request) {
            return $request->url() === 'https://demo.ngrok-free.dev/api/v1/sync/upstream-catalog/ingest'
                && $request->hasHeader('ngrok-skip-browser-warning', '1')
                && $request->hasHeader('X-Integration-Key', 'test-sigetan-key');
        });
    }
}
