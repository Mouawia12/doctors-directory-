<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'collection' => ['required', Rule::in(['documents', 'gallery', 'avatar', 'intro_video'])],
            'files' => ['required', 'array', 'min:1', 'max:'.$this->maxFiles()],
            'files.*' => $this->fileRules(),
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function fileRules(): array
    {
        $collection = $this->string('collection')->toString();

        return match ($collection) {
            'avatar' => ['file', 'max:20480', 'mimetypes:image/jpeg,image/png,image/webp'],
            'intro_video' => ['file', 'max:51200', 'mimetypes:video/mp4,video/quicktime'],
            'documents' => ['file', 'max:10240', 'mimetypes:application/pdf,image/jpeg,image/png,image/webp'],
            default => ['file', 'max:20480', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime'],
        };
    }

    protected function maxFiles(): int
    {
        return in_array($this->string('collection')->toString(), ['avatar', 'intro_video', 'documents'], true) ? 1 : 5;
    }
}
