<?php

namespace App\Providers;

use App\Support\FrontendUrlResolver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\Google\Client::class, function () {
            $client = new \Google\Client();
            if ($clientId = config('services.google.client_id')) {
                $client->setClientId($clientId);
            }

            return $client;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $resetLinkBuilder = static function (object $notifiable, string $token): string {
            $frontendUrl = rtrim(FrontendUrlResolver::resolve(), '/');

            $query = http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

            return "{$frontendUrl}/reset-password?{$query}";
        };

        ResetPassword::createUrlUsing($resetLinkBuilder);

        ResetPassword::toMailUsing(function (object $notifiable, string $token) use ($resetLinkBuilder) {
            $resetUrl = $resetLinkBuilder($notifiable, $token);
            $defaultPasswordBroker = (string) config('auth.defaults.passwords', 'users');
            $expiresInMinutes = (int) config("auth.passwords.{$defaultPasswordBroker}.expire", 60);

            return (new MailMessage())
                ->subject(__('رابط إعادة تعيين كلمة المرور'))
                ->view('emails.password-reset', [
                    'resetUrl' => $resetUrl,
                    'user' => $notifiable,
                    'appName' => config('app.name'),
                    'expiresInMinutes' => $expiresInMinutes,
                ]);
        });

        VerifyEmail::createUrlUsing(function (object $notifiable) {
            $expires = (int) config('auth.verification.expire', 60);

            $verificationUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes($expires),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            return FrontendUrlResolver::appendFrontendQuery($verificationUrl);
        });

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            $expires = (int) config('auth.verification.expire', 60);

            return (new MailMessage())
                ->subject(__('تأكيد البريد الإلكتروني'))
                ->view('emails.verify-email', [
                    'verificationUrl' => $url,
                    'user' => $notifiable,
                    'appName' => config('app.name'),
                    'expiresInMinutes' => $expires,
                ]);
        });
    }
}
