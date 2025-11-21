<?php

namespace App\Models;

use App\Enums\DoctorStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Doctor extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'full_name',
        'honorific_prefix',
        'first_name',
        'middle_name',
        'last_name',
        'credentials_suffix',
        'preferred_pronouns',
        'display_name_preference',
        'business_name',
        'tagline',
        'bio',
        'about_paragraph_one',
        'about_paragraph_two',
        'about_paragraph_three',
        'specialty',
        'sub_specialty',
        'qualifications',
        'additional_credentials',
        'license_number',
        'license_state',
        'license_expiration',
        'languages',
        'gender',
        'years_of_experience',
        'professional_role',
        'licensure_status',
        'insurances',
        'service_delivery',
        'new_clients_status',
        'offers_intro_call',
        'new_clients_intro',
        'city',
        'lat',
        'lng',
        'website',
        'phone',
        'mobile_phone',
        'mobile_can_text',
        'whatsapp',
        'email',
        'appointment_email',
        'accepts_email_messages',
        'identity_traits',
        'fee_individual',
        'fee_couples',
        'offers_sliding_scale',
        'payment_methods',
        'npi_number',
        'liability_carrier',
        'liability_expiration',
        'qualifications_note',
        'education_institution',
        'education_degree',
        'education_graduation_year',
        'practice_start_year',
        'specialties_note',
        'client_participants',
        'client_age_groups',
        'faith_orientation',
        'allied_communities',
        'therapy_modalities',
        'treatment_note',
        'is_verified',
        'status',
        'status_note',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qualifications' => 'array',
            'additional_credentials' => 'array',
            'languages' => 'array',
            'insurances' => 'array',
            'identity_traits' => 'array',
            'payment_methods' => 'array',
            'client_participants' => 'array',
            'client_age_groups' => 'array',
            'allied_communities' => 'array',
            'therapy_modalities' => 'array',
            'is_verified' => 'boolean',
            'offers_intro_call' => 'boolean',
            'mobile_can_text' => 'boolean',
            'accepts_email_messages' => 'boolean',
            'offers_sliding_scale' => 'boolean',
            'years_of_experience' => 'integer',
            'fee_individual' => 'integer',
            'fee_couples' => 'integer',
            'education_graduation_year' => 'integer',
            'practice_start_year' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
            'liability_expiration' => 'date',
            'license_expiration' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clinics(): HasMany
    {
        return $this->hasMany(Clinic::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_doctor')->withTimestamps();
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', DoctorStatus::Approved->value);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk(config('media-library.disk_name', 'public'))
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
            ->singleFile();

        $this->addMediaCollection('avatar')
            ->useDisk(config('media-library.disk_name', 'public'))
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->singleFile();

        $this->addMediaCollection('intro_video')
            ->useDisk(config('media-library.disk_name', 'public'))
            ->acceptsMimeTypes(['video/mp4', 'video/quicktime'])
            ->singleFile();

        $this->addMediaCollection('gallery')
            ->useDisk(config('media-library.disk_name', 'public'))
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->performOnCollections('gallery', 'avatar')
            ->nonQueued();
    }
}
