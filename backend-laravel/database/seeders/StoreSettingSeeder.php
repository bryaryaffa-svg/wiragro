<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingSeeder extends Seeder
{
    public function run(): void
    {
        StoreSetting::updateOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Kios Sidomakmur',
                'store_code' => 'SIDO-JATIM-ONLINE',
                'store_address' => 'Jl. Raya Sidomakmur No. 1, Jawa Timur',
                'whatsapp_number' => '6281234567890',
                'operational_hours' => 'Senin - Sabtu, 08:00 - 17:00',
                'is_active' => true,
            ]
        );
    }
}
