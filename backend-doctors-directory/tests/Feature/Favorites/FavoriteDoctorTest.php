<?php

use App\Models\Doctor;
use App\Models\User;
use Database\Seeders\RoleSeeder;

it('allows a user to add and list favorites', function (): void {
    $this->seed(RoleSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('user');

    $doctor = Doctor::factory()->approved()->create();

    $this->actingAs($user);

    $this->postJson("/api/doctors/{$doctor->id}/favorite")
        ->assertOk();

    $this->assertDatabaseHas('favorites', [
        'user_id' => $user->id,
        'doctor_id' => $doctor->id,
    ]);

    $this->getJson('/api/favorites')
        ->assertOk()
        ->assertJsonPath('data.pagination.total', 1);
});
