<?php

namespace App\Http\Controllers\Api\PublicApi;

use App\Http\Controllers\Api\ApiController;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category', 'images'])
            ->where('is_active', true)
            ->latest('created_at')
            ->latest('id')
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%')
            )
            ->when(
                $request->filled('category_id'),
                fn ($query) => $query->where('category_id', $request->integer('category_id'))
            )
            ->paginate($request->integer('per_page', 20));

        return $this->success('Daftar produk publik.', $products);
    }

    public function show(Product $product): JsonResponse
    {
        abort_unless($product->is_active, 404);

        return $this->success('Detail produk publik.', $product->load(['category', 'images']));
    }
}
