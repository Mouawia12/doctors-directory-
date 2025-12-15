<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsletterSubscriptionRequest;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriptionController extends Controller
{
    public function store(NewsletterSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        NewsletterSubscription::updateOrCreate(
            ['email' => $validated['email']],
            [
                'locale' => app()->getLocale(),
                'source' => $validated['source'] ?? 'footer',
            ],
        );

        return $this->respond(message: 'Subscription saved.');
    }
}
