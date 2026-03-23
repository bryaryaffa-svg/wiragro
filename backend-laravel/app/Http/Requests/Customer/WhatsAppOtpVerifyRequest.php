<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class WhatsAppOtpVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_code' => ['nullable', 'string', 'max:50'],
            'challenge_id' => ['required', 'uuid'],
            'otp_code' => ['required', 'string', 'max:12'],
        ];
    }
}
