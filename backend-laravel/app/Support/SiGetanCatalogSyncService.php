<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SiGetanCatalogSyncService
{
    public function syncCurrentCatalogSnapshot(): void
    {
        if (! $this->isReady()) {
            return;
        }

        try {
            $this->request()
                ->post('/api/v1/sync/upstream-catalog/ingest', $this->buildPayload())
                ->throw();
        } catch (Throwable $exception) {
            Log::warning('Gagal sinkron katalog Wiragro ke Si Getan.', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function buildPayload(): array
    {
        $categories = Category::query()
            ->orderBy('id')
            ->get()
            ->map(fn (Category $category): array => [
                'external_id' => (string) $category->id,
                'code' => Str::upper(Str::substr($category->slug ?: Str::slug($category->name), 0, 50)),
                'name' => $category->name,
                'slug' => $category->slug,
                'is_active' => (bool) $category->is_active,
            ])
            ->values()
            ->all();

        $products = Product::query()
            ->with(['category', 'images'])
            ->orderBy('id')
            ->get()
            ->map(fn (Product $product): array => [
                'external_id' => (string) $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_external_id' => $product->category_id ? (string) $product->category_id : null,
                'category_code' => $product->category
                    ? Str::upper(Str::substr($product->category->slug ?: Str::slug($product->category->name), 0, 50))
                    : null,
                'description' => $product->description,
                'unit' => $product->unit,
                'weight_grams' => (string) $product->weight_grams,
                'hpp' => '0',
                'default_selling_price' => (string) $product->current_price,
                'min_stock_default' => '0',
                'stock_qty' => (string) $product->stock_qty,
                'is_active' => (bool) $product->is_active,
                'images' => $product->images
                    ->sortBy('sort_order')
                    ->filter(fn (ProductImage $image): bool => filled($image->image_url))
                    ->map(fn (ProductImage $image): array => [
                        'file_url' => $image->image_url,
                        'sort_order' => (int) $image->sort_order,
                        'is_primary' => (bool) $image->is_primary,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        return [
            'snapshot_id' => 'wiragro-'.now()->utc()->format('YmdHisv'),
            'source_code' => (string) config('sigetan.source_code', 'WIRAGRO_WEB'),
            'source_name' => (string) config('sigetan.source_name', 'Wiragro Website'),
            'target_code' => (string) config('sigetan.target_code', 'WIRAGRO_WEB'),
            'replace_missing' => true,
            'sync_stock' => true,
            'categories' => $categories,
            'products' => $products,
        ];
    }

    private function isReady(): bool
    {
        return (bool) config('sigetan.catalog_sync_enabled')
            && filled(config('sigetan.base_url'))
            && filled(config('sigetan.catalog_api_key'));
    }

    private function request(): PendingRequest
    {
        $request = Http::baseUrl(rtrim((string) config('sigetan.base_url'), '/'))
            ->acceptJson()
            ->retry(2, 250)
            ->timeout((int) config('sigetan.timeout', 10))
            ->withHeaders([
                'X-Integration-Key' => (string) config('sigetan.catalog_api_key'),
            ]);

        if ($this->requiresNgrokBrowserWarningBypass((string) config('sigetan.base_url'))) {
            $request = $request->withHeaders([
                'ngrok-skip-browser-warning' => '1',
            ]);
        }

        return $request;
    }

    private function requiresNgrokBrowserWarningBypass(string $baseUrl): bool
    {
        $host = parse_url($baseUrl, PHP_URL_HOST);

        return is_string($host) && str_contains(Str::lower($host), 'ngrok-free');
    }
}
