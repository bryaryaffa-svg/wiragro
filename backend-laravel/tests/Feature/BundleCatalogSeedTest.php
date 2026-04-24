<?php

namespace Tests\Feature;

use Database\Seeders\CategorySeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BundleCatalogSeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_mock_catalog_products_needed_for_official_bundles(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(ProductSeeder::class);

        $this->assertDatabaseHas('categories', ['slug' => 'benih']);
        $this->assertDatabaseHas('categories', ['slug' => 'nutrisi']);
        $this->assertDatabaseHas('categories', ['slug' => 'alat-pertanian']);

        foreach ([
            'benih-cabai-prima-f1',
            'benih-padi-inpari-32-5kg',
            'extra-grow-liquid-500-ml',
            'super-calsium-liquid-500-ml',
            'gamectin-30-ec-500-ml',
            'fostin-610-ec-400-ml',
            'v-protect-100-ml',
            'super-kalium',
            'sprayer-punggung-16l',
            'pupuk-organik-25-kg',
        ] as $slug) {
            $this->assertDatabaseHas('products', [
                'slug' => $slug,
                'is_active' => true,
            ]);
        }
    }
}
