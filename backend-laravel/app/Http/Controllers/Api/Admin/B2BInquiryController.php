<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\B2BInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class B2BInquiryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $inquiries = B2BInquiry::query()
            ->with('customer:id,full_name,phone,email')
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status'))
            )
            ->when(
                $request->filled('buyer_type'),
                fn ($query) => $query->where('buyer_type', $request->string('buyer_type'))
            )
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->success('Daftar inquiry B2B admin.', $inquiries);
    }

    public function update(B2BInquiry $inquiry, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['new', 'contacted', 'quoted', 'won', 'closed'])],
            'quote_items' => ['nullable', 'array', 'max:20'],
            'quote_items.*.label' => ['required_with:quote_items', 'string', 'max:160'],
            'quote_items.*.qty' => ['nullable', 'string', 'max:40'],
            'quote_items.*.unit' => ['nullable', 'string', 'max:40'],
            'quote_items.*.notes' => ['nullable', 'string', 'max:300'],
            'quote_items.*.unit_estimate_amount' => ['nullable', 'numeric', 'min:0'],
            'quote_items.*.line_estimate_amount' => ['nullable', 'numeric', 'min:0'],
            'estimate_subtotal' => ['nullable', 'numeric', 'min:0'],
            'estimate_shipping' => ['nullable', 'numeric', 'min:0'],
            'estimate_total' => ['nullable', 'numeric', 'min:0'],
            'sales_note' => ['nullable', 'string', 'max:2000'],
            'internal_note' => ['nullable', 'string', 'max:2000'],
        ]);
        $quoteItems = collect($data['quote_items'] ?? [])
            ->map(fn (array $item): array => [
                'label' => trim((string) ($item['label'] ?? '')),
                'qty' => $this->normalizeNullableString($item['qty'] ?? null),
                'unit' => $this->normalizeNullableString($item['unit'] ?? null),
                'notes' => $this->normalizeNullableString($item['notes'] ?? null),
                'unit_estimate_amount' => isset($item['unit_estimate_amount'])
                    ? number_format((float) $item['unit_estimate_amount'], 2, '.', '')
                    : null,
                'line_estimate_amount' => isset($item['line_estimate_amount'])
                    ? number_format((float) $item['line_estimate_amount'], 2, '.', '')
                    : null,
            ])
            ->filter(fn (array $item): bool => $item['label'] !== '')
            ->values()
            ->all();

        $inquiry->forceFill([
            'status' => $data['status'],
            'quote_items' => $quoteItems !== [] ? $quoteItems : null,
            'estimate_subtotal' => $data['estimate_subtotal'] ?? null,
            'estimate_shipping' => $data['estimate_shipping'] ?? null,
            'estimate_total' => $data['estimate_total'] ?? null,
            'sales_note' => isset($data['sales_note']) ? trim((string) $data['sales_note']) : null,
            'internal_note' => isset($data['internal_note']) ? trim((string) $data['internal_note']) : null,
            'contacted_at' => in_array($data['status'], ['contacted', 'quoted', 'won', 'closed'], true)
                ? ($inquiry->contacted_at ?? now())
                : null,
            'quoted_at' => in_array($data['status'], ['quoted', 'won'], true)
                ? ($inquiry->quoted_at ?? now())
                : null,
        ])->save();

        return $this->success(
            'Status inquiry B2B berhasil diperbarui.',
            $inquiry->fresh('customer:id,full_name,phone,email')
        );
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }
}
