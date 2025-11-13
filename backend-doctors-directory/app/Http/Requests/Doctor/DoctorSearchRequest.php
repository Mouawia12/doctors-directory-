<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class DoctorSearchRequest extends FormRequest
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
            'q' => ['nullable', 'string', 'max:200'],
            'city' => ['nullable', 'string', 'max:120'],
            'specialty' => ['nullable', 'string', 'max:120'],
            'sub_specialty' => ['nullable', 'string', 'max:120'],
            'gender' => ['nullable', 'in:male,female'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:5'],
            'insurance' => ['nullable', 'string', 'max:120'],
            'min_exp' => ['nullable', 'integer', 'min:0', 'max:60'],
            'has_media' => ['nullable', 'boolean'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'radius' => ['nullable', 'integer', 'min:1', 'max:200'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'status' => ['nullable', 'in:pending,approved,rejected'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'q',
            'city',
            'specialty',
            'sub_specialty',
            'gender',
            'languages',
            'insurance',
            'min_exp',
            'has_media',
            'lat',
            'lng',
            'radius',
            'status',
        ]);
    }
}
