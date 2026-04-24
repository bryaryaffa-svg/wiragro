<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SmokeTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StoreSettingSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        Customer::updateOrCreate(
            ['username' => 'reseller-uji'],
            [
                'full_name' => 'Reseller Uji Sidomakmur',
                'phone' => '+628123450001',
                'email' => 'reseller-uji@sidomakmur.test',
                'password' => Hash::make('Reseller123'),
                'auth_provider' => 'reseller',
                'member_tier' => 'reseller',
                'whatsapp_verified' => true,
                'is_guest' => false,
            ]
        );
    }
}
