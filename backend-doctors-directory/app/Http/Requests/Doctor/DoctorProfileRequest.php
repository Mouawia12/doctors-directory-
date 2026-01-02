<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class DoctorProfileRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'max:255'],
            'honorific_prefix' => ['nullable', 'string', 'max:40'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'middle_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'credentials_suffix' => ['nullable', 'string', 'max:120'],
            'preferred_pronouns' => ['nullable', 'string', 'max:120'],
            'display_name_preference' => ['required', 'in:personal,business'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'about_paragraph_one' => ['nullable', 'string', 'max:640'],
            'about_paragraph_two' => ['nullable', 'string', 'max:360'],
            'about_paragraph_three' => ['nullable', 'string', 'max:1000'],
            'specialty' => ['required', 'array', 'min:1', 'max:3'],
            'specialty.*' => ['string', 'max:120'],
            'sub_specialty' => ['nullable', 'array', 'max:7'],
            'sub_specialty.*' => ['string', 'max:120'],
            'qualifications' => ['nullable', 'array', 'max:10'],
            'qualifications.*' => ['string', 'max:120'],
            'additional_credentials' => ['nullable', 'array', 'max:5'],
            'additional_credentials.*' => ['string', 'max:120'],
            'license_state' => ['nullable', 'string', 'max:120'],
            'license_expiration' => ['nullable', 'date'],
            'license_number' => ['required', 'string', 'max:120'],
            'languages' => ['required', 'array', 'min:1', 'max:5'],
            'languages.*' => ['string', 'max:5'],
            'gender' => ['required', 'in:male,female'],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:60'],
            'professional_role' => ['nullable', 'string', 'max:120'],
            'licensure_status' => ['nullable', 'in:licensed,supervised,unlicensed'],
            'insurances' => ['nullable', 'array', 'max:10'],
            'insurances.*' => ['string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'website' => ['nullable', 'url', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'mobile_phone' => ['nullable', 'string', 'max:30'],
            'mobile_can_text' => ['nullable', 'boolean'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'appointment_email' => ['nullable', 'email', 'max:255'],
            'accepts_email_messages' => ['nullable', 'boolean'],
            'new_clients_intro' => ['nullable', 'string', 'max:160'],
            'service_delivery' => ['nullable', 'in:in_person,online,hybrid'],
            'new_clients_status' => ['nullable', 'in:accepting,not_accepting,waitlist'],
            'offers_intro_call' => ['nullable', 'boolean'],
            'identity_traits' => ['nullable', 'array'],
            'fee_individual' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'fee_couples' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'offers_sliding_scale' => ['nullable', 'boolean'],
            'payment_methods' => ['nullable', 'array', 'max:15'],
            'payment_methods.*' => ['string', 'max:60'],
            'npi_number' => ['nullable', 'string', 'max:40'],
            'liability_carrier' => ['nullable', 'string', 'max:255'],
            'liability_expiration' => ['nullable', 'date'],
            'qualifications_note' => ['nullable', 'string', 'max:300'],
            'education_institution' => ['nullable', 'string', 'max:120'],
            'education_degree' => ['nullable', 'string', 'max:120'],
            'education_graduation_year' => ['nullable', 'integer', 'min:1900', 'max:'.(now()->year + 1)],
            'practice_start_year' => ['nullable', 'integer', 'min:1900', 'max:'.(now()->year + 1)],
            'specialties_note' => ['nullable', 'string', 'max:400'],
            'client_participants' => ['nullable', 'array', 'max:3'],
            'client_participants.*' => ['string', 'max:60'],
            'client_age_groups' => ['nullable', 'array', 'max:5'],
            'client_age_groups.*' => ['string', 'max:60'],
            'faith_orientation' => ['nullable', 'string', 'max:120'],
            'allied_communities' => ['nullable', 'array', 'max:10'],
            'allied_communities.*' => ['string', 'max:80'],
            'therapy_modalities' => ['nullable', 'array', 'max:10'],
            'therapy_modalities.*' => ['string', 'max:120'],
            'treatment_note' => ['nullable', 'string', 'max:400'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'clinics' => ['nullable', 'array', 'max:3'],
            'clinics.*.id' => ['sometimes', 'integer', 'exists:clinics,id'],
            'clinics.*.address' => ['required_with:clinics', 'string', 'max:255'],
            'clinics.*.city' => ['required_with:clinics', 'string', 'max:120'],
            'clinics.*.lat' => ['nullable', 'numeric'],
            'clinics.*.lng' => ['nullable', 'numeric'],
            'clinics.*.work_hours' => ['nullable', 'array'],
        ];
    }

    public function clinics(): array
    {
        return $this->validated('clinics', []);
    }

    public function categories(): array
    {
        return $this->validated('categories', []);
    }
}
