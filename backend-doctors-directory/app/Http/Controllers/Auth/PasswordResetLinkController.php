<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\FrontendUrlResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $request->string('email'))->first();

        if ($user) {
            FrontendUrlResolver::rememberForEmail($request, $user->email);
        }

        try {
            $status = Password::sendResetLink($request->only('email'));
        } catch (\Throwable $exception) {
            Log::error('Password reset email dispatch failed', [
                'email' => $request->string('email'),
                'exception' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        if ($status != Password::RESET_LINK_SENT) {
            Log::warning('Password reset link not sent', [
                'email' => $request->string('email'),
                'status' => $status,
            ]);

            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        Log::info('Password reset link dispatched', [
            'email' => $request->string('email'),
            'user_id' => $user?->id,
        ]);

        return $this->respond(
            ['status' => __($status)],
            __('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
        );
    }
}
