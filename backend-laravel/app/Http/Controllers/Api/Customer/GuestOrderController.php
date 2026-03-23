<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\GuestOrderLookupRequest;
use App\Http\Requests\Customer\TrackGuestOrderRequest;
use App\Support\CustomerCommerceService;
use Illuminate\Http\JsonResponse;

class GuestOrderController extends Controller
{
    public function track(TrackGuestOrderRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $commerce->trackOrder((string) $data['order_number'], (string) $data['phone'])
        );
    }

    public function show(string $orderNumber, GuestOrderLookupRequest $request, CustomerCommerceService $commerce): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $commerce->showGuestOrder($orderNumber, (string) $data['phone'])
        );
    }
}
