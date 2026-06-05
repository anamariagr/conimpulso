<?php

namespace Database\Seeders;

use App\Modules\Auth\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        $user = User::firstOrCreate(
            ['email' => 'admin@nexuslab.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('pas147'),
                'phone' => '+1234567890',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('super_admin');

        // Admin
        $user = User::firstOrCreate(
            ['email' => 'admin2@nexuslab.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone' => '+1234567891',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('admin');

        // Moderator
        $user = User::firstOrCreate(
            ['email' => 'moderator@nexuslab.com'],
            [
                'name' => 'Moderator User',
                'password' => Hash::make('password'),
                'phone' => '+1234567892',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('moderator');

        // Vendor (Test Seller)
        $user = User::firstOrCreate(
            ['email' => 'vendor@nexuslab.com'],
            [
                'name' => 'Test Vendor',
                'password' => Hash::make('password'),
                'phone' => '+1234567893',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('vendor');

        // Advisor (Test Advisor)
        $user = User::firstOrCreate(
            ['email' => 'advisor@nexuslab.com'],
            [
                'name' => 'Test Advisor',
                'password' => Hash::make('password'),
                'phone' => '+1234567894',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('advisor');

        // Client (Test Client)
        $user = User::firstOrCreate(
            ['email' => 'client@nexuslab.com'],
            [
                'name' => 'Test Client',
                'password' => Hash::make('password'),
                'phone' => '+1234567895',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('client');
    }
}