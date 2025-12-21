<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Artisan::call('migrate:fresh');

        $shouldSeedDemoDoctors = (bool) env('SEED_DEMO_DOCTORS', !app()->environment('production'));

        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            SiteSettingSeeder::class,
        ]);

        if ($shouldSeedDemoDoctors) {
            $this->call([DoctorSeeder::class]);
        }
    }
}
