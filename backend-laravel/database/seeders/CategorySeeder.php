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
