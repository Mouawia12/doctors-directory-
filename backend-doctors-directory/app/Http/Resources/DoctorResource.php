<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Doctor
 *
 * @property int|null $user_id
 */
class DoctorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var \App\Models\Doctor $doctor */
        $doctor = $this->resource;
        $user = $request->user();
        $isFavorite = false;

        if (isset($this->is_favorite)) {
            $isFavorite = (bool) $this->is_favorite;
        } elseif ($user && $this->relationLoaded('favorites')) {
            /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Favorite> $favorites */
            $favorites = $doctor->favorites;
            $isFavorite = $favorites->contains(fn (\App\Models\Favorite $favorite) => $favorite->user_id === $user->id);
        }

        $mediaLoaded = $doctor->relationLoaded('media');
        $documents = $mediaLoaded
            ? $doctor->media->where('collection_name', 'documents')
            : collect();
        $gallery = $mediaLoaded
            ? $doctor->media->where('collection_name', 'gallery')
            : collect();

        return [
            'id' => $doctor->id,
            'full_name' => $doctor->full_name,
            'bio' => $doctor->bio,
            'specialty' => $doctor->specialty,
            'sub_specialty' => $doctor->sub_specialty,
            'qualifications' => $doctor->qualifications,
            'license_number' => $doctor->license_number,
            'languages' => $doctor->languages,
            'gender' => $doctor->gender,
            'years_of_experience' => $doctor->years_of_experience,
            'insurances' => $doctor->insurances,
            'city' => $doctor->city,
            'lat' => $doctor->lat,
            'lng' => $doctor->lng,
            'website' => $doctor->website,
            'phone' => $doctor->phone,
            'whatsapp' => $doctor->whatsapp,
            'email' => $doctor->email,
            'is_verified' => $doctor->is_verified,
            'status' => $doctor->status,
            'status_note' => $doctor->status_note,
            'favorites_count' => $this->whenCounted('favorites'),
            'is_favorite' => $isFavorite,
            'clinics' => ClinicResource::collection($this->whenLoaded('clinics')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'user' => $this->whenLoaded('user', fn () => $doctor->user ? new UserResource($doctor->user) : null),
            'media' => [
                'documents' => $documents->map(fn ($media) => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'url' => $media->getFullUrl(),
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                ]),
                'gallery' => $gallery->map(fn ($media) => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'url' => $media->getFullUrl(),
                    'thumb_url' => $media->hasGeneratedConversion('thumb')
                        ? $media->getFullUrl('thumb')
                        : $media->getFullUrl(),
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                ]),
            ],
            'created_at' => $doctor->created_at?->toIso8601String(),
            'updated_at' => $doctor->updated_at?->toIso8601String(),
        ];
    }
}
