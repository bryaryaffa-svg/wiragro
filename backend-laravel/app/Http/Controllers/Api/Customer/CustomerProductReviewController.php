<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Customer\StoreProductReviewRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerProductReviewController extends ApiController
{
    public function status(Product $product, Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $review = ProductReview::query()
            ->where('customer_id', $customer->id)
            ->where('product_id', $product->id)
            ->first();
        $eligibleOrder = $this->resolveEligibleOrder($customer, $product);

        return $this->success('Status review customer.', [
            'eligible' => $eligibleOrder !== null,
            'product_id' => (string) $product->id,
            'order_id' => $eligibleOrder?->id,
            'purchased_at' => optional($eligibleOrder?->created_at)->toIso8601String(),
            'existing_review' => $review ? $this->serializeReview($review) : null,
        ]);
    }

    public function store(Product $product, StoreProductReviewRequest $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $eligibleOrder = $this->resolveEligibleOrder($customer, $product);

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
            'review' => $this->serializeReview($review->fresh()),
        ], 201);
    }

    private function resolveEligibleOrder(Customer $customer, Product $product): ?Order
    {
        return Order::query()
            ->where('customer_id', $customer->id)
            ->where('payment_status', 'PAID')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->latest('created_at')
            ->first();
    }

    private function serializeReview(ProductReview $review): array
    {
        return [
            'id' => (string) $review->id,
            'rating' => $review->rating,
            'title' => $review->title,
            'body' => $review->body,
            'usage_context' => $review->usage_context,
            'moderation_status' => $review->moderation_status,
            'moderation_note' => $review->moderation_note,
            'submitted_at' => optional($review->submitted_at)->toIso8601String(),
            'approved_at' => optional($review->approved_at)->toIso8601String(),
            'verified_purchase' => true,
        ];
    }

    private function normalizeNullableString(?string $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? Str::of($normalized)->limit(120, '')->toString() : null;
    }
}
