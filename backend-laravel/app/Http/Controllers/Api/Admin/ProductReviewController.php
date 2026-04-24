<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductReviewController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $reviews = ProductReview::query()
            ->with(['product:id,name,slug', 'customer:id,full_name,phone,email'])
            ->when(
                $request->filled('moderation_status'),
                fn ($query) => $query->where('moderation_status', $request->string('moderation_status'))
            )
            ->when(
                $request->filled('product_id'),
                fn ($query) => $query->where('product_id', $request->integer('product_id'))
            )
            ->latest('submitted_at')
            ->latest('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success('Daftar review produk admin.', $reviews);
    }

    public function update(ProductReview $review, Request $request): JsonResponse
    {
        $data = $request->validate([
            'moderation_status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected', 'hidden'])],
            'moderation_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $review->forceFill([
            'moderation_status' => $data['moderation_status'],
            'moderation_note' => isset($data['moderation_note']) ? trim((string) $data['moderation_note']) : null,
            'approved_at' => $data['moderation_status'] === 'approved' ? now() : null,
        ])->save();

        return $this->success(
            'Status moderasi review berhasil diperbarui.',
            $review->fresh(['product:id,name,slug', 'customer:id,full_name,phone,email'])
        );
    }
}
