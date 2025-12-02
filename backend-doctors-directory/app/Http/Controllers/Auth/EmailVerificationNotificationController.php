<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $user->sendEmailVerificationNotification();

        return $this->respond(null, __('تم إرسال رابط التحقق إلى بريدك الإلكتروني'));
    }
}
