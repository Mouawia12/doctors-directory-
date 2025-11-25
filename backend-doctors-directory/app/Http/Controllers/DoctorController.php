<?php

namespace App\Http\Controllers;

use App\Enums\DoctorStatus;
use App\Http\Requests\Doctor\DoctorSearchRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class DoctorController extends Controller
{
    public function index(DoctorSearchRequest $request): JsonResponse
    {
        $filters = $request->filters();

        $query = Doctor::query()
            ->with([
                'clinics',
                'categories',
                'media' => fn ($q) => $q->whereIn('collection_name', ['gallery', 'avatar']),
            ])
            ->withCount('favorites')
            ->latest();

        $user = $request->user();

        if ($user) {
            $query->withExists([
                'favorites as is_favorite' => fn ($favoriteQuery) => $favoriteQuery->where('user_id', $user->id),
            ]);
        }

        if (! $user || ! $user->hasRole('admin')) {
            $query->where('status', DoctorStatus::Approved->value);
        } elseif (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $query
            ->when(Arr::get($filters, 'q'), function ($q, $value) {
                $q->where(function ($inner) use ($value) {
                    $inner
                        ->where('full_name', 'like', "%{$value}%")
                        ->orWhere('bio', 'like', "%{$value}%");
                });
            })
            ->when(Arr::get($filters, 'city'), fn ($q, $city) => $q->where('city', $city))
            ->when(Arr::get($filters, 'specialty'), fn ($q, $specialty) => $q->where('specialty', $specialty))
            ->when(Arr::get($filters, 'sub_specialty'), fn ($q, $value) => $q->where('sub_specialty', $value))
            ->when(Arr::get($filters, 'gender'), fn ($q, $gender) => $q->where('gender', $gender))
            ->when(Arr::get($filters, 'languages'), fn ($q, $languages) => $q->where(function ($inner) use ($languages) {
                foreach ($languages as $language) {
                    $inner->whereJsonContains('languages', $language);
                }
            }))
            ->when(Arr::get($filters, 'insurance'), fn ($q, $insurance) => $q->whereJsonContains('insurances', $insurance))
            ->when(Arr::get($filters, 'min_exp'), fn ($q, $exp) => $q->where('years_of_experience', '>=', $exp))
            ->when($request->boolean('has_media'), fn ($q) => $q->whereHas('media'))
            ->orderBy('is_verified', 'desc');

        $lat = Arr::get($filters, 'lat');
        $lng = Arr::get($filters, 'lng');

        if ($lat !== null && $lng !== null) {
            $radius = Arr::get($filters, 'radius', 25);
            $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))';

            $query
                ->selectRaw('doctors.*, '.$haversine.' AS distance', [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
        }

        $perPage = (int) $request->input('per_page', 12);
        $paginator = $query->paginate($perPage)->appends($request->query());

        $items = DoctorResource::collection($paginator->getCollection())->toArray($request);

        return $this->respondWithPagination($paginator, $items);
    }

    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load(['clinics', 'categories', 'media'])
            ->loadCount('favorites');

        $user = request()->user();

        if (
            $doctor->status !== DoctorStatus::Approved->value
            && (! $user || (! $user->hasRole('admin') && $user->id !== $doctor->user_id))
        ) {
            abort(404);
        }

        if ($user) {
            $doctor->setAttribute(
                'is_favorite',
                $doctor->favorites()->where('user_id', $user->id)->exists()
            );
        }

        return $this->respond(new DoctorResource($doctor));
    }
}
