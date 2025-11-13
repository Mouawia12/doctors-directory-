<?php

namespace Database\Factories;

use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Clinic>
 */
class ClinicFactory extends Factory
{
    protected $model = Clinic::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $workHours = [
            'sunday' => ['09:00', '17:00'],
            'monday' => ['09:00', '17:00'],
            'tuesday' => ['09:00', '17:00'],
            'wednesday' => ['09:00', '17:00'],
            'thursday' => ['09:00', '14:00'],
        ];

        return [
            'address' => fake('ar_SA')->streetAddress(),
            'city' => fake()->randomElement(['الرياض', 'جدة', 'دبي', 'الدوحة', 'القاهرة']),
            'lat' => fake()->latitude(20, 35),
            'lng' => fake()->longitude(30, 55),
            'work_hours' => $workHours,
        ];
    }
}
