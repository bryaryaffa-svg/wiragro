<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Customer\StoreB2BInquiryRequest;
use App\Models\B2BInquiry;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CustomerB2BInquiryController extends ApiController
{
    public function store(StoreB2BInquiryRequest $request): JsonResponse
    {
        return $this->storeInquiry($request, null);
    }

    public function storeForCurrentCustomer(StoreB2BInquiryRequest $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return $this->storeInquiry($request, $customer);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $items = $this->customerInquiryQuery($customer)
            ->latest('created_at')
            ->get()
            ->map(fn (B2BInquiry $inquiry): array => $this->serializeInquiry($inquiry))
            ->values()
            ->all();

        return $this->success('Daftar inquiry dan quote customer.', [
            'items' => $items,
        ]);
    }

    public function show(string $inquiryId, Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $inquiry = $this->customerInquiryQuery($customer)
            ->whereKey($inquiryId)
            ->first();

        if (! $inquiry) {
            throw new NotFoundHttpException('Inquiry B2B tidak ditemukan.');
        }

        return $this->success('Detail inquiry dan quote customer.', $this->serializeInquiry($inquiry));
    }

    private function storeInquiry(StoreB2BInquiryRequest $request, ?Customer $customer): JsonResponse
    {
        $data = $request->validated();

        $customerPhone = $customer?->phone ? $this->normalizePhone($customer->phone) : null;
        $payloadPhone = $this->normalizePhone((string) $data['phone']);
        $customerEmail = $this->normalizeEmail($customer?->email);
        $payloadEmail = $this->normalizeEmail($data['email'] ?? null);

        $inquiry = B2BInquiry::query()->create([
            'customer_id' => $customer?->id,
            'store_code' => $this->normalizeNullableString($data['store_code'] ?? null),
            'buyer_type' => $data['buyer_type'],
            'business_name' => $this->normalizeNullableString($data['business_name'] ?? null),
            'contact_name' => trim((string) ($customer?->full_name ?: $data['contact_name'])),
            'phone' => $customerPhone ?? $payloadPhone ?? trim((string) $data['phone']),
            'email' => $customerEmail ?? $payloadEmail,
            'commodity_focus' => $this->normalizeNullableString($data['commodity_focus'] ?? null),
            'commodity_slug' => $this->normalizeNullableString($data['commodity_slug'] ?? null),
            'bundle_slug' => $this->normalizeNullableString($data['bundle_slug'] ?? null),
            'campaign_slug' => $this->normalizeNullableString($data['campaign_slug'] ?? null),
            'product_slug' => $this->normalizeNullableString($data['product_slug'] ?? null),
            'product_name' => $this->normalizeNullableString($data['product_name'] ?? null),
            'monthly_volume' => $this->normalizeNullableString($data['monthly_volume'] ?? null),
            'fulfillment_type' => $this->normalizeNullableString($data['fulfillment_type'] ?? null),
            'preferred_follow_up' => $data['preferred_follow_up'],
            'budget_hint' => $this->normalizeNullableString($data['budget_hint'] ?? null),
            'need_summary' => trim((string) $data['need_summary']),
            'requested_items' => $this->normalizeRequestedItems($data['requested_items'] ?? []),
            'notes' => $this->normalizeNullableString($data['notes'] ?? null),
            'source_page' => $this->normalizeNullableString($data['source_page'] ?? null),
            'status' => 'new',
        ]);

        return $this->success('Inquiry B2B berhasil dikirim.', [
            'id' => (string) $inquiry->id,
            'inquiry_number' => $this->displayInquiryNumber($inquiry),
            'status' => $inquiry->status,
            'status_label' => $this->statusMeta($inquiry->status)['label'],
            'preferred_follow_up' => $inquiry->preferred_follow_up,
        ], 201);
    }

    private function customerInquiryQuery(Customer $customer): Builder
    {
        $normalizedPhone = $customer->phone ? $this->normalizePhone($customer->phone) : null;
        $normalizedEmail = $this->normalizeEmail($customer->email);

        return B2BInquiry::query()
            ->where(function (Builder $query) use ($customer, $normalizedPhone, $normalizedEmail): void {
                $query->where('customer_id', $customer->id);

                if ($normalizedPhone || $normalizedEmail) {
                    $query->orWhere(function (Builder $guestQuery) use ($normalizedPhone, $normalizedEmail): void {
                        $guestQuery->whereNull('customer_id')
                            ->where(function (Builder $matchQuery) use ($normalizedPhone, $normalizedEmail): void {
                                if ($normalizedPhone) {
                                    $matchQuery->where('phone', $normalizedPhone);
                                }

                                if ($normalizedEmail) {
                                    $method = $normalizedPhone ? 'orWhere' : 'where';
                                    $matchQuery->{$method}('email', $normalizedEmail);
                                }
                            });
                    });
                }
            });
    }

    private function serializeInquiry(B2BInquiry $inquiry): array
    {
        $statusMeta = $this->statusMeta($inquiry->status);
        $requestedItems = collect($inquiry->requested_items ?? [])
            ->map(fn (array $item): array => [
                'label' => trim((string) ($item['label'] ?? '')),
                'qty' => $this->normalizeNullableString($item['qty'] ?? null),
                'unit' => $this->normalizeNullableString($item['unit'] ?? null),
                'notes' => $this->normalizeNullableString($item['notes'] ?? null),
            ])
            ->filter(fn (array $item): bool => $item['label'] !== '')
            ->values();

        $quoteItems = collect($inquiry->quote_items ?? [])
            ->map(fn (array $item): array => [
                'label' => trim((string) ($item['label'] ?? '')),
                'qty' => $this->normalizeNullableString($item['qty'] ?? null),
                'unit' => $this->normalizeNullableString($item['unit'] ?? null),
                'notes' => $this->normalizeNullableString($item['notes'] ?? null),
                'unit_estimate_amount' => $this->formatAmount($item['unit_estimate_amount'] ?? null),
                'line_estimate_amount' => $this->formatAmount($item['line_estimate_amount'] ?? null),
            ])
            ->filter(fn (array $item): bool => $item['label'] !== '')
            ->values();

        $hasEstimate = $quoteItems->isNotEmpty()
            || $inquiry->estimate_subtotal !== null
            || $inquiry->estimate_shipping !== null
            || $inquiry->estimate_total !== null
            || $inquiry->sales_note !== null;

        return [
            'id' => (string) $inquiry->id,
            'inquiry_number' => $this->displayInquiryNumber($inquiry),
            'status' => $inquiry->status,
            'status_label' => $statusMeta['label'],
            'status_description' => $statusMeta['description'],
            'buyer_type' => $inquiry->buyer_type,
            'buyer_type_label' => $this->buyerTypeLabel($inquiry->buyer_type),
            'business_name' => $inquiry->business_name,
            'contact_name' => $inquiry->contact_name,
            'phone' => $inquiry->phone,
            'email' => $inquiry->email,
            'commodity_focus' => $inquiry->commodity_focus,
            'commodity_slug' => $inquiry->commodity_slug,
            'bundle_slug' => $inquiry->bundle_slug,
            'campaign_slug' => $inquiry->campaign_slug,
            'product_slug' => $inquiry->product_slug,
            'product_name' => $inquiry->product_name,
            'monthly_volume' => $inquiry->monthly_volume,
            'fulfillment_type' => $inquiry->fulfillment_type,
            'preferred_follow_up' => $inquiry->preferred_follow_up,
            'budget_hint' => $inquiry->budget_hint,
            'need_summary' => $inquiry->need_summary,
            'notes' => $inquiry->notes,
            'source_page' => $inquiry->source_page,
            'requested_items' => $requestedItems->all(),
            'quote' => [
                'has_estimate' => $hasEstimate,
                'items' => $quoteItems->all(),
                'subtotal_amount' => $this->formatAmount($inquiry->estimate_subtotal),
                'shipping_amount' => $this->formatAmount($inquiry->estimate_shipping),
                'total_amount' => $this->formatAmount($inquiry->estimate_total),
                'sales_note' => $inquiry->sales_note,
                'quoted_at' => optional($inquiry->quoted_at)?->toIso8601String(),
            ],
            'contacted_at' => optional($inquiry->contacted_at)?->toIso8601String(),
            'quoted_at' => optional($inquiry->quoted_at)?->toIso8601String(),
            'created_at' => optional($inquiry->created_at)?->toIso8601String(),
            'updated_at' => optional($inquiry->updated_at)?->toIso8601String(),
        ];
    }

    private function normalizeRequestedItems(array $items): array
    {
        return collect($items)
            ->map(fn (mixed $item): array => [
                'label' => trim((string) data_get($item, 'label', '')),
                'qty' => $this->normalizeNullableString(data_get($item, 'qty')),
                'unit' => $this->normalizeNullableString(data_get($item, 'unit')),
                'notes' => $this->normalizeNullableString(data_get($item, 'notes')),
            ])
            ->filter(fn (array $item): bool => $item['label'] !== '')
            ->values()
            ->all();
    }

    private function statusMeta(string $status): array
    {
        return match ($status) {
            'contacted' => [
                'label' => 'Sedang ditindak sales',
                'description' => 'Tim sales sudah mulai follow-up kebutuhan Anda.',
            ],
            'quoted' => [
                'label' => 'Estimasi sudah disiapkan',
                'description' => 'Quote ringan sudah masuk dan siap Anda tinjau.',
            ],
            'won' => [
                'label' => 'Deal berjalan',
                'description' => 'Inquiry ini sudah masuk tahap closing atau proses transaksi lanjutan.',
            ],
            'closed' => [
                'label' => 'Inquiry ditutup',
                'description' => 'Inquiry ditutup atau perlu dibuat ulang bila kebutuhannya berubah.',
            ],
            default => [
                'label' => 'Menunggu ditinjau',
                'description' => 'Inquiry baru masuk dan belum diproses sales.',
            ],
        };
    }

    private function buyerTypeLabel(?string $buyerType): string
    {
        return match ($buyerType) {
            'reseller' => 'Reseller / kios',
            'proyek' => 'Proyek',
            'rutin' => 'Kebutuhan rutin',
            default => 'Kebun / lahan',
        };
    }

    private function displayInquiryNumber(B2BInquiry $inquiry): string
    {
        return $inquiry->inquiry_number ?: 'WRG-B2B-'.Str::upper(substr((string) $inquiry->id, 0, 8));
    }

    private function formatAmount(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_string($value) && ! is_numeric($value)) {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeEmail(?string $email): ?string
    {
        $normalized = $this->normalizeNullableString($email);

        return $normalized ? Str::lower($normalized) : null;
    }

    private function normalizePhone(?string $phone): ?string
    {
        $normalized = $this->normalizeNullableString($phone);

        if (! $normalized) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $normalized) ?? '';

        if ($digits === '') {
            return $normalized;
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
