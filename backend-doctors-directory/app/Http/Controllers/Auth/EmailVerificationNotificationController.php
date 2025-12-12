<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\FrontendUrlResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->respondWithError(['auth' => __('غير مصرح')], __('يجب تسجيل الدخول'), 401);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->respond(null, __('تم التحقق من البريد الإلكتروني مسبقاً'));
        }

        FrontendUrlResolver::rememberForUser($request, $user);

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $exception) {
            Log::error('Email verification notification failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'exception' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        Log::info('Email verification notification dispatched', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return $this->respond(null, __('تم إرسال رابط التحقق إلى بريدك الإلكتروني'));
    }
}
