<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Customer\StoreProductReviewRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductReview;
use App\Support\CustomerProductReviewEligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerProductReviewController extends ApiController
{
    public function status(
        Product $product,
        Request $request,
        CustomerProductReviewEligibilityService $reviewEligibility,
    ): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $review = $reviewEligibility->findExistingReview($customer, $product);
        $eligibleOrder = $reviewEligibility->resolveEligibleOrder($customer, $product);

        return $this->success('Status review customer.', [
            'eligible' => $eligibleOrder !== null,
            'product_id' => (string) $product->id,
            'order_id' => $eligibleOrder?->id,
            'purchased_at' => optional($eligibleOrder?->created_at)->toIso8601String(),
            'existing_review' => $reviewEligibility->serializeReview($review),
        ]);
    }

    public function store(
        Product $product,
        StoreProductReviewRequest $request,
        CustomerProductReviewEligibilityService $reviewEligibility,
    ): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $eligibleOrder = $reviewEligibility->resolveEligibleOrder($customer, $product);

        if (! $eligibleOrder) {
            throw new UnprocessableEntityHttpException(
                'Review hanya tersedia untuk pembeli yang sudah memiliki pesanan terverifikasi.'
            );
        }

        $data = $request->validated();

        /** @var ProductReview $review */
        $review = ProductReview::query()->updateOrCreate(
            [
                'customer_id' => $customer->id,
                'product_id' => $product->id,
            ],
            [
                'order_id' => $eligibleOrder->id,
                'rating' => (int) $data['rating'],
                'title' => $this->normalizeNullableString($data['title'] ?? null),
                'body' => trim((string) $data['body']),
                'usage_context' => $this->normalizeNullableString($data['usage_context'] ?? null),
                'verified_purchase' => true,
                'moderation_status' => 'pending',
                'moderation_note' => null,
                'submitted_at' => now(),
                'approved_at' => null,
            ],
        );

        return $this->success('Review berhasil dikirim dan menunggu moderasi ringan.', [
            'status' => 'submitted',
            'review' => $reviewEligibility->serializeReview($review->fresh()),
        ], 201);
    }

    private function normalizeNullableString(?string $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? Str::of($normalized)->limit(120, '')->toString() : null;
    }
}
