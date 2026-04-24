<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\WishlistAddRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Support\AndroidCompatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CustomerWishlistController extends Controller
{
    public function index(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $items = WishlistItem::query()
            ->with(['product.category', 'product.images'])
            ->where('customer_id', $customer->id)
            ->latest()
            ->get()
            ->filter(fn (WishlistItem $item): bool => $item->product !== null)
            ->map(fn (WishlistItem $item): array => $compat->serializeWishlistItem($item, $customer))
            ->values()
            ->all();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function store(WishlistAddRequest $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validated();
        $product = Product::query()->whereKey($data['product_id'])->where('is_active', true)->first();

        if (! $product) {
            throw new NotFoundHttpException('Produk tidak ditemukan.');
        }

        WishlistItem::query()->firstOrCreate([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'status' => 'saved',
            'product_id' => (string) $product->id,
        ]);
    }

    public function destroy(string $productId, Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $row = WishlistItem::query()
            ->where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->first();

        if (! $row) {
            throw new NotFoundHttpException('Wishlist item tidak ditemukan.');
        }

        $row->delete();

        return response()->json([
            'status' => 'removed',
            'product_id' => (string) $productId,
        ]);
    }
}
