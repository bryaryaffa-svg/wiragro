<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'category_slug' => 'pupuk',
                'sku' => 'PRD-001',
                'name' => 'Pupuk Organik 25 Kg',
                'slug' => 'pupuk-organik-25-kg',
                'unit' => 'sak',
                'weight_grams' => 25000,
                'price' => 85000,
                'promo_price' => 79000,
                'reseller_price' => 74000,
                'stock_qty' => 120,
            ],
            [
                'category_slug' => 'pestisida',
                'sku' => 'PRD-002',
                'name' => 'Herbisida Gulma 1 Liter',
                'slug' => 'herbisida-gulma-1-liter',
                'unit' => 'botol',
                'weight_grams' => 1000,
                'price' => 65000,
                'promo_price' => null,
                'reseller_price' => 61000,
                'stock_qty' => 40,
            ],
            [
                'category_slug' => 'sembako',
                'sku' => 'PRD-003',
                'name' => 'Beras Premium 5 Kg',
                'slug' => 'beras-premium-5-kg',
                'unit' => 'sak',
                'weight_grams' => 5000,
                'price' => 76000,
                'promo_price' => 73500,
                'reseller_price' => 70000,
                'stock_qty' => 80,
            ],
        ];

        foreach ($items as $item) {
            $category = Category::where('slug', $item['category_slug'])->firstOrFail();

            Product::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'category_id' => $category->id,
                    'name' => $item['name'],
                    'slug' => $item['slug'],
                    'description' => 'Produk demo untuk '.$item['name'],
                    'unit' => $item['unit'],
                    'weight_grams' => $item['weight_grams'],
                    'price' => $item['price'],
                    'promo_price' => $item['promo_price'],
                    'reseller_price' => $item['reseller_price'],
                    'stock_qty' => $item['stock_qty'],
                    'is_active' => true,
                ]
            );
        }
    }
}
