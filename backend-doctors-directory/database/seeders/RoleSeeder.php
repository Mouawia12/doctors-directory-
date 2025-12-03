<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = collect([
            'admin',
            'doctor',
            'user',
        ])->map(fn (string $role) => Role::firstOrCreate(['name' => $role]));

        $admin = User::firstOrCreate(
            ['email' => 'ymouawia10@yahoo.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->forceFill(['email_verified_at' => now()])->save();
        $admin->assignRole('admin');

        $demoUser = User::firstOrCreate(
            ['email' => 'user@doctors.local'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );
        $demoUser->assignRole('user');
    }
}
