<?php

namespace App\Http\Requests\Admin;

use App\Enums\DoctorStatus;
use App\Http\Requests\Doctor\DoctorProfileRequest;
use Illuminate\Validation\Rule;

class DoctorRequest extends DoctorProfileRequest
{
    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $adminSpecific = [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['sometimes', Rule::in(DoctorStatus::values())],
            'status_note' => ['nullable', 'string', 'max:2000'],
            'is_verified' => ['sometimes', 'boolean'],
        ];

        return array_merge($rules, $adminSpecific);
    }
}
