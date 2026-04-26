<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class B2BInquiry extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'b2b_inquiries';

    protected $fillable = [
        'customer_id',
        'inquiry_number',
        'store_code',
        'buyer_type',
        'business_name',
        'contact_name',
        'phone',
        'email',
        'commodity_focus',
        'commodity_slug',
        'bundle_slug',
        'campaign_slug',
        'product_slug',
        'product_name',
        'monthly_volume',
        'fulfillment_type',
        'preferred_follow_up',
        'budget_hint',
        'need_summary',
        'requested_items',
        'quote_items',
        'estimate_subtotal',
        'estimate_shipping',
        'estimate_total',
        'notes',
        'source_page',
        'status',
        'contacted_at',
        'quoted_at',
        'sales_note',
        'internal_note',
    ];

    protected function casts(): array
    {
        return [
            'requested_items' => 'array',
            'quote_items' => 'array',
            'estimate_subtotal' => 'decimal:2',
            'estimate_shipping' => 'decimal:2',
            'estimate_total' => 'decimal:2',
            'contacted_at' => 'datetime',
            'quoted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $inquiry): void {
            if (! $inquiry->inquiry_number) {
                $inquiry->inquiry_number = static::generateInquiryNumber();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    private static function generateInquiryNumber(): string
    {
        $prefix = 'WRG-B2B-'.now()->format('Ymd');

        do {
            $candidate = $prefix.'-'.Str::upper(Str::random(4));
        } while (static::query()->where('inquiry_number', $candidate)->exists());

        return $candidate;
    }
}
