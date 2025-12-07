<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;

class SiteSettingsService
{
    public static function all(bool $includeInternal = false): array
    {
        $settings = SiteSetting::query()->pluck('value', 'key')->toArray();

        $logoPath = $settings['site_logo_path'] ?? null;
        $logoUrl = null;

        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            $logoUrl = Storage::disk('public')->url($logoPath);
        }

        $payload = [
            'site_name' => $settings['site_name'] ?? config('app.name', 'Doctors Directory'),
            'site_name_en' => $settings['site_name_en'] ?? null,
            'support_email' => $settings['support_email'] ?? null,
            'support_phone' => $settings['support_phone'] ?? null,
            'site_logo_url' => $logoUrl,
        ];

        if ($includeInternal) {
            $payload['site_logo_path'] = $logoPath;
        }

        return $payload;
    }
}
