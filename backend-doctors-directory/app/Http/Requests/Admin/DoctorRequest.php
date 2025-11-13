<?php

namespace App\Http\Requests\Admin;

use App\Enums\DoctorStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoctorRequest extends FormRequest
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
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'specialty' => ['required', 'string', 'max:120'],
            'sub_specialty' => ['nullable', 'string', 'max:120'],
            'qualifications' => ['nullable', 'array', 'max:10'],
            'qualifications.*' => ['string', 'max:120'],
            'license_number' => ['nullable', 'string', 'max:120'],
            'languages' => ['required', 'array', 'min:1', 'max:5'],
            'languages.*' => ['string', 'max:5'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:60'],
            'insurances' => ['nullable', 'array', 'max:10'],
            'insurances.*' => ['string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'website' => ['nullable', 'url', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_verified' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(DoctorStatus::values())],
            'status_note' => ['nullable', 'string', 'max:2000'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'clinics' => ['required', 'array', 'min:1', 'max:3'],
            'clinics.*.id' => ['sometimes', 'integer', 'exists:clinics,id'],
            'clinics.*.address' => ['required', 'string', 'max:255'],
            'clinics.*.city' => ['required', 'string', 'max:120'],
            'clinics.*.lat' => ['nullable', 'numeric'],
            'clinics.*.lng' => ['nullable', 'numeric'],
            'clinics.*.work_hours' => ['nullable', 'array'],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function clinics(): array
    {
        return $this->validated('clinics', []);
    }

    /**
     * @return list<int>
     */
    public function categories(): array
    {
        return $this->validated('categories', []);
    }
}
