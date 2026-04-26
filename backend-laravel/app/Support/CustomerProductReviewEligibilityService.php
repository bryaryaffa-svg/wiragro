<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CustomerProductReviewEligibilityService
{
    public function resolveEligibleOrder(Customer $customer, Product $product): ?Order
    {
        return Order::query()
            ->where('customer_id', $customer->id)
            ->where('payment_status', 'PAID')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->latest('created_at')
            ->first();
    }

    public function findExistingReview(Customer $customer, Product|string|int $product): ?ProductReview
    {
        return ProductReview::query()
            ->where('customer_id', $customer->id)
            ->where('product_id', $product instanceof Product ? $product->id : $product)
            ->first();
    }

    public function serializeReview(?ProductReview $review): ?array
    {
        if (! $review) {
            return null;
        }

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

    /**
     * @param  Collection<int, Order>  $orders
     * @return array<string, array<string, mixed>>
     */
    public function buildOrderReviewSummaries(Customer $customer, Collection $orders): array
    {
        $orders->loadMissing('items');

        $productIds = $orders
            ->flatMap(fn (Order $order): Collection => $order->items->pluck('product_id'))
            ->filter(fn ($productId): bool => $productId !== null && $productId !== '')
            ->map(fn ($productId): string => (string) $productId)
            ->unique()
            ->values();

        $reviewsByProductId = $productIds->isEmpty()
            ? collect()
            : ProductReview::query()
                ->where('customer_id', $customer->id)
                ->whereIn('product_id', $productIds->all())
                ->get()
                ->keyBy(fn (ProductReview $review): string => (string) $review->product_id);

        return $orders
            ->mapWithKeys(fn (Order $order): array => [
                (string) $order->id => $this->buildOrderReviewSummary($customer, $order, $reviewsByProductId),
            ])
            ->all();
    }

    /**
     * @param  Collection<string, ProductReview>|null  $reviewsByProductId
     * @return array<string, mixed>
     */
    public function buildOrderReviewSummary(
        Customer $customer,
        Order $order,
        ?Collection $reviewsByProductId = null,
    ): array {
        $order->loadMissing('items');

        if ($reviewsByProductId === null) {
            $productIds = $order->items
                ->pluck('product_id')
                ->filter(fn ($productId): bool => $productId !== null && $productId !== '')
                ->map(fn ($productId): string => (string) $productId)
                ->unique()
                ->values();

            $reviewsByProductId = $productIds->isEmpty()
                ? collect()
                : ProductReview::query()
                    ->where('customer_id', $customer->id)
                    ->whereIn('product_id', $productIds->all())
                    ->get()
                    ->keyBy(fn (ProductReview $review): string => (string) $review->product_id);
        }

        $items = $order->items
            ->filter(fn (OrderItem $item): bool => $item->product_id !== null && $item->product_id !== '')
            ->unique(fn (OrderItem $item): string => (string) $item->product_id)
            ->values();
        $orderEligible = Str::upper(trim((string) $order->payment_status)) === 'PAID' && $items->isNotEmpty();

        $serializedItems = $items
            ->map(function (OrderItem $item) use ($reviewsByProductId, $orderEligible): array {
                $productId = (string) $item->product_id;
                /** @var ProductReview|null $review */
                $review = $reviewsByProductId?->get($productId);
                $state = $this->resolveReviewState($orderEligible, $review);

                return [
                    'product_id' => $productId,
                    'product_name' => $item->product_name,
                    'product_slug' => $item->product_slug,
                    'eligible' => $orderEligible,
                    'state' => $state,
                    'can_write_review' => $orderEligible && $state !== 'approved',
                    'existing_review' => $this->serializeReview($review),
                ];
            })
            ->values();

        return [
            'order_eligible' => $orderEligible,
            'ready_item_count' => $serializedItems->where('state', 'ready')->count(),
            'pending_item_count' => $serializedItems->where('state', 'pending')->count(),
            'approved_item_count' => $serializedItems->where('state', 'approved')->count(),
            'needs_update_item_count' => $serializedItems->where('state', 'needs_update')->count(),
            'items' => $serializedItems->all(),
        ];
    }

    private function resolveReviewState(bool $orderEligible, ?ProductReview $review): string
    {
        if (! $orderEligible) {
            return 'awaiting_payment';
        }

        if (! $review) {
            return 'ready';
        }

        return match ($review->moderation_status) {
            'approved' => 'approved',
            'rejected' => 'needs_update',
            default => 'pending',
        };
    }
}
