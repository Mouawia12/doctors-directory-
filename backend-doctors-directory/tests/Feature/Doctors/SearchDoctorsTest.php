<?php

use App\Models\Doctor;

it('filters doctors by city and specialty', function (): void {
    $match = Doctor::factory()->approved()->create([
        'city' => 'الرياض',
        'specialty' => ['طب الأسرة'],
    ]);

    Doctor::factory()->approved()->create([
        'city' => 'جدة',
        'specialty' => ['جلدية'],
    ]);

    $query = http_build_query([
        'city' => 'الرياض',
        'specialty' => 'طب الأسرة',
    ]);

    $response = $this->getJson('/api/doctors?'.$query);

    $response
        ->assertOk()
        ->assertJsonPath('data.pagination.total', 1)
        ->assertJsonPath('data.items.0.id', $match->id);
});
