<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect($this->verificationRedirectUrl('verified'));
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->get($verificationUrl)->assertRedirect($this->verificationRedirectUrl('invalid-link'));

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_verification_redirects_to_remembered_frontend(): void
    {
        config([
            'app.frontend_url' => 'https://default.test',
            'app.frontend_urls' => ['https://default.test', 'https://frontend.example'],
        ]);

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->withHeader('Origin', 'https://frontend.example')
            ->postJson('/api/email/verification-notification')
            ->assertOk();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        ).'&frontend_url=https://malicious.example';

        $this->get($verificationUrl)->assertRedirect('https://frontend.example/verify-email/success?status=verified');
    }

    public function test_email_verification_redirects_to_default_when_frontend_missing(): void
    {
        config([
            'app.frontend_url' => 'https://default.test',
            'app.frontend_urls' => ['https://default.test'],
        ]);

        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->get($verificationUrl)->assertRedirect('https://default.test/verify-email/success?status=verified');
    }

    public function test_unapproved_frontend_is_rejected(): void
    {
        config([
            'app.frontend_url' => 'https://default.test',
            'app.frontend_urls' => ['https://default.test'],
        ]);

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->withHeader('Origin', 'https://malicious.example')
            ->postJson('/api/email/verification-notification')
            ->assertOk();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->get($verificationUrl)->assertRedirect('https://default.test/verify-email/success?status=verified');
    }

    protected function verificationRedirectUrl(string $status): string
    {
        $base = rtrim((string) config('app.frontend_url', config('app.url')), '/').'/verify-email/success';

        return "{$base}?status={$status}";
    }
}
