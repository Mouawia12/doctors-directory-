<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsletterSubscriptionRequest extends FormRequest
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
            // Keep validation lenient (no DNS check) to avoid false negatives in restricted networks.
            'email' => ['required', 'email:rfc', 'max:150'],
            'source' => ['nullable', 'string', 'max:80'],
        ];
    }
}
