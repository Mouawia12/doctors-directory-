<?php

namespace Database\Factories;

use App\Enums\DoctorStatus;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    protected $model = Doctor::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $randomBool = function (int $probability = 50): bool {
            return random_int(1, 100) <= $probability;
        };
        $pickMany = function (array $items, int $min, int $max): array {
            $count = random_int($min, $max);
            $selection = Arr::random($items, $count);

            return is_array($selection) ? array_values($selection) : [$selection];
        };
        $optional = function (callable $callback, int $probability = 50) use ($randomBool) {
            return $randomBool($probability) ? $callback() : null;
        };
        $randomPhone = static fn (): string => '05'.str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        $randomUrl = static fn (): string => sprintf('https://clinic%s.example.com', random_int(100, 999));

        $arabicNames = [
            'د. سارة الحمادي',
            'د. فهد السبيعي',
            'د. نورة العتيبي',
            'د. ليان المطيري',
            'د. محمد الخطاف',
            'د. ريم القحطاني',
            'د. خالد الشهري',
            'د. غادة العنزي',
            'د. عبدالله الحربي',
            'د. شهد الأنصاري',
        ];

        $arabicBios = [
            'متخصص في بناء خطط علاجية شمولية تعزز التوازن النفسي.',
            'يدعم العملاء عبر جلسات تعزز الوعي الذاتي وتنظم الانفعالات.',
            'يركز على الممارسات العلاجية المستندة إلى الأدلة لمعالجة القلق.',
            'يساعد الأفراد على تطوير مهارات تواصل صحية وحدود واضحة.',
            'يعمل على تصميم تدخلات تناسب بيئات العمل المرهقة.',
            'يستخدم أساليب علاج سردي لمساعدة العملاء على إعادة صياغة التجارب المؤلمة.',
        ];

        $cities = [
            ['name' => 'الرياض', 'lat' => 24.7136, 'lng' => 46.6753],
            ['name' => 'جدة', 'lat' => 21.4858, 'lng' => 39.1925],
            ['name' => 'دبي', 'lat' => 25.276987, 'lng' => 55.296249],
            ['name' => 'الدوحة', 'lat' => 25.286106, 'lng' => 51.534817],
            ['name' => 'القاهرة', 'lat' => 30.0444, 'lng' => 31.2357],
            ['name' => 'عمان', 'lat' => 31.9539, 'lng' => 35.9106],
            ['name' => 'المنامة', 'lat' => 26.2235, 'lng' => 50.5876],
        ];

        $specialties = [
            'اضطراب القلق العام',
            'اضطراب الهلع',
            'الرهاب الاجتماعي',
            'الرهاب المحدد',
            'قلق الانفصال',
            'الاكتئاب الشديد',
            'الاكتئاب المستمر (ديستيميا)',
            'الاضطراب ثنائي القطب',
            'اضطراب ما بعد الصدمة',
            'الصدمة المعقدة',
            'اضطراب التكيّف',
            'اضطراب الوسواس القهري',
            'تشوّه صورة الجسد',
            'نتف الشعر',
            'قضم الأظافر',
            'القهم العصبي',
            'الشره العصبي',
            'نهم الأكل',
            'الأرق',
            'اضطرابات النوم المرتبطة بالضغط أو القلق',
            'إدمان المواد',
            'الإدمان السلوكي (الألعاب، التسوق، الجنس)',
            'الفصام',
            'الاضطراب الفصامي العاطفي',
            'الاضطراب الوهمي',
            'اضطراب فرط الحركة وتشتت الانتباه',
            'طيف التوحد',
            'صعوبات التعلّم',
            'اضطرابات التواصل',
            'اضطراب التحدّي والمعارضة',
            'اضطراب السلوك',
            'مشكلات التعلّق',
            'العلاقات المؤذية',
            'الاعتماد العاطفي',
            'انعدام الحدود',
            'تدنّي تقدير الذات',
            'نقد الذات المفرط',
            'ضياع الهوية',
            'العزلة الوجودية',
            'فقدان المعنى',
            'الحزن والفقد',
            'الاحتراق النفسي',
            'الضغوط المهنية',
            'صعوبات اتخاذ القرار',
            'مشكلات التواصل',
            'اضطراب القلق من المرض',
            'الاضطراب الجسدي الشكل',
        ];

        $subSpecialties = [
            'إدارة القلق والاكتئاب',
            'العلاج الجدلي السلوكي (DBT)',
            'العلاج الجماعي',
            'الدعم ما بعد الصدمة',
            'اضطرابات النوم',
            'العلاج بالفن واللعب',
        ];

        $professionalRoles = [
            'عالم نفس',
            'أخصائي نفسي إكلينيكي',
            'أخصائي نفسي إرشادي',
            'معالج زواجي وأسري',
            'معالج زواجي وأسري مُرخّص',
            'مستشار مهني مُرخّص',
            'مستشار صحة نفسية مُرخّص',
            'مستشار مهني–إكلينيكي مُرخّص',
            'أخصائي خدمة اجتماعية إكلينيكي مُرخّص',
            'أخصائي خدمة اجتماعية إكلينيكي',
            'معالج نفسي',
            'مستشار صحة نفسية',
        ];

        $selectedCity = Arr::random($cities);
        $specialty = Arr::random($specialties);
        $professionalRole = Arr::random($professionalRoles);
        $sessionTypes = ['in_person', 'online', 'hybrid'];
        $therapyModalities = [
            'العلاج المعرفي السلوكي / Cognitive Behavioral Therapy (CBT)',
            'العلاج الجدلي السلوكي / Dialectical Behavior Therapy (DBT)',
            'العلاج بالقبول والالتزام / Acceptance and Commitment Therapy (ACT)',
            'العلاج الأسري / Family Therapy',
            'العلاج السردي / Narrative Therapy',
            'العلاج باليقظة الذهنية / Mindfulness-Based Therapy',
            'العلاج السوماتي / Somatic Therapy',
            'العلاج بالتعريض المطوّل / Prolonged Exposure Therapy (PE)',
        ];
        $ageGroups = ['kids', 'teens', 'adults'];
        $insuranceProviders = [
            'التعاونية للتأمين',
            'بوبا العربية',
            'شركة ملاذ للتأمين',
            'تكافل الراجحي',
            'ميدغلف',
            'أكسا الخليج',
        ];
        $paymentMethods = ['Visa', 'Mastercard', 'مدى', 'تحويل بنكي', 'نقد', 'Apple Pay'];

        return [
            'full_name' => Arr::random($arabicNames),
            'bio' => Arr::random($arabicBios),
            'specialty' => $specialty,
            'sub_specialty' => $optional(fn () => Arr::random($subSpecialties)),
            'qualifications' => [
                Arr::random(['ماجستير إرشاد نفسي', 'دبلوم علاج معرفي سلوكي', 'شهادة EMDR']),
                Arr::random(['دبلوم العلاج الأسري', 'شهادة علاج الإدمان', 'اعتماد جلسات أونلاين']),
            ],
            'license_number' => sprintf(
                'LIC-%s-%s',
                str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT),
                str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT),
            ),
            'professional_role' => $professionalRole,
            'languages' => $pickMany(['ar', 'en'], 1, 2),
            'gender' => Arr::random(['male', 'female']),
            'years_of_experience' => random_int(3, 30),
            'service_delivery' => Arr::random($sessionTypes),
            'new_clients_status' => Arr::random(['accepting', 'not_accepting', 'waitlist']),
            'offers_intro_call' => $randomBool(60),
            'fee_individual' => random_int(200, 650),
            'fee_couples' => random_int(300, 800),
            'offers_sliding_scale' => $randomBool(30),
            'payment_methods' => $pickMany($paymentMethods, 2, 4),
            'insurances' => $pickMany($insuranceProviders, 1, 3),
            'therapy_modalities' => $pickMany($therapyModalities, 1, 4),
            'client_age_groups' => $pickMany($ageGroups, 1, 3),
            'city' => $selectedCity['name'],
            'lat' => round($selectedCity['lat'] + random_int(-50, 50) / 1000, 4),
            'lng' => round($selectedCity['lng'] + random_int(-50, 50) / 1000, 4),
            'website' => $optional($randomUrl, 40),
            'phone' => $randomPhone(),
            'whatsapp' => $randomPhone(),
            'email' => sprintf('%s@whoismypsychologist.com', Str::slug('doctor '.uniqid())),
            'is_verified' => $randomBool(70),
            'status' => Arr::random(DoctorStatus::values()),
            'status_note' => null,
        ];
    }

    public function approved(): self
    {
        return $this->state(fn () => [
            'status' => DoctorStatus::Approved->value,
            'is_verified' => true,
        ]);
    }

    public function pending(): self
    {
        return $this->state(fn () => [
            'status' => DoctorStatus::Pending->value,
            'is_verified' => false,
        ]);
    }
}
