<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Product\UpdateStockRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StockController extends ApiController
{
    public function update(UpdateStockRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $movement = null;

        DB::transaction(function () use ($request, $product, $data, &$movement): void {
            $before = $product->stock_qty;
            $after = $data['stock_qty'];

            $product->update([
                'stock_qty' => $after,
            ]);

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'change_type' => 'adjustment',
                'qty_before' => $before,
                'qty_change' => $after - $before,
                'qty_after' => $after,
                'notes' => $data['notes'] ?? null,
            ]);
        });

        return $this->success('Stok berhasil diperbarui.', [
            'product' => $product->fresh(),
            'movement' => $movement,
        ]);
    }
}
