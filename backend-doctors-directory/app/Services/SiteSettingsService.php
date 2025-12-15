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

        $socialLinks = json_decode($settings['social_links'] ?? '{}', true) ?: [];
        $footerLinks = json_decode($settings['footer_links'] ?? '[]', true) ?: [];
        $staticPages = json_decode($settings['static_pages'] ?? '[]', true) ?: [];

        $payload = [
            'site_name' => $settings['site_name'] ?? config('app.name', 'Doctors Directory'),
            'site_name_en' => $settings['site_name_en'] ?? null,
            'support_email' => $settings['support_email'] ?? null,
            'support_phone' => $settings['support_phone'] ?? null,
            'site_logo_url' => $logoUrl,
            'footer_description' => $settings['footer_description'] ?? null,
            'footer_description_en' => $settings['footer_description_en'] ?? null,
            'newsletter_title' => $settings['newsletter_title'] ?? null,
            'newsletter_title_en' => $settings['newsletter_title_en'] ?? null,
            'newsletter_description' => $settings['newsletter_description'] ?? null,
            'newsletter_description_en' => $settings['newsletter_description_en'] ?? null,
            'newsletter_placeholder' => $settings['newsletter_placeholder'] ?? null,
            'newsletter_placeholder_en' => $settings['newsletter_placeholder_en'] ?? null,
            'social_links' => $socialLinks,
            'footer_links' => $footerLinks,
            'static_pages' => $staticPages,
        ];

        if ($includeInternal) {
            $payload['site_logo_path'] = $logoPath;
        }

        return $payload;
    }
}
