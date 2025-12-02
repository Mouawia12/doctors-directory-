<?php

namespace App\Notifications;

use App\Enums\DoctorStatus;
use App\Models\Doctor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoctorStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Doctor $doctor)
    {
        $this->doctor->loadMissing('user');
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        [$subject, $message] = $this->messageParts();

        $portalUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/').'/doctor';

        $mailMessage = (new MailMessage())
            ->subject($subject)
            ->greeting(__('Hello :name', ['name' => $notifiable->name]))
            ->line($message)
            ->action(__('Open doctor portal'), $portalUrl);

        if ($this->doctor->status === DoctorStatus::Rejected->value && $this->doctor->status_note) {
            $mailMessage->line(__('Review note: :note', ['note' => $this->doctor->status_note]));
        }

        return $mailMessage->line(__('Thank you for being part of Doctors Directory.'));
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        [$subject, $message] = $this->messageParts();

        return [
            'doctor_id' => $this->doctor->id,
            'status' => $this->doctor->status,
            'title' => $subject,
            'message' => $message,
            'note' => $this->doctor->status_note,
        ];
    }

    /**
     * @return array{0: string, 1: string}
     */
    protected function messageParts(): array
    {
        return match ($this->doctor->status) {
            DoctorStatus::Approved->value => [
                __('Your doctor profile was approved'),
                __('Your listing is now visible to patients. Keep your data up to date to maintain trust.'),
            ],
            DoctorStatus::Rejected->value => [
                __('Your doctor profile needs updates'),
                __('Please review the admin notes and update your information before resubmitting.'),
            ],
            default => [
                __('Your doctor profile was updated'),
                __('Your profile status has changed.'),
            ],
        };
    }
}
