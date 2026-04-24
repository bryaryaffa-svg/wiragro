<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B2BInquiry extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'b2b_inquiries';

    protected $fillable = [
        'customer_id',
        'store_code',
        'buyer_type',
        'business_name',
        'contact_name',
        'phone',
        'email',
        'commodity_focus',
        'bundle_slug',
        'campaign_slug',
        'monthly_volume',
        'fulfillment_type',
        'preferred_follow_up',
        'budget_hint',
        'need_summary',
        'notes',
        'source_page',
        'status',
        'contacted_at',
        'quoted_at',
        'internal_note',
    ];

    protected function casts(): array
    {
        return [
            'contacted_at' => 'datetime',
            'quoted_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
