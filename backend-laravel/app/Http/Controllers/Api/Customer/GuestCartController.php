<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddGuestCartItemRequest;
use App\Http\Requests\Customer\CreateGuestCartRequest;
use App\Http\Requests\Customer\CurrentGuestCartRequest;
use App\Http\Requests\Customer\UpdateGuestCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Support\CustomerCommerceService;
use Illuminate\Http\JsonResponse;

class GuestCartController extends Controller
{
    public function create(CreateGuestCartRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();
        $cart = $commerce->createGuestCart(
            $data['store_code'] ?? config('storefront.default_store_code', 'SIDO-JATIM-ONLINE')
        );

        return response()->json([
            'cart_id' => $cart->id,
            'guest_token' => $cart->guest_token,
        ], 201);
    }

    public function current(CurrentGuestCartRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();
        $cart = $commerce->getGuestCart($data['cart_id'], $data['guest_token']);

        return response()->json($commerce->serializeCart($cart));
    }

    public function addItem(AddGuestCartItemRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();
        $cart = $commerce->getGuestCart($data['cart_id'], $data['guest_token']);
        $product = Product::query()->findOrFail($data['product_id']);
        $updatedCart = $commerce->addGuestCartItem($cart, $product, $data['qty']);

        return response()->json($commerce->serializeCart($updatedCart));
    }

    public function updateItem(
        CartItem $item,
        UpdateGuestCartItemRequest $request,
        CustomerCommerceService $commerce
    ): JsonResponse {
        $data = $request->validated();
        $cart = $commerce->getGuestCart($data['cart_id'], $data['guest_token']);
        $updatedCart = $commerce->updateGuestCartItem($cart, $item, $data['qty']);

        return response()->json($commerce->serializeCart($updatedCart));
    }
}
