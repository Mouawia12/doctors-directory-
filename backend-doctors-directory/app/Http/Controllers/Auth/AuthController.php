<?php

namespace App\Http\Controllers\Auth;

use App\Enums\DoctorStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
            ]);

            $role = $request->string('type')->toString();
            $user->assignRole($role);

            if ($role === 'doctor') {
                Doctor::create([
                    'user_id' => $user->id,
                    'full_name' => $user->name,
                    'specialty' => 'غير محدد',
                    'status' => DoctorStatus::Draft->value,
                    'languages' => ['ar'],
                ]);
            }

            return $user->load('doctorProfile');
        });

        $token = $user->createToken('spa')->plainTextToken;

        return $this->respond(
            [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            __('تم إنشاء الحساب بنجاح'),
            status: 201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        /** @var \App\Models\User $user */
        $user = $request->user();
        $token = $user->createToken('spa')->plainTextToken;

        return $this->respond([
            'user' => new UserResource($user->load('doctorProfile')),
            'token' => $token,
        ], __('تم تسجيل الدخول بنجاح'));
    }

    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (! $user) {
            return $this->respondWithError(['auth' => __('غير مصرح')], __('يجب تسجيل الدخول'), 401);
        }

        return $this->respond(new UserResource($user->load('doctorProfile')));
    }

    public function logout(): JsonResponse
    {
        /** @var Request $request */
        $request = request();
        $token = $request->user()?->currentAccessToken();
        $token?->delete();

        return $this->respond(null, __('تم تسجيل الخروج'));
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return $this->respondWithError(
                ['current_password' => [__('كلمة المرور الحالية غير صحيحة')]],
                __('كلمة المرور الحالية غير صحيحة'),
                422
            );
        }

        $user->forceFill([
            'password' => Hash::make($request->input('password')),
        ])->save();

        return $this->respond(null, __('تم تحديث كلمة المرور'));
    }
}
