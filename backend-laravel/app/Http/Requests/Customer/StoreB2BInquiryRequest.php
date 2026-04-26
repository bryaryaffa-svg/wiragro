<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreB2BInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_code' => ['nullable', 'string', 'max:50'],
            'buyer_type' => ['required', 'string', Rule::in(['kebun', 'reseller', 'proyek', 'rutin'])],
            'business_name' => ['nullable', 'string', 'max:160'],
            'contact_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'commodity_focus' => ['nullable', 'string', 'max:120'],
            'commodity_slug' => ['nullable', 'string', 'max:120'],
            'bundle_slug' => ['nullable', 'string', 'max:120'],
            'campaign_slug' => ['nullable', 'string', 'max:120'],
            'product_slug' => ['nullable', 'string', 'max:120'],
            'product_name' => ['nullable', 'string', 'max:200'],
            'monthly_volume' => ['nullable', 'string', 'max:120'],
            'fulfillment_type' => ['nullable', 'string', Rule::in(['pickup', 'delivery', 'mixed'])],
            'preferred_follow_up' => ['required', 'string', Rule::in(['whatsapp', 'phone', 'email'])],
            'budget_hint' => ['nullable', 'string', 'max:120'],
            'need_summary' => ['required', 'string', 'min:24', 'max:3000'],
            'requested_items' => ['required', 'array', 'min:1', 'max:12'],
            'requested_items.*.label' => ['required', 'string', 'max:160'],
            'requested_items.*.qty' => ['nullable', 'string', 'max:40'],
            'requested_items.*.unit' => ['nullable', 'string', 'max:40'],
            'requested_items.*.notes' => ['nullable', 'string', 'max:300'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'source_page' => ['nullable', 'string', 'max:255'],
        ];
    }
}
