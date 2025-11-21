<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->string('honorific_prefix')->nullable()->after('full_name');
            $table->string('first_name')->nullable()->after('honorific_prefix');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->nullable()->after('middle_name');
            $table->string('credentials_suffix')->nullable()->after('last_name');
            $table->string('preferred_pronouns')->nullable()->after('credentials_suffix');
            $table->enum('display_name_preference', ['personal', 'business'])->default('personal')->after('preferred_pronouns');
            $table->string('business_name')->nullable()->after('display_name_preference');
            $table->string('tagline', 160)->nullable()->after('business_name');
            $table->text('about_paragraph_one')->nullable()->after('bio');
            $table->text('about_paragraph_two')->nullable()->after('about_paragraph_one');
            $table->text('about_paragraph_three')->nullable()->after('about_paragraph_two');
            $table->string('new_clients_intro', 160)->nullable()->after('website');
            $table->enum('service_delivery', ['in_person', 'online', 'hybrid'])->nullable()->after('new_clients_intro');
            $table->enum('new_clients_status', ['accepting', 'not_accepting', 'waitlist'])->default('accepting')->after('service_delivery');
            $table->boolean('offers_intro_call')->default(false)->after('new_clients_status');
            $table->string('mobile_phone')->nullable()->after('phone');
            $table->boolean('mobile_can_text')->default(false)->after('mobile_phone');
            $table->string('appointment_email')->nullable()->after('email');
            $table->boolean('accepts_email_messages')->default(true)->after('appointment_email');
            $table->json('identity_traits')->nullable()->after('accepts_email_messages');
            $table->integer('fee_individual')->nullable()->after('identity_traits');
            $table->integer('fee_couples')->nullable()->after('fee_individual');
            $table->boolean('offers_sliding_scale')->default(false)->after('fee_couples');
            $table->json('payment_methods')->nullable()->after('offers_sliding_scale');
            $table->string('npi_number')->nullable()->after('payment_methods');
            $table->string('liability_carrier')->nullable()->after('npi_number');
            $table->date('liability_expiration')->nullable()->after('liability_carrier');
            $table->enum('licensure_status', ['licensed', 'supervised', 'unlicensed'])->default('licensed')->after('liability_expiration');
            $table->string('professional_role')->nullable()->after('licensure_status');
            $table->string('license_state')->nullable()->after('professional_role');
            $table->date('license_expiration')->nullable()->after('license_state');
            $table->string('qualifications_note', 300)->nullable()->after('license_expiration');
            $table->string('education_institution', 120)->nullable()->after('qualifications_note');
            $table->string('education_degree', 120)->nullable()->after('education_institution');
            $table->unsignedSmallInteger('education_graduation_year')->nullable()->after('education_degree');
            $table->unsignedSmallInteger('practice_start_year')->nullable()->after('education_graduation_year');
            $table->json('additional_credentials')->nullable()->after('practice_start_year');
            $table->string('specialties_note', 400)->nullable()->after('additional_credentials');
            $table->json('client_participants')->nullable()->after('specialties_note');
            $table->json('client_age_groups')->nullable()->after('client_participants');
            $table->string('faith_orientation')->nullable()->after('client_age_groups');
            $table->json('allied_communities')->nullable()->after('faith_orientation');
            $table->json('therapy_modalities')->nullable()->after('allied_communities');
            $table->string('treatment_note', 400)->nullable()->after('therapy_modalities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->dropColumn([
                'honorific_prefix',
                'first_name',
                'middle_name',
                'last_name',
                'credentials_suffix',
                'preferred_pronouns',
                'display_name_preference',
                'business_name',
                'tagline',
                'about_paragraph_one',
                'about_paragraph_two',
                'about_paragraph_three',
                'new_clients_intro',
                'service_delivery',
                'new_clients_status',
                'offers_intro_call',
                'mobile_phone',
                'mobile_can_text',
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
                'licensure_status',
                'professional_role',
                'license_state',
                'license_expiration',
                'qualifications_note',
                'education_institution',
                'education_degree',
                'education_graduation_year',
                'practice_start_year',
                'additional_credentials',
                'specialties_note',
                'client_participants',
                'client_age_groups',
                'faith_orientation',
                'allied_communities',
                'therapy_modalities',
                'treatment_note',
            ]);
        });
    }
};
