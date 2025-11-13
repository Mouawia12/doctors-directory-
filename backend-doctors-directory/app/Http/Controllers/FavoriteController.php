<?php

namespace App\Http\Controllers;

use App\Enums\DoctorStatus;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();

        if (! $user) {
            abort(401);
        }

        $paginator = $user->favorites()
            ->with(['doctor.clinics', 'doctor.categories'])
            ->paginate(request()->integer('per_page', 12));

        /** @var \Illuminate\Support\Collection<int, Favorite> $favorites */
        $favorites = $paginator->getCollection();

        $items = $favorites->map(function (Favorite $favorite) {
            if ($favorite->doctor) {
                $favorite->doctor->setAttribute('is_favorite', true);
            }

            return (new DoctorResource($favorite->doctor))->toArray(request());
        })->all();

        return $this->respondWithPagination($paginator, $items);
    }

    public function store(Doctor $doctor): JsonResponse
    {
        $user = request()->user();

        if (! $user) {
            abort(401);
        }

        if ($doctor->status !== DoctorStatus::Approved->value) {
            return $this->respondWithError(['doctor' => __('لا يمكن حفظ طبيب غير معتمد')], status: 422);
        }

        $user->favorites()->firstOrCreate([
            'doctor_id' => $doctor->id,
        ]);

        return $this->respond(null, __('تمت الإضافة إلى المفضلة'));
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $user = request()->user();

        if (! $user) {
            abort(401);
        }

        $user->favorites()->where('doctor_id', $doctor->id)->delete();

        return $this->respond(null, __('تمت إزالة الطبيب من المفضلة'));
    }
}
