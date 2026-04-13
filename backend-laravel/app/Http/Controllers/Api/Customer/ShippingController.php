<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CalculateShippingRatesRequest;
use App\Http\Requests\Customer\SearchShippingDestinationsRequest;
use App\Support\CustomerCommerceService;
use App\Support\RajaOngkirService;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function destinations(
        SearchShippingDestinationsRequest $request,
        RajaOngkirService $rajaOngkir
    ): JsonResponse {
        $data = $request->validated();

        return response()->json([
            'items' => $rajaOngkir->searchDestinations(
                $data['search'],
                (int) ($data['limit'] ?? 8),
                (int) ($data['offset'] ?? 0),
            ),
        ]);
    }

    public function rates(
        CalculateShippingRatesRequest $request,
        CustomerCommerceService $commerce,
    ): JsonResponse {
        $data = $request->validated();
        $cart = $commerce->getGuestCart($data['cart_id'], $data['guest_token']);

        return response()->json(
            $commerce->quoteGuestShippingRates(
                $cart,
                (string) $data['destination_id'],
                $data['courier'] ?? null,
            )
        );
    }
}
