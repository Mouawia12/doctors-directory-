<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
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
            $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
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
    }
}
