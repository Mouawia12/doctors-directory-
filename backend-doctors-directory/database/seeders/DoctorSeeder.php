<?php

namespace Database\Seeders;

use App\Enums\DoctorStatus;
use App\Models\Category;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Category::count() === 0) {
            $this->call(CategorySeeder::class);
        }

        $categories = Category::all();
        $doctorCount = (int) config('app.doctor_seed_count', 150);

        $this->createDemoDoctor($categories);

        Doctor::factory()
            ->count(max($doctorCount, 5))
            ->create()
            ->each(function (Doctor $doctor) use ($categories): void {
                $user = User::factory()->create([
                    'name' => $doctor->full_name,
                    'email' => $doctor->email ?? fake()->unique()->safeEmail(),
                ]);

                $user->assignRole('doctor');

                $doctor->user()->associate($user);
                $doctor->status = fake()->boolean(70) ? DoctorStatus::Approved->value : DoctorStatus::Pending->value;
                $doctor->is_verified = $doctor->status === DoctorStatus::Approved->value ? fake()->boolean(80) : false;
                $doctor->save();

                Clinic::factory()
                    ->count(fake()->numberBetween(1, 2))
                    ->create([
                        'doctor_id' => $doctor->id,
                        'city' => $doctor->city,
                        'lat' => $doctor->lat,
                        'lng' => $doctor->lng,
                    ]);

                $doctor->categories()->sync(
                    $categories->shuffle()->take(fake()->numberBetween(1, 3))->pluck('id')->toArray()
                );
            });

        // Create demo patients with favorites for testing the API.
        $demoUsers = User::factory()
            ->count(5)
            ->create()
            ->each(fn (User $user) => $user->assignRole('user'));

        $approvedDoctors = Doctor::approved()->get();

        foreach ($demoUsers as $user) {
            $user->favorites()->createMany(
                $approvedDoctors->shuffle()->take(fake()->numberBetween(2, 5))->map(fn (Doctor $doctor) => [
                    'doctor_id' => $doctor->id,
                ])->all()
            );
        }
    }

    protected function createDemoDoctor($categories): void
    {
        $demoUser = User::firstOrCreate(
            ['email' => 'doctor@doctors.local'],
            [
                'name' => 'Demo Doctor',
                'password' => Hash::make('password'),
            ]
        );

        $demoUser->assignRole('doctor');

        $doctor = Doctor::updateOrCreate(
            ['user_id' => $demoUser->id],
            [
                'full_name' => 'د. روان السبيعي',
                'honorific_prefix' => 'Dr.',
                'first_name' => 'Rawan',
                'last_name' => 'Alsubaie',
                'credentials_suffix' => 'PsyD',
                'preferred_pronouns' => 'She/Her',
                'display_name_preference' => 'personal',
                'business_name' => 'مركز توازن للصحة النفسية',
                'tagline' => 'أدعمك بخطة علاجية واضحة وواقعية لاستعادة توازن حياتك.',
                'bio' => 'معالجة نفسية مختصة في العلاج السلوكي المعرفي واضطرابات القلق مع نهج يرتكز على الدليل العلمي.',
                'about_paragraph_one' => 'أعمل مع البالغين ممن يواجهون قلقاً عالياً، إرهاقاً وظيفياً، أو تحديات في توازن العلاقات والحياة اليومية. أساعدك على التعرف على المحفزات وفهم جذور السلوكيات التي تعيق طاقتك.',
                'about_paragraph_two' => 'سنعمل معاً على خطوات عملية قصيرة وواضحة؛ من تدريبات على المهارات إلى إعادة بناء الحوار الداخلي وتخفيف حدة التفكير الكارثي. كل ما تحتاجه هو الالتزام بالمتابعة الأسبوعية.',
                'about_paragraph_three' => 'أقدم جلسات حضورية وعن بُعد مع إمكانية مكالمة تعارف مجانية. إذا شعرت أن الوقت قد حان لتقديم رعاية نفسية متخصصة لنفسك، راسلني لأجيب على أسئلتك الأولى.',
                'specialty' => 'اضطراب القلق العام',
                'sub_specialty' => 'إدارة القلق والاكتئاب',
                'qualifications' => ['ماجستير إرشاد نفسي', 'اعتماد CBT من Beck Institute'],
                'additional_credentials' => ['شهادة EMDR المعتمدة', 'عضوية الجمعية السعودية للصحة النفسية'],
                'license_number' => 'PSY-001-2024',
                'license_state' => 'الرياض - هيئة التخصصات الصحية',
                'license_expiration' => now()->addYear()->toDateString(),
                'professional_role' => 'أخصائي نفسي إكلينيكي',
                'licensure_status' => 'licensed',
                'languages' => ['ar', 'en'],
                'gender' => 'female',
                'years_of_experience' => 9,
                'insurances' => ['بوبا العربية', 'التعاونية للتأمين', 'جلسات أونلاين خاصة'],
                'service_delivery' => 'hybrid',
                'new_clients_status' => 'accepting',
                'new_clients_intro' => 'جلسات حضورية في الرياض وأونلاين طوال الأسبوع، مع إمكانية مكالمة تعريفية مجانية.',
                'offers_intro_call' => true,
                'city' => 'الرياض',
                'lat' => 24.7136,
                'lng' => 46.6753,
                'website' => 'https://demo-therapist.example.com',
                'phone' => '+966500000001',
                'mobile_phone' => '+966550000001',
                'mobile_can_text' => true,
                'whatsapp' => '+966500000001',
                'email' => 'doctor@doctors.local',
                'appointment_email' => 'appointments@demo-therapist.example.com',
                'accepts_email_messages' => true,
                'identity_traits' => [
                    'birth_year' => 1987,
                    'gender_identity' => ['أنثى'],
                    'ethnicity' => ['عربية'],
                    'religion' => 'إسلامي',
                    'lgbtqia' => ['حليف للمجتمع'],
                ],
                'fee_individual' => 450,
                'fee_couples' => 600,
                'offers_sliding_scale' => true,
                'payment_methods' => ['Visa', 'Mastercard', 'تحويل ACH', 'نقد'],
                'npi_number' => '1234567890',
                'liability_carrier' => 'Allianz Middle East',
                'liability_expiration' => now()->addMonths(10)->toDateString(),
                'qualifications_note' => 'خبرة 9 سنوات في CBT وEMDR مع تدريب معتمد دولياً.',
                'education_institution' => 'جامعة الملك سعود',
                'education_degree' => 'ماجستير إرشاد وعلاج نفسي',
                'education_graduation_year' => 2013,
                'practice_start_year' => 2014,
                'specialties_note' => 'أركز على القلق الحاد، الإرهاق المهني، وتعزيز مهارات التنظيم العاطفي.',
                'client_participants' => ['individuals', 'couples'],
                'client_age_groups' => ['teens', 'adults'],
                'faith_orientation' => 'إسلامي',
                'allied_communities' => ['مجتمع الميم', 'ضعاف السمع', 'العدالة العرقية'],
                'therapy_modalities' => [
                    'العلاج المعرفي السلوكي / Cognitive Behavioral Therapy (CBT)',
                    'العلاج بالاستثارة الثنائية (EMDR)',
                    'العلاج باليقظة الذهنية / Mindfulness-Based Therapy',
                ],
                'treatment_note' => 'أستخدم مزيجاً من CBT وEMDR مع خطط تعرض تدريجية وتمارين يقظة ذهنية بين الجلسات.',
                'is_verified' => true,
                'status' => DoctorStatus::Approved->value,
                'status_note' => null,
            ],
        );

        if ($categories->isNotEmpty()) {
            $doctor->categories()->sync(
                $categories->shuffle()->take(min(2, $categories->count()))->pluck('id')->toArray()
            );
        }

        Clinic::updateOrCreate(
            ['doctor_id' => $doctor->id, 'address' => 'طريق الملك فهد - مركز توازن'],
            [
                'city' => 'الرياض',
                'lat' => 24.7116,
                'lng' => 46.6743,
                'work_hours' => [
                    'sunday' => ['09:00-13:00', '17:00-21:00'],
                    'monday' => ['09:00-13:00', '17:00-21:00'],
                    'tuesday' => ['09:00-13:00', '17:00-21:00'],
                ],
            ],
        );
    }
}
