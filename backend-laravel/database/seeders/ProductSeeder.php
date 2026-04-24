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
                'category_slug' => 'benih',
                'sku' => 'PRD-BNH-001',
                'name' => 'Benih Cabai Prima F1',
                'slug' => 'benih-cabai-prima-f1',
                'unit' => 'pack',
                'weight_grams' => 250,
                'price' => 42000,
                'promo_price' => 39000,
                'reseller_price' => 36500,
                'stock_qty' => 55,
            ],
            [
                'category_slug' => 'benih',
                'sku' => 'PRD-BNH-002',
                'name' => 'Benih Padi Inpari 32 5 Kg',
                'slug' => 'benih-padi-inpari-32-5kg',
                'unit' => 'sak',
                'weight_grams' => 5000,
                'price' => 98000,
                'promo_price' => 92000,
                'reseller_price' => 88500,
                'stock_qty' => 34,
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
                'category_slug' => 'pestisida',
                'sku' => 'PRD-PST-001',
                'name' => 'Gamectin 30 EC 500 ml',
                'slug' => 'gamectin-30-ec-500-ml',
                'unit' => 'botol',
                'weight_grams' => 500,
                'price' => 68000,
                'promo_price' => 63000,
                'reseller_price' => 59500,
                'stock_qty' => 48,
            ],
            [
                'category_slug' => 'pestisida',
                'sku' => 'PRD-PST-002',
                'name' => 'Fostin 610 EC 400 ml',
                'slug' => 'fostin-610-ec-400-ml',
                'unit' => 'botol',
                'weight_grams' => 400,
                'price' => 72000,
                'promo_price' => 68000,
                'reseller_price' => 64500,
                'stock_qty' => 41,
            ],
            [
                'category_slug' => 'pestisida',
                'sku' => 'PRD-PST-003',
                'name' => 'V-Protect 100 ml',
                'slug' => 'v-protect-100-ml',
                'unit' => 'botol',
                'weight_grams' => 100,
                'price' => 39000,
                'promo_price' => 36000,
                'reseller_price' => 33500,
                'stock_qty' => 67,
            ],
            [
                'category_slug' => 'nutrisi',
                'sku' => 'PRD-NTR-001',
                'name' => 'Extra Grow Liquid 500 ml',
                'slug' => 'extra-grow-liquid-500-ml',
                'unit' => 'botol',
                'weight_grams' => 500,
                'price' => 49000,
                'promo_price' => 46000,
                'reseller_price' => 43000,
                'stock_qty' => 52,
            ],
            [
                'category_slug' => 'nutrisi',
                'sku' => 'PRD-NTR-002',
                'name' => 'Super Calsium Liquid 500 ml',
                'slug' => 'super-calsium-liquid-500-ml',
                'unit' => 'botol',
                'weight_grams' => 500,
                'price' => 52000,
                'promo_price' => 49000,
                'reseller_price' => 45500,
                'stock_qty' => 46,
            ],
            [
                'category_slug' => 'nutrisi',
                'sku' => 'PRD-NTR-003',
                'name' => 'Super Kalium',
                'slug' => 'super-kalium',
                'unit' => 'botol',
                'weight_grams' => 500,
                'price' => 57000,
                'promo_price' => 54000,
                'reseller_price' => 50500,
                'stock_qty' => 44,
            ],
            [
                'category_slug' => 'alat-pertanian',
                'sku' => 'KS-ALT-001',
                'name' => 'Sprayer Punggung 16L',
                'slug' => 'sprayer-punggung-16l',
                'unit' => 'unit',
                'weight_grams' => 3500,
                'price' => 355000,
                'promo_price' => null,
                'reseller_price' => 339000,
                'stock_qty' => 18,
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
