<?php

namespace App\Notifications;

use App\Enums\DoctorStatus;
use App\Models\Doctor;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoctorStatusUpdated extends Notification
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
        $parts = $this->messageParts();

        $portalUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/').'/doctor';

        return (new MailMessage())
            ->subject($parts['subject'])
            ->view('emails.doctor-status', [
                'user' => $notifiable,
                'doctor' => $this->doctor,
                'subject' => $parts['subject'],
                'subjectAr' => $parts['subject_ar'],
                'subjectEn' => $parts['subject_en'],
                'messageBody' => $parts['message'],
                'messageAr' => $parts['message_ar'],
                'messageEn' => $parts['message_en'],
                'note' => $this->doctor->status_note,
                'portalUrl' => $portalUrl,
                'appName' => config('app.name'),
            ]);
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $parts = $this->messageParts();

        return [
            'doctor_id' => $this->doctor->id,
            'status' => $this->doctor->status,
            'title' => $parts['subject'],
            'title_en' => $parts['subject_en'],
            'title_ar' => $parts['subject_ar'],
            'message' => $parts['message'],
            'message_en' => $parts['message_en'],
            'message_ar' => $parts['message_ar'],
            'note' => $this->doctor->status_note,
        ];
    }

    /**
     * @return array{
     *     subject: string,
     *     subject_ar: string,
     *     subject_en: string,
     *     message: string,
     *     message_ar: string,
     *     message_en: string
     * }
     */
    protected function messageParts(): array
    {
        $parts = match ($this->doctor->status) {
            DoctorStatus::Approved->value => [
                'subject_ar' => 'تمت الموافقة على حسابك كمعالج',
                'subject_en' => 'Your doctor profile was approved',
                'message_ar' => 'تمت مراجعة ملفك الطبي وتمت الموافقة عليه. حسابك أصبح مرئياً للمرضى ويمكنك استقبال الحجوزات.',
                'message_en' => 'Your profile has been reviewed and approved. Your listing is now visible to patients so you can start receiving bookings.',
            ],
            DoctorStatus::Rejected->value => [
                'subject_ar' => 'نعتذر، نحتاج إلى بعض التعديلات',
                'subject_en' => 'Your doctor profile needs updates',
                'message_ar' => 'بعد مراجعة ملفك، نحتاج إلى بعض التعديلات قبل النشر. راجع الملاحظات وأعد الإرسال متى كنت جاهزاً.',
                'message_en' => 'We need a few updates before your profile can go live. Please review the notes from the team and resubmit when ready.',
            ],
            default => [
                'subject_ar' => 'تحديث على حالة حسابك',
                'subject_en' => 'Your doctor profile was updated',
                'message_ar' => 'تم تحديث حالة ملفك. يرجى مراجعة التفاصيل في لوحة التحكم.',
                'message_en' => 'Your profile status has been updated. Please review the details in your portal.',
            ],
        };

        $parts['subject'] = "{$parts['subject_ar']} | {$parts['subject_en']}";
        $parts['message'] = "{$parts['message_ar']} | {$parts['message_en']}";

        return $parts;
    }
}
