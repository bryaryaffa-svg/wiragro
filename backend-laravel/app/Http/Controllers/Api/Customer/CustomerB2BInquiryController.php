<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Customer\StoreB2BInquiryRequest;
use App\Models\B2BInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CustomerB2BInquiryController extends ApiController
{
    public function store(StoreB2BInquiryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $inquiry = B2BInquiry::query()->create([
            'customer_id' => null,
            'store_code' => $this->normalizeNullableString($data['store_code'] ?? null),
            'buyer_type' => $data['buyer_type'],
            'business_name' => $this->normalizeNullableString($data['business_name'] ?? null),
            'contact_name' => trim((string) $data['contact_name']),
            'phone' => $this->normalizePhone((string) $data['phone']),
            'email' => isset($data['email']) ? Str::lower(trim((string) $data['email'])) : null,
            'commodity_focus' => $this->normalizeNullableString($data['commodity_focus'] ?? null),
            'bundle_slug' => $this->normalizeNullableString($data['bundle_slug'] ?? null),
            'campaign_slug' => $this->normalizeNullableString($data['campaign_slug'] ?? null),
            'monthly_volume' => $this->normalizeNullableString($data['monthly_volume'] ?? null),
            'fulfillment_type' => $this->normalizeNullableString($data['fulfillment_type'] ?? null),
            'preferred_follow_up' => $data['preferred_follow_up'],
            'budget_hint' => $this->normalizeNullableString($data['budget_hint'] ?? null),
            'need_summary' => trim((string) $data['need_summary']),
            'notes' => $this->normalizeNullableString($data['notes'] ?? null),
            'source_page' => $this->normalizeNullableString($data['source_page'] ?? null),
            'status' => 'new',
        ]);

        return $this->success('Inquiry B2B berhasil dikirim.', [
            'id' => (string) $inquiry->id,
            'status' => $inquiry->status,
            'preferred_follow_up' => $inquiry->preferred_follow_up,
        ], 201);
    }

    private function normalizeNullableString(?string $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return $phone;
        }

        if (Str::startsWith($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (! Str::startsWith($digits, '62')) {
            $digits = '62'.$digits;
        }

        return '+'.$digits;
    }
}
