<?php

namespace App\Http\Controllers\Api\PublicApi;

use App\Http\Controllers\Api\ApiController;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class PublicProductReviewController extends ApiController
{
    public function index(Product $product): JsonResponse
    {
        abort_unless($product->is_active, 404);

        $approvedReviews = ProductReview::query()
            ->with('customer:id,full_name')
            ->where('product_id', $product->id)
            ->approved()
            ->latest('approved_at')
            ->latest('created_at')
            ->limit(12)
            ->get();

        $breakdown = ProductReview::query()
            ->where('product_id', $product->id)
            ->approved()
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $totalReviews = (int) $breakdown->sum();
        $averageRating = $totalReviews > 0
            ? round(
                (float) ProductReview::query()
                    ->where('product_id', $product->id)
                    ->approved()
                    ->avg('rating'),
                1,
            )
            : null;

        return $this->success('Review produk publik.', [
            'product_id' => (string) $product->id,
            'product_slug' => $product->slug,
            'summary' => [
                'average_rating' => $averageRating,
                'total_reviews' => $totalReviews,
                'rating_breakdown' => $this->serializeBreakdown($breakdown),
            ],
            'items' => $approvedReviews->map(fn (ProductReview $review): array => $this->serializeReview($review))
                ->values()
                ->all(),
        ]);
    }

    /**
     * @param  Collection<int, int|string>  $breakdown
     * @return array<int, array{rating: int, count: int}>
     */
    private function serializeBreakdown(Collection $breakdown): array
    {
        return collect([5, 4, 3, 2, 1])
            ->map(fn (int $rating): array => [
                'rating' => $rating,
                'count' => (int) ($breakdown->get($rating) ?? 0),
            ])
            ->all();
    }

    private function serializeReview(ProductReview $review): array
    {
        return [
            'id' => (string) $review->id,
            'rating' => $review->rating,
            'title' => $review->title,
            'body' => $review->body,
            'usage_context' => $review->usage_context,
            'reviewer_name' => $this->maskReviewerName($review->customer?->full_name),
            'verified_purchase' => true,
            'submitted_at' => optional($review->submitted_at)->toIso8601String(),
            'approved_at' => optional($review->approved_at)->toIso8601String(),
        ];
    }

    private function maskReviewerName(?string $name): string
    {
        $clean = trim((string) $name);

        if ($clean === '') {
            return 'Pembeli terverifikasi';
        }

        $parts = preg_split('/\s+/', $clean) ?: [];
        $first = $parts[0] ?? 'Pembeli';

        if (count($parts) === 1) {
            return $first;
        }

        $lastInitial = strtoupper(substr((string) end($parts), 0, 1));

        return sprintf('%s %s.', $first, $lastInitial);
    }
}
