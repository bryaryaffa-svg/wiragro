<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Pupuk', 'slug' => 'pupuk'],
            ['name' => 'Pestisida', 'slug' => 'pestisida'],
            ['name' => 'Benih', 'slug' => 'benih'],
            ['name' => 'Nutrisi', 'slug' => 'nutrisi'],
            ['name' => 'Alat Pertanian', 'slug' => 'alat-pertanian'],
            ['name' => 'Sembako', 'slug' => 'sembako'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => 'Kategori '.$category['name'],
                    'is_active' => true,
                ]
            );
        }
    }
}
