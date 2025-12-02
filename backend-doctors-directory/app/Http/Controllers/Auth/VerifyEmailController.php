<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified.
     */
    public function __invoke(Request $request, string $id, string $hash): JsonResponse|RedirectResponse
    {
        /** @var User $user */
        $user = User::query()->findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return $this->verificationFailedResponse($request, 'invalid-link');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->verifiedResponse($request, $user, 'already-verified');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->verifiedResponse($request, $user);
    }

    protected function verifiedResponse(Request $request, User $user, string $status = 'verified'): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return $this->respond(['verified' => $status === 'verified']);
        }

        return redirect()->away($this->frontendRedirectUrl($status));
    }

    protected function verificationFailedResponse(Request $request, string $status): JsonResponse|RedirectResponse
    {
        $message = __('رابط التحقق غير صالح أو منتهي');

        if ($request->expectsJson()) {
            return $this->respondWithError(['verification' => [$message]], $message, 422);
        }

        return redirect()->away($this->frontendRedirectUrl($status));
    }

    protected function frontendRedirectUrl(string $status): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/').'/verify-email/success';
        $query = http_build_query(['status' => $status]);

        return "{$baseUrl}?{$query}";
    }
}
