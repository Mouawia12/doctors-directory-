<?php

namespace Database\Factories;

use App\Enums\DoctorStatus;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

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
            'العلاج الفردي',
            'العلاج الأسري والزوجي',
            'العلاج السلوكي المعرفي',
            'علاج الإدمان والتأهيل',
            'اضطرابات الطفولة والمراهقة',
            'التأمل واليقظة الذهنية',
        ];

        $subSpecialties = [
            'إدارة القلق والاكتئاب',
            'العلاج الجدلي السلوكي (DBT)',
            'العلاج الجماعي',
            'الدعم ما بعد الصدمة',
            'اضطرابات النوم',
            'العلاج بالفن واللعب',
        ];

        $selectedCity = fake()->randomElement($cities);
        $specialty = fake()->randomElement($specialties);

        return [
            'full_name' => fake('ar_SA')->name(),
            'bio' => fake('ar_SA')->sentence().' متخصص في خطط علاجية مخصصة للصحة النفسية.',
            'specialty' => $specialty,
            'sub_specialty' => fake()->optional()->randomElement($subSpecialties),
            'qualifications' => [
                fake()->randomElement(['ماجستير إرشاد نفسي', 'دبلوم علاج معرفي سلوكي', 'شهادة EMDR']),
                fake()->randomElement(['دبلوم العلاج الأسري', 'شهادة علاج الإدمان', 'اعتماد جلسات أونلاين']),
            ],
            'license_number' => 'LIC-'.fake()->unique()->numerify('####-####'),
            'languages' => fake()->randomElements(['ar', 'en', 'fr'], fake()->numberBetween(1, 3)),
            'gender' => fake()->randomElement(['male', 'female']),
            'years_of_experience' => fake()->numberBetween(3, 30),
            'insurances' => fake()->randomElements([
                'جلسات فردية حضورية',
                'جلسات أونلاين',
                'برنامج دعم الشركات',
                'خطة تأهيل قصيرة المدى',
                'متابعة ما بعد العلاج',
            ], fake()->numberBetween(1, 3)),
            'city' => $selectedCity['name'],
            'lat' => $selectedCity['lat'] + fake()->randomFloat(4, -0.05, 0.05),
            'lng' => $selectedCity['lng'] + fake()->randomFloat(4, -0.05, 0.05),
            'website' => fake()->optional()->url(),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'is_verified' => fake()->boolean(70),
            'status' => fake()->randomElement(DoctorStatus::values()),
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
