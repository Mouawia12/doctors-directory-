<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            'site_name' => 'دليل المعالجين النفسيين والاسريين',
            'site_name_en' => 'Psychological & Family Therapists Directory',
            'support_email' => 'care@doctors.directory',
            'support_phone' => '+966 55 555 5555',
        ];

        foreach ($defaults as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->importInitialLogo();
    }

    protected function importInitialLogo(): void
    {
        $source = $this->getLogoSource();

        if (! $source) {
            return;
        }

        $filename = 'site-logo-'.Str::random(12).'.png';
        $targetPath = 'site/'.$filename;

        Storage::disk('public')->put($targetPath, File::get($source));

        SiteSetting::updateOrCreate(['key' => 'site_logo_path'], ['value' => $targetPath]);

        if (basename($source) === 'الدليل-السعودي.png') {
            File::delete($source);
        }
    }

    protected function getLogoSource(): ?string
    {
        $candidateSources = [
            database_path('seeders/assets/site-logo.png'),
            base_path('الدليل-السعودي.png'),
        ];

        foreach ($candidateSources as $path) {
            if (File::exists($path)) {
                return $path;
            }
        }

        return null;
    }
}
