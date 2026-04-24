<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Support\AndroidCompatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerCompatController extends Controller
{
    public function me(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return response()->json($compat->serializeCustomerAccount($customer));
    }

    public function updateMe(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30', Rule::unique('customers', 'phone')->ignore($customer->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customer->id)],
        ]);

        $customer->forceFill([
            'full_name' => trim((string) $data['full_name']),
            'phone' => $compat->normalizePhone($data['phone'] ?? null),
            'email' => isset($data['email']) ? strtolower((string) $data['email']) : null,
        ])->save();

        return response()->json($compat->serializeCustomerAccount($customer->fresh()));
    }

    public function listAddresses(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $items = $customer->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CustomerAddress $address): array => $compat->serializeAddress($address))
            ->values()
            ->all();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function createAddress(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $this->validateAddressPayload($request);
        $hadAddresses = $customer->addresses()->exists();

        $address = DB::transaction(function () use ($compat, $customer, $data, $hadAddresses): CustomerAddress {
            $address = CustomerAddress::query()->create([
                'customer_id' => $customer->id,
                'label' => trim((string) $data['label']),
                'recipient_name' => trim((string) $data['recipient_name']),
                'recipient_phone' => $compat->normalizePhone((string) $data['recipient_phone']),
                'address_line' => trim((string) $data['address_line']),
                'district' => isset($data['district']) ? trim((string) $data['district']) : null,
                'city' => trim((string) $data['city']),
                'province' => trim((string) $data['province']),
                'postal_code' => isset($data['postal_code']) ? trim((string) $data['postal_code']) : null,
                'notes' => isset($data['notes']) ? trim((string) $data['notes']) : null,
                'is_default' => false,
            ]);

            $this->syncDefaultAddress(
                $customer,
                (! $hadAddresses || (bool) $data['is_default']) ? $address : null
            );

            return $address->fresh();
        });

        return response()->json([
            'status' => 'saved',
            'address' => $compat->serializeAddress($address),
        ]);
    }

    public function updateAddress(string $addressId, Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $this->validateAddressPayload($request);
        $address = $compat->findCustomerAddress($customer, $addressId);

        $address = DB::transaction(function () use ($compat, $customer, $data, $address): CustomerAddress {
            $address->forceFill([
                'label' => trim((string) $data['label']),
                'recipient_name' => trim((string) $data['recipient_name']),
                'recipient_phone' => $compat->normalizePhone((string) $data['recipient_phone']),
                'address_line' => trim((string) $data['address_line']),
                'district' => isset($data['district']) ? trim((string) $data['district']) : null,
                'city' => trim((string) $data['city']),
                'province' => trim((string) $data['province']),
                'postal_code' => isset($data['postal_code']) ? trim((string) $data['postal_code']) : null,
                'notes' => isset($data['notes']) ? trim((string) $data['notes']) : null,
            ])->save();

            $this->syncDefaultAddress(
                $customer,
                (bool) $data['is_default'] ? $address : null
            );

            return $address->fresh();
        });

        return response()->json([
            'status' => 'saved',
            'address' => $compat->serializeAddress($address),
        ]);
    }

    public function deleteAddress(string $addressId, Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $address = $compat->findCustomerAddress($customer, $addressId);

        DB::transaction(function () use ($customer, $address): void {
            $address->delete();
            $this->syncDefaultAddress($customer);
        });

        return response()->json([
            'status' => 'removed',
            'address_id' => $addressId,
        ]);
    }

    public function cart(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return response()->json($compat->serializeCustomerCart($customer));
    }

    public function addCartItem(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'product_id' => ['required', 'string'],
            'qty' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json(
            $compat->addCustomerCartItem(
                $customer,
                (string) $data['product_id'],
                (int) $data['qty'],
            )
        );
    }

    public function updateCartItem(string $itemId, Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'qty' => ['required', 'integer', 'min:0'],
        ]);

        return response()->json(
            $compat->updateCustomerCartItem(
                $customer,
                $itemId,
                (int) $data['qty'],
            )
        );
    }

    public function checkout(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'shipping_method' => ['required', 'string', 'max:30'],
            'pickup_store_code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'array'],
            'address.recipient_name' => ['nullable', 'string', 'max:120'],
            'address.recipient_phone' => ['nullable', 'string', 'max:30'],
            'address.address_line' => ['nullable', 'string', 'max:500'],
            'address.district' => ['nullable', 'string', 'max:120'],
            'address.city' => ['nullable', 'string', 'max:120'],
            'address.province' => ['nullable', 'string', 'max:120'],
            'address.postal_code' => ['nullable', 'string', 'max:20'],
            'address.notes' => ['nullable', 'string', 'max:500'],
            'shipping' => ['nullable', 'array'],
            'shipping.destination_id' => ['nullable', 'string', 'regex:/^\d+$/', 'max:30'],
            'shipping.destination_label' => ['nullable', 'string', 'max:255'],
            'shipping.province_name' => ['nullable', 'string', 'max:255'],
            'shipping.city_name' => ['nullable', 'string', 'max:255'],
            'shipping.district_name' => ['nullable', 'string', 'max:255'],
            'shipping.subdistrict_name' => ['nullable', 'string', 'max:255'],
            'shipping.zip_code' => ['nullable', 'string', 'max:20'],
            'shipping.courier_code' => ['nullable', 'string', 'max:30'],
            'shipping.courier_name' => ['nullable', 'string', 'max:255'],
            'shipping.service_code' => ['nullable', 'string', 'max:60'],
            'shipping.service_name' => ['nullable', 'string', 'max:255'],
            'shipping.description' => ['nullable', 'string', 'max:255'],
            'shipping.cost' => ['nullable', 'numeric', 'min:0'],
            'shipping.etd' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        return response()->json($compat->checkoutCustomer($customer, $data));
    }

    public function orders(Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        return response()->json(
            $compat->listCustomerOrders($customer, (int) ($data['limit'] ?? 20))
        );
    }

    public function orderDetail(string $orderId, Request $request, AndroidCompatService $compat): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return response()->json($compat->customerOrderDetail($customer, $orderId));
    }

    private function validateAddressPayload(Request $request): array
    {
        return $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'recipient_name' => ['required', 'string', 'max:120'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:500'],
            'district' => ['nullable', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['required', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_default' => ['required', 'boolean'],
        ]);
    }

    private function syncDefaultAddress(Customer $customer, ?CustomerAddress $preferred = null): void
    {
        $addresses = CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->orderByDesc('is_default')
            ->orderBy('created_at')
            ->get(['id', 'is_default']);

        if ($addresses->isEmpty()) {
            return;
        }

        $defaultId = $preferred?->id
            ?? optional($addresses->firstWhere('is_default', true))->id
            ?? $addresses->first()->id;

        CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->update(['is_default' => false]);

        CustomerAddress::query()
            ->whereKey($defaultId)
            ->update(['is_default' => true]);
    }
}
