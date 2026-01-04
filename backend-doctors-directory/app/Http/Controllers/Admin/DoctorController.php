<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DoctorStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\User;
use App\Notifications\DoctorStatusUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Doctor::query()
            ->with(['clinics', 'categories', 'user', 'media'])
            ->withCount('favorites')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $value = $request->input('q');
            $query->where(function ($inner) use ($value): void {
                $inner
                    ->where('full_name', 'like', "%{$value}%")
                    ->orWhereJsonContains('specialty', $value)
                    ->orWhere('phone', 'like', "%{$value}%");
            });
        }

        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        $paginator = $query->paginate($request->integer('per_page', 20));

        $items = DoctorResource::collection($paginator->getCollection())->toArray($request);

        return $this->respondWithPagination($paginator, $items);
    }

    public function store(DoctorRequest $request): JsonResponse
    {
        [$doctor, $generatedPassword] = DB::transaction(function () use ($request): array {
            $doctor = Doctor::create($this->doctorAttributes($request));

            $doctor->categories()->sync($request->categories());
            $this->syncClinics($doctor, $request->clinics());
            $password = $this->ensureDoctorUser($doctor, $request);

            return [$doctor->fresh(['clinics', 'categories', 'media', 'user']), $password];
        });

        return $this->respond(
            [
                'doctor' => new DoctorResource($doctor),
                'generated_password' => $generatedPassword,
            ],
            __('تم إنشاء الطبيب بنجاح'),
            null,
            201,
        );
    }

    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load(['clinics', 'categories', 'media', 'user'])
            ->loadCount('favorites');

        return $this->respond(new DoctorResource($doctor));
    }

    public function update(DoctorRequest $request, Doctor $doctor): JsonResponse
    {
        [$doctor, $generatedPassword] = DB::transaction(function () use ($request, $doctor): array {
            $doctor->fill($this->doctorAttributes($request));
            $doctor->save();

            $doctor->categories()->sync($request->categories());
            $this->syncClinics($doctor, $request->clinics());
            $password = $this->ensureDoctorUser($doctor, $request);

            return [$doctor->fresh(['clinics', 'categories', 'media', 'user']), $password];
        });

        return $this->respond(
            [
                'doctor' => new DoctorResource($doctor),
                'generated_password' => $generatedPassword,
            ],
            __('تم تحديث بيانات الطبيب'),
        );
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete();

        return $this->respond(null, __('تم حذف الطبيب بنجاح'));
    }

    public function approve(Doctor $doctor): JsonResponse
    {
        $doctor->update([
            'status' => DoctorStatus::Approved->value,
            'status_note' => null,
            'is_verified' => true,
        ]);

        $this->notifyDoctorStatusChange($doctor);

        return $this->respond(new DoctorResource($doctor->fresh(['clinics', 'categories'])), __('تمت الموافقة على الطبيب'));
    }

    public function reject(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $doctor->update([
            'status' => DoctorStatus::Rejected->value,
            'status_note' => $validated['note'] ?? __('يرجى تحديث البيانات وإعادة الإرسال'),
            'is_verified' => false,
        ]);

        $this->notifyDoctorStatusChange($doctor);

        return $this->respond(new DoctorResource($doctor->fresh(['clinics', 'categories'])), __('تم رفض الطلب'));
    }

    protected function doctorAttributes(DoctorRequest $request): array
    {
        /** @var Collection<string, mixed> $attributes */
        $attributes = collect($request->validated())
            ->except(['categories', 'clinics']);

        $attributes['status'] = $attributes['status'] ?? DoctorStatus::Pending->value;
        $attributes['is_verified'] = (bool) ($attributes['is_verified'] ?? false);

        return $attributes->toArray();
    }

    /**
     * @param  list<array<string, mixed>>  $clinics
     */
    protected function syncClinics(Doctor $doctor, array $clinics): void
    {
        $payload = collect($clinics);

        $keepIds = $payload
            ->pluck('id')
            ->filter()
            ->values();

        Clinic::query()
            ->where('doctor_id', $doctor->id)
            ->whereNotIn('id', $keepIds)
            ->delete();

        $payload->each(function (array $clinicData) use ($doctor): void {
            $clinicId = $clinicData['id'] ?? null;
            $attributes = collect($clinicData)->only([
                'name',
                'address',
                'city',
                'lat',
                'lng',
                'work_hours',
            ])->toArray();

            if ($clinicId) {
                Clinic::query()
                    ->where('doctor_id', $doctor->id)
                    ->where('id', $clinicId)
                    ->update($attributes);
            } else {
                $doctor->clinics()->create($attributes);
            }
        });
    }

    protected function notifyDoctorStatusChange(Doctor $doctor): void
    {
        $doctor->loadMissing('user');

        if ($doctor->user) {
            $doctor->user->notify(new DoctorStatusUpdated($doctor));
        }
    }

    protected function ensureDoctorUser(Doctor $doctor, DoctorRequest $request): ?string
    {
        if ($doctor->user_id || $request->filled('user_id')) {
            return null;
        }

        $email = $request->input('email') ?: $request->input('appointment_email');

        if (! $email) {
            return null;
        }

        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            $doctor->update(['user_id' => $existingUser->id]);
            if (! $existingUser->hasRole('doctor')) {
                $existingUser->assignRole('doctor');
            }

            return null;
        }

        $password = Str::of('12345678')->shuffle()->toString();

        $user = User::create([
            'name' => $doctor->full_name,
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        $user->assignRole('doctor');

        $doctor->update(['user_id' => $user->id]);

        return $password;
    }
}
