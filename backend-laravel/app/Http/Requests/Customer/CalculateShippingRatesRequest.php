<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CalculateShippingRatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_id' => ['required', 'uuid'],
            'guest_token' => ['required', 'string', 'min:16', 'max:255'],
            'destination_id' => ['required', 'string', 'regex:/^\d+$/', 'max:30'],
            'courier' => ['nullable', 'string', 'max:30'],
        ];
    }
}
