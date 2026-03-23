<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        Banner::updateOrCreate(
            ['title' => 'Promo Musim Tanam'],
            [
                'subtitle' => 'Diskon produk terpilih untuk kebutuhan kios dan pertanian.',
                'image_path' => 'banners/demo-hero.jpg',
                'link_url' => 'https://wiragro.id/produk',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );
    }
}
