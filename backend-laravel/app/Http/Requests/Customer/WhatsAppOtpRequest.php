<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class WhatsAppOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_code' => ['nullable', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:30'],
        ];
    }
}
