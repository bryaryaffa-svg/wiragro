<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuestCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $shippingMethod = (string) $this->input('shipping_method', 'delivery');
        $deliverySelected = $shippingMethod === 'delivery';

        return [
            'cart_id' => ['required', 'uuid'],
            'guest_token' => ['required', 'string', 'min:16', 'max:255'],
            'customer.full_name' => ['required', 'string', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:30'],
            'customer.email' => ['nullable', 'email', 'max:255'],
            'shipping_method' => ['required', Rule::in(config('storefront.allowed_shipping_methods', ['delivery', 'pickup']))],
            'pickup_store_code' => [
                Rule::requiredIf($shippingMethod === 'pickup'),
                'nullable',
                'string',
                'max:50',
            ],
            'address' => [Rule::requiredIf($deliverySelected), 'nullable', 'array'],
            'address.recipient_name' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:255'],
            'address.recipient_phone' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:30'],
            'address.address_line' => [Rule::requiredIf($deliverySelected), 'nullable', 'string'],
            'address.district' => ['nullable', 'string', 'max:255'],
            'address.city' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:255'],
            'address.province' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:255'],
            'address.postal_code' => ['nullable', 'string', 'max:20'],
            'shipping' => [Rule::requiredIf($deliverySelected), 'nullable', 'array'],
            'shipping.destination_id' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'regex:/^\\d+$/', 'max:30'],
            'shipping.destination_label' => ['nullable', 'string', 'max:255'],
            'shipping.province_name' => ['nullable', 'string', 'max:255'],
            'shipping.city_name' => ['nullable', 'string', 'max:255'],
            'shipping.district_name' => ['nullable', 'string', 'max:255'],
            'shipping.subdistrict_name' => ['nullable', 'string', 'max:255'],
            'shipping.zip_code' => ['nullable', 'string', 'max:20'],
            'shipping.courier_code' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:30'],
            'shipping.courier_name' => ['nullable', 'string', 'max:255'],
            'shipping.service_code' => [Rule::requiredIf($deliverySelected), 'nullable', 'string', 'max:60'],
            'shipping.service_name' => ['nullable', 'string', 'max:255'],
            'shipping.description' => ['nullable', 'string', 'max:255'],
            'shipping.cost' => [Rule::requiredIf($deliverySelected), 'nullable', 'numeric', 'min:0'],
            'shipping.etd' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', Rule::in(config('storefront.allowed_payment_methods', ['duitku-va', 'COD']))],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
