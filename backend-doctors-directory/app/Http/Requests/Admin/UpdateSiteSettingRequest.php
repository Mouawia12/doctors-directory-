<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'site_name' => ['nullable', 'string', 'max:120'],
            'site_name_en' => ['nullable', 'string', 'max:120'],
            'support_email' => ['nullable', 'email:rfc', 'max:150'],
            'support_phone' => ['nullable', 'string', 'max:60'],
            'footer_description' => ['nullable', 'string', 'max:300'],
            'footer_description_en' => ['nullable', 'string', 'max:300'],
            'newsletter_title' => ['nullable', 'string', 'max:160'],
            'newsletter_title_en' => ['nullable', 'string', 'max:160'],
            'newsletter_description' => ['nullable', 'string', 'max:300'],
            'newsletter_description_en' => ['nullable', 'string', 'max:300'],
            'newsletter_placeholder' => ['nullable', 'string', 'max:160'],
            'newsletter_placeholder_en' => ['nullable', 'string', 'max:160'],
            'social_links' => ['nullable', 'array'],
            'social_links.facebook' => ['nullable', 'url', 'max:255'],
            'social_links.instagram' => ['nullable', 'url', 'max:255'],
            'social_links.linkedin' => ['nullable', 'url', 'max:255'],
            'footer_links' => ['nullable', 'array'],
            'footer_links.*.id' => ['required_with:footer_links', 'string', 'max:50'],
            'footer_links.*.label' => ['nullable', 'string', 'max:120'],
            'footer_links.*.label_en' => ['nullable', 'string', 'max:120'],
            'footer_links.*.href' => ['required_with:footer_links', 'string', 'max:255'],
            'static_pages' => ['nullable', 'array'],
            'static_pages.*.slug' => ['required_with:static_pages', 'string', 'max:60'],
            'static_pages.*.title' => ['nullable', 'string', 'max:160'],
            'static_pages.*.title_en' => ['nullable', 'string', 'max:160'],
            'static_pages.*.body' => ['nullable', 'string'],
            'static_pages.*.body_en' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:2048'],
        ];
    }
}
