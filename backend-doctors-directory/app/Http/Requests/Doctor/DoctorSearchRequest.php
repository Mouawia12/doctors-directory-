<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'issues' => ['nullable', 'array'],
            'issues.*' => ['integer', 'exists:categories,id'],
            'therapy_modalities' => ['nullable', 'array'],
            'therapy_modalities.*' => ['string', 'max:180'],
            'age_groups' => ['nullable', 'array'],
            'age_groups.*' => [Rule::in(['kids', 'teens', 'adults'])],
            'session_types' => ['nullable', 'array'],
            'session_types.*' => [Rule::in(['in_person', 'online', 'hybrid'])],
            'insurances' => ['nullable', 'array'],
            'insurances.*' => ['string', 'max:120'],
            'insurance' => ['nullable', 'string', 'max:120'],
            'price_min' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'price_max' => ['nullable', 'integer', 'min:0', 'max:5000', 'gte:price_min'],
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
        $filters = $this->safe()->only([
            'q',
            'city',
            'specialty',
            'sub_specialty',
            'gender',
            'languages',
            'issues',
            'therapy_modalities',
            'age_groups',
            'session_types',
            'insurances',
            'insurance',
            'price_min',
            'price_max',
            'min_exp',
            'has_media',
            'lat',
            'lng',
            'radius',
            'status',
        ]);

        if (! empty($filters['languages']) && is_array($filters['languages'])) {
            $filters['languages'] = collect($filters['languages'])
                ->filter()
                ->map(fn ($language) => strtolower(trim($language)))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        return $filters;
    }
}
