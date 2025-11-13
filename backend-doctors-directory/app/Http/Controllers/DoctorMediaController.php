<?php

namespace App\Http\Controllers;

use App\Http\Requests\Doctor\DoctorMediaRequest;
use App\Http\Resources\DoctorResource;
use Illuminate\Http\JsonResponse;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DoctorMediaController extends Controller
{
    public function store(DoctorMediaRequest $request): JsonResponse
    {
        /** @var \App\Models\Doctor|null $doctor */
        $doctor = $request->user()?->doctorProfile;

        if (! $doctor) {
            abort(404);
        }

        foreach ($request->file('files', []) as $file) {
            $doctor
                ->addMedia($file)
                ->preservingOriginal()
                ->toMediaCollection($request->string('collection')->toString());
        }

        return $this->respond(
            new DoctorResource($doctor->fresh(['media', 'clinics', 'categories'])),
            __('تم رفع الملفات بنجاح')
        );
    }

    public function destroy(Media $media): JsonResponse
    {
        /** @var \App\Models\Doctor|null $doctor */
        $doctor = request()->user()?->doctorProfile;

        if (! $doctor || $media->model_id !== $doctor->id || $media->model_type !== $doctor::class) {
            abort(403);
        }

        $media->delete();

        return $this->respond(null, __('تم حذف الملف'));
    }
}
