<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateDuitkuPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'uuid'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'callback_url' => ['required', 'url'],
            'return_url' => ['required', 'url'],
        ];
    }
}
