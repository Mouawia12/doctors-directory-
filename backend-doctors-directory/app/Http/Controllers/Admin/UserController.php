<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->with(['doctorProfile', 'favorites.doctor'])
            ->withCount('favorites')
            ->latest();

        if ($request->filled('q')) {
            $value = $request->input('q');
            $query->where(function ($inner) use ($value): void {
                $inner
                    ->where('name', 'like', "%{$value}%")
                    ->orWhere('email', 'like', "%{$value}%");
            });
        }

        if ($request->filled('role')) {
            $role = $request->string('role')->toString();
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        if ($request->filled('status')) {
            $status = $request->string('status')->toString();
            if ($status === 'disabled') {
                $query->where('is_disabled', true);
            } elseif ($status === 'active') {
                $query->where('is_disabled', false);
            }
        }

        $paginator = $query->paginate($request->integer('per_page', 15));
        $items = UserResource::collection($paginator->getCollection())->toArray($request);

        return $this->respondWithPagination($paginator, $items);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_disabled' => ['required', 'boolean'],
        ]);

        if ($request->user()?->id === $user->id) {
            return $this->respondWithError(
                ['user' => __('لا يمكن تعطيل حسابك الشخصي')],
                __('لا يمكن تعطيل هذا الحساب'),
                422
            );
        }

        $user->forceFill([
            'is_disabled' => (bool) $validated['is_disabled'],
        ])->save();

        if ($user->is_disabled) {
            $user->tokens()->delete();
        }

        $user->load(['doctorProfile', 'favorites.doctor'])->loadCount('favorites');

        return $this->respond(new UserResource($user), __('تم تحديث حالة المستخدم'));
    }

    public function storeAdmin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('admin');
        $user->forceFill(['email_verified_at' => now()])->save();
        $user->load('roles');

        return $this->respond(new UserResource($user), __('تم إنشاء حساب مشرف جديد'));
    }

    public function resetPassword(User $user): JsonResponse
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return $this->respond(null, __('تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني'));
        }

        return $this->respondWithError(['email' => __($status)], __('تعذر إرسال رابط إعادة التعيين'), 422);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->id === $user->id) {
            return $this->respondWithError(
                ['user' => __('لا يمكن حذف الحساب الجاري استخدامه')],
                __('فشل حذف الحساب'),
                422
            );
        }

        $user->tokens()->delete();
        $user->delete();

        return $this->respond(null, __('تم حذف المستخدم بنجاح'));
    }
}
