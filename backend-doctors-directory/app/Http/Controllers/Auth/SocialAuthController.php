<?php

namespace App\Http\Controllers\Auth;

use App\Enums\DoctorStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SocialLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Doctor;
use App\Models\User;
use App\Services\GoogleTokenVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class SocialAuthController extends Controller
{
    public function google(SocialLoginRequest $request, GoogleTokenVerifier $verifier): JsonResponse
    {
        try {
            $googleProfile = $verifier->verify($request->string('token')->toString());
        } catch (RuntimeException $exception) {
            return $this->respondWithError(
                ['token' => __('تعذر التحقق من رمز Google')],
                __('تعذر التحقق من حساب Google'),
                422
            );
        }

        if (! isset($googleProfile['email'])) {
            return $this->respondWithError(
                ['token' => __('لم نستلم بريداً إلكترونياً من Google')],
                __('لا يمكن إنشاء حساب بدون بريد إلكتروني موثّق'),
                422
            );
        }

        $user = $this->findOrCreateUserFromGoogle($googleProfile, $request->string('type')->toString() ?: null);

        if (! $user) {
            return $this->respondWithError(
                ['type' => __('يجب تحديد نوع الحساب (طبيب أو مستخدم) عند التسجيل لأول مرة عبر Google')],
                __('معلومات ناقصة لإنشاء الحساب'),
                422
            );
        }

        if ($user->is_disabled) {
            return $this->respondWithError(
                ['email' => __('تم تعطيل هذا الحساب، يرجى التواصل مع الدعم.')],
                __('لا يمكن تسجيل الدخول بالحساب المعطّل'),
                423
            );
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $user->load('doctorProfile');

        $token = $user->createToken('spa')->plainTextToken;

        return $this->respond([
            'user' => new UserResource($user),
            'token' => $token,
        ], __('تم تسجيل الدخول عبر Google'));
    }

    /**
     * @param  array<string, mixed>  $googleProfile
     */
    protected function findOrCreateUserFromGoogle(array $googleProfile, ?string $type): ?User
    {
        $providerId = $googleProfile['sub'] ?? null;
        $email = $googleProfile['email'] ?? null;

        $user = User::query()
            ->when($providerId, fn ($query) => $query
                ->where('provider_name', 'google')
                ->where('provider_id', $providerId))
            ->first();

        if ($user) {
            return $this->ensureUserHasAvatarAndVerification($user, $googleProfile);
        }

        if ($email) {
            $user = User::query()->where('email', $email)->first();
            if ($user) {
                $user->forceFill([
                    'provider_name' => 'google',
                    'provider_id' => $providerId,
                    'avatar_url' => $googleProfile['picture'] ?? $user->avatar_url,
                ])->save();

                return $this->ensureUserHasAvatarAndVerification($user, $googleProfile);
            }
        }

        if (! $type) {
            return null;
        }

        return DB::transaction(function () use ($googleProfile, $type, $providerId): User {
            $name = $googleProfile['name']
                ?? trim(($googleProfile['given_name'] ?? '').' '.($googleProfile['family_name'] ?? ''))
                ?: 'عضو جديد';

            /** @var User $user */
            $user = User::create([
                'name' => $name,
                'email' => $googleProfile['email'],
                'password' => Str::password(40),
                'provider_name' => 'google',
                'provider_id' => $providerId,
                'avatar_url' => $googleProfile['picture'] ?? null,
            ]);

            $user->forceFill(['email_verified_at' => now()])->save();

            $user->assignRole($type);

            if ($type === 'doctor') {
                Doctor::create([
                    'user_id' => $user->id,
                    'full_name' => $name,
                    'specialty' => [],
                    'status' => DoctorStatus::Draft->value,
                    'languages' => ['ar'],
                    'email' => $user->email,
                ]);
            }

            return $user;
        });
    }

    protected function ensureUserHasAvatarAndVerification(User $user, array $googleProfile): User
    {
        $updates = [];

        if (! $user->provider_name || ! $user->provider_id) {
            $updates['provider_name'] = 'google';
            $updates['provider_id'] = $googleProfile['sub'] ?? null;
        }

        if (($googleProfile['picture'] ?? null) && ! $user->avatar_url) {
            $updates['avatar_url'] = $googleProfile['picture'];
        }

        if (! $user->email_verified_at) {
            $updates['email_verified_at'] = now();
        }

        if (! empty($updates)) {
            $user->forceFill($updates)->save();
        }

        return $user;
    }
}
