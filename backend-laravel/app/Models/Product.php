<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'slug',
        'description',
        'unit',
        'weight_grams',
        'price',
        'promo_price',
        'reseller_price',
        'stock_qty',
        'is_active',
    ];

    protected $appends = [
        'current_price',
        'primary_image_url',
        'review_summary',
    ];

    protected $hidden = [
        'approved_reviews_count',
        'approved_reviews_avg_rating',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'promo_price' => 'decimal:2',
            'reseller_price' => 'decimal:2',
            'weight_grams' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->approved();
    }

    public function getCurrentPriceAttribute(): string
    {
        $price = $this->promo_price ?: $this->price;

        return number_format((float) $price, 2, '.', '');
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        $image = $this->images->firstWhere('is_primary', true) ?? $this->images->first();

        return $image?->image_url;
    }

    /**
     * @return array{average_rating: float|null, total_reviews: int}
     */
    public function getReviewSummaryAttribute(): array
    {
        $totalReviews = (int) ($this->approved_reviews_count ?? 0);
        $averageRating = $this->approved_reviews_avg_rating;

        return [
            'average_rating' => $totalReviews > 0 && $averageRating !== null
                ? round((float) $averageRating, 1)
                : null,
            'total_reviews' => $totalReviews,
        ];
    }
}
