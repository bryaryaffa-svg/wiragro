<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateDuitkuPaymentRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Support\CustomerPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CustomerPaymentController extends Controller
{
    public function create(CreateDuitkuPaymentRequest $request, CustomerPaymentService $payments): JsonResponse
    {
        $data = $request->validated();
        $order = Order::query()->find($data['order_id']);

        if (! $order) {
            throw new NotFoundHttpException('Order tidak ditemukan.');
        }

        return response()->json(
            $payments->createDuitkuPayment(
                $order,
                (string) $data['callback_url'],
                (string) $data['return_url'],
                null,
                isset($data['customer_phone']) ? (string) $data['customer_phone'] : null,
            )
        );
    }

    public function createForCurrentCustomer(
        CreateDuitkuPaymentRequest $request,
        CustomerPaymentService $payments
    ): JsonResponse {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validated();
        $order = Order::query()->find($data['order_id']);

        if (! $order) {
            throw new NotFoundHttpException('Order tidak ditemukan.');
        }

        return response()->json(
            $payments->createDuitkuPayment(
                $order,
                (string) $data['callback_url'],
                (string) $data['return_url'],
                $customer,
            )
        );
    }

    public function callback(Request $request, CustomerPaymentService $payments): JsonResponse
    {
        return response()->json($payments->applyDuitkuCallback($request->all()));
    }
}
