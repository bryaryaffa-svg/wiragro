<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'order_number',
        'cart_id',
        'customer_id',
        'store_code',
        'checkout_type',
        'status',
        'payment_status',
        'fulfillment_status',
        'payment_method',
        'shipping_method',
        'pickup_store_code',
        'customer_full_name',
        'customer_phone',
        'customer_email',
        'address_snapshot',
        'notes',
        'subtotal',
        'discount_total',
        'shipping_total',
        'grand_total',
        'auto_cancel_at',
    ];

    protected function casts(): array
    {
        return [
            'address_snapshot' => 'array',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'auto_cancel_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
