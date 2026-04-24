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
            'internal_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $inquiry->forceFill([
            'status' => $data['status'],
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
}
