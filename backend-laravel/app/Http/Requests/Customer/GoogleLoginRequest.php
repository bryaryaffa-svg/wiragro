<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class GoogleLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_code' => ['nullable', 'string', 'max:50'],
            'id_token' => ['required', 'string'],
        ];
    }
}
