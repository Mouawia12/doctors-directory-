<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->respondWithPagination(
            $notifications,
            NotificationResource::collection($notifications)->toArray($request)
        );
    }

    public function markAsRead(Request $request, DatabaseNotification $notification): JsonResponse
    {
        $user = $request->user();

        if ($notification->notifiable_id !== $user->getKey() || $notification->notifiable_type !== $user::class) {
            abort(403);
        }

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return $this->respond(new NotificationResource($notification));
    }
}
