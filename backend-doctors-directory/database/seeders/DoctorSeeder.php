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
                'bio' => 'معالجة نفسية مختصة في العلاج السلوكي المعرفي واضطرابات القلق مع نهج يرتكز على الدليل العلمي.',
                'specialty' => 'العلاج السلوكي المعرفي',
                'sub_specialty' => 'إدارة القلق والاكتئاب',
                'qualifications' => ['ماجستير إرشاد نفسي', 'اعتماد CBT من Beck Institute'],
                'license_number' => 'PSY-001-2024',
                'languages' => ['ar', 'en'],
                'gender' => 'female',
                'years_of_experience' => 9,
                'insurances' => ['جلسات فردية حضورية', 'جلسات أونلاين'],
                'city' => 'الرياض',
                'lat' => 24.7136,
                'lng' => 46.6753,
                'website' => 'https://demo-therapist.example.com',
                'phone' => '+966500000001',
                'whatsapp' => '+966500000001',
                'email' => 'doctor@doctors.local',
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
