<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\GuestCheckoutRequest;
use App\Support\CustomerCommerceService;
use Illuminate\Http\JsonResponse;

class GuestCheckoutController extends Controller
{
    public function store(GuestCheckoutRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();
        $cart = $commerce->getGuestCart($data['cart_id'], $data['guest_token']);

        return response()->json($commerce->checkoutGuest($cart, $data));
    }
}
