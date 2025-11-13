<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class DoctorMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'collection' => ['required', 'in:documents,gallery'],
            'files' => ['required', 'array', 'min:1', 'max:5'],
            'files.*' => [
                'file',
                'max:10240',
                'mimetypes:image/jpeg,image/png,image/webp,application/pdf,video/mp4',
            ],
        ];
    }
}
