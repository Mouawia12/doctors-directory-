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
            'support_email' => ['nullable', 'email:rfc,dns', 'max:150'],
            'support_phone' => ['nullable', 'string', 'max:60'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:2048'],
        ];
    }
}
