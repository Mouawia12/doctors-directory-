<?php

use Database\Seeders\RoleSeeder;

it('registers a doctor and creates a pending profile', function (): void {
    $this->seed(RoleSeeder::class);

    $payload = [
        'name' => 'د. أحمد',
        'email' => 'doctor@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'type' => 'doctor',
    ];

    $response = $this->postJson('/api/auth/register', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.user.roles.0', 'doctor')
        ->assertJsonStructure([
            'data' => [
                'user',
                'token',
            ],
        ]);

    $this->assertDatabaseHas('doctors', [
        'full_name' => 'د. أحمد',
        'status' => 'pending',
    ]);
});
