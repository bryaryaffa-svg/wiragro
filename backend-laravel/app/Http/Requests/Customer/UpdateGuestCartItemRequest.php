<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuestCartItemRequest extends FormRequest
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
            'qty' => ['required', 'integer', 'min:0'],
        ];
    }
}
