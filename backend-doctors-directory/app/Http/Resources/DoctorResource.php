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
        $avatar = $mediaLoaded
            ? $doctor->media->firstWhere('collection_name', 'avatar')
            : null;
        $introVideo = $mediaLoaded
            ? $doctor->media->firstWhere('collection_name', 'intro_video')
            : null;

        return [
            'id' => $doctor->id,
            'full_name' => $doctor->full_name,
            'honorific_prefix' => $doctor->honorific_prefix,
            'first_name' => $doctor->first_name,
            'middle_name' => $doctor->middle_name,
            'last_name' => $doctor->last_name,
            'credentials_suffix' => $doctor->credentials_suffix,
            'preferred_pronouns' => $doctor->preferred_pronouns,
            'display_name_preference' => $doctor->display_name_preference,
            'business_name' => $doctor->business_name,
            'tagline' => $doctor->tagline,
            'bio' => $doctor->bio,
            'about_paragraph_one' => $doctor->about_paragraph_one,
            'about_paragraph_two' => $doctor->about_paragraph_two,
            'about_paragraph_three' => $doctor->about_paragraph_three,
            'specialty' => $doctor->specialty,
            'sub_specialty' => $doctor->sub_specialty,
            'qualifications' => $doctor->qualifications,
            'additional_credentials' => $doctor->additional_credentials,
            'license_number' => $doctor->license_number,
            'license_state' => $doctor->license_state,
            'license_expiration' => $doctor->license_expiration?->toDateString(),
            'professional_role' => $doctor->professional_role,
            'licensure_status' => $doctor->licensure_status,
            'languages' => $doctor->languages,
            'gender' => $doctor->gender,
            'years_of_experience' => $doctor->years_of_experience,
            'new_clients_intro' => $doctor->new_clients_intro,
            'service_delivery' => $doctor->service_delivery,
            'new_clients_status' => $doctor->new_clients_status,
            'offers_intro_call' => $doctor->offers_intro_call,
            'insurances' => $doctor->insurances,
            'identity_traits' => $doctor->identity_traits,
            'payment_methods' => $doctor->payment_methods,
            'fee_individual' => $doctor->fee_individual,
            'fee_couples' => $doctor->fee_couples,
            'offers_sliding_scale' => $doctor->offers_sliding_scale,
            'npi_number' => $doctor->npi_number,
            'liability_carrier' => $doctor->liability_carrier,
            'liability_expiration' => $doctor->liability_expiration?->toDateString(),
            'city' => $doctor->city,
            'lat' => $doctor->lat,
            'lng' => $doctor->lng,
            'website' => $doctor->website,
            'phone' => $doctor->phone,
            'mobile_phone' => $doctor->mobile_phone,
            'mobile_can_text' => $doctor->mobile_can_text,
            'whatsapp' => $doctor->whatsapp,
            'email' => $doctor->email,
            'appointment_email' => $doctor->appointment_email,
            'accepts_email_messages' => $doctor->accepts_email_messages,
            'qualifications_note' => $doctor->qualifications_note,
            'education_institution' => $doctor->education_institution,
            'education_degree' => $doctor->education_degree,
            'education_graduation_year' => $doctor->education_graduation_year,
            'practice_start_year' => $doctor->practice_start_year,
            'specialties_note' => $doctor->specialties_note,
            'client_participants' => $doctor->client_participants,
            'client_age_groups' => $doctor->client_age_groups,
            'faith_orientation' => $doctor->faith_orientation,
            'allied_communities' => $doctor->allied_communities,
            'therapy_modalities' => $doctor->therapy_modalities,
            'treatment_note' => $doctor->treatment_note,
            'is_verified' => $doctor->is_verified,
            'status' => $doctor->status,
            'status_note' => $doctor->status_note,
            'favorites_count' => $this->whenCounted('favorites'),
            'is_favorite' => $isFavorite,
            'clinics' => ClinicResource::collection($this->whenLoaded('clinics')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'user' => $this->whenLoaded('user', fn () => $doctor->user ? new UserResource($doctor->user) : null),
            'media' => [
                'avatar' => $avatar
                    ? [
                        'id' => $avatar->id,
                        'name' => $avatar->name,
                        'url' => $avatar->getFullUrl(),
                        'mime_type' => $avatar->mime_type,
                        'size' => $avatar->size,
                    ]
                    : null,
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
                'intro_video' => $introVideo
                    ? [
                        'id' => $introVideo->id,
                        'name' => $introVideo->name,
                        'url' => $introVideo->getFullUrl(),
                        'mime_type' => $introVideo->mime_type,
                        'size' => $introVideo->size,
                    ]
                    : null,
            ],
            'created_at' => $doctor->created_at?->toIso8601String(),
            'updated_at' => $doctor->updated_at?->toIso8601String(),
        ];
    }
}
