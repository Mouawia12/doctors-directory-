<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingRequest;
use App\Models\SiteSetting;
use App\Services\SiteSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return $this->respond(SiteSettingsService::all(includeInternal: true));
    }

    public function update(UpdateSiteSettingRequest $request): JsonResponse
    {
        $data = $request->validated();

        foreach (['site_name', 'site_name_en', 'support_email', 'support_phone', 'footer_description', 'footer_description_en', 'newsletter_title', 'newsletter_title_en', 'newsletter_description', 'newsletter_description_en', 'newsletter_placeholder', 'newsletter_placeholder_en'] as $key) {
            if (array_key_exists($key, $data)) {
                SiteSetting::updateOrCreate(['key' => $key], [
                    'value' => $data[$key],
                ]);
            }
        }

        foreach (['social_links', 'footer_links', 'static_pages'] as $jsonKey) {
            if (array_key_exists($jsonKey, $data)) {
                SiteSetting::updateOrCreate(['key' => $jsonKey], [
                    'value' => json_encode($data[$jsonKey]),
                ]);
            }
        }

        if ($request->hasFile('logo')) {
            $this->replaceLogo($request->file('logo'));
        }

        return $this->respond(SiteSettingsService::all(includeInternal: true), 'Settings updated.');
    }

    protected function replaceLogo(\Illuminate\Http\UploadedFile $file): void
    {
        $existingPath = SiteSetting::where('key', 'site_logo_path')->value('value');

        $path = $file->store('site', 'public');

        SiteSetting::updateOrCreate(['key' => 'site_logo_path'], ['value' => $path]);

        if ($existingPath && $existingPath !== $path) {
            Storage::disk('public')->delete($existingPath);
        }
    }
}
