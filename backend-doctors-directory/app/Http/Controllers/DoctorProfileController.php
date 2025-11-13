<?php

namespace App\Http\Controllers;

use App\Enums\DoctorStatus;
use App\Http\Requests\Doctor\DoctorProfileRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Clinic;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DoctorProfileController extends Controller
{
    public function show(): JsonResponse
    {
        /** @var Doctor|null $doctor */
        $doctor = request()->user()?->doctorProfile;

        if (! $doctor) {
            return $this->respond(null, __('لم يتم إنشاء الملف بعد'));
        }

        $doctor->load(['clinics', 'categories', 'media']);

        return $this->respond(new DoctorResource($doctor));
    }

    public function store(DoctorProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $doctor = DB::transaction(function () use ($request, $user): Doctor {
            /** @var Doctor|null $existingDoctor */
            $existingDoctor = $user->doctorProfile;
            $doctor = $existingDoctor ?? new Doctor(['user_id' => $user->id]);
            $doctor->fill($request->validated());
            $doctor->status = DoctorStatus::Pending->value;
            $doctor->status_note = null;
            $doctor->is_verified = false;
            $doctor->save();

            $doctor->categories()->sync($request->categories());

            $this->syncClinics($doctor, $request->clinics());

            return $doctor->fresh(['clinics', 'categories', 'media']);
        });

        return $this->respond(new DoctorResource($doctor), __('تم تحديث الملف، بانتظار اعتماد الإدارة'));
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
}
