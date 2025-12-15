<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $perPage = (int) request()->input('per_page', 25);
        $paginator = NewsletterSubscription::query()
            ->latest()
            ->paginate($perPage);

        $items = $paginator->map(fn (NewsletterSubscription $subscription) => [
            'id' => $subscription->id,
            'email' => $subscription->email,
            'locale' => $subscription->locale,
            'source' => $subscription->source,
            'created_at' => $subscription->created_at?->toDateTimeString(),
        ])->all();

        return $this->respondWithPagination($paginator, $items);
    }
}
