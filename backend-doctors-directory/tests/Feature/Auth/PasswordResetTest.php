<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/forgot-password', ['email' => $user->email]);

        $response->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (object $notification) use ($user) {
            $response = $this->postJson('/api/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertStatus(200);

            return true;
        });
    }

    public function test_reset_link_uses_remembered_frontend(): void
    {
        Notification::fake();
        config([
            'app.frontend_url' => 'https://default.test',
            'app.frontend_urls' => ['https://default.test', 'https://frontend.example'],
        ]);

        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->withHeader('Origin', 'https://frontend.example')
            ->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);
            $this->assertStringStartsWith('https://frontend.example/reset-password?', $mail->viewData['resetUrl']);

            return true;
        });
    }

    public function test_reset_link_falls_back_to_default_for_invalid_origin(): void
    {
        Notification::fake();
        config([
            'app.frontend_url' => 'https://default.test',
            'app.frontend_urls' => ['https://default.test'],
        ]);

        $user = User::factory()->create(['email' => 'test2@example.com']);

        $this->withHeader('Origin', 'https://malicious.example')
            ->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);
            $this->assertStringStartsWith('https://default.test/reset-password?', $mail->viewData['resetUrl']);

            return true;
        });
    }
}
