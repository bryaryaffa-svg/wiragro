<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Requests\Product\UploadProductImageRequest;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category', 'images'])
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%')
            )
            ->when(
                $request->filled('category_id'),
                fn ($query) => $query->where('category_id', $request->integer('category_id'))
            )
            ->latest()
            ->paginate(20);

        return $this->success('Daftar produk admin.', $products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        $product = Product::create($data);

        return $this->success('Produk berhasil dibuat.', $product->load(['category', 'images']), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success('Detail produk.', $product->load(['category', 'images']));
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);

        $product->update($data);

        return $this->success('Produk berhasil diperbarui.', $product->fresh()->load(['category', 'images']));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->success('Produk berhasil dihapus.');
    }

    public function uploadImage(UploadProductImageRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $path = $request->file('image')->store('products', 'public');

        if (! empty($data['is_primary'])) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $path,
            'alt_text' => $data['alt_text'] ?? null,
            'sort_order' => (int) $product->images()->max('sort_order') + 1,
            'is_primary' => $data['is_primary'] ?? false,
        ]);

        return $this->success('Gambar produk berhasil diunggah.', $image, 201);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
