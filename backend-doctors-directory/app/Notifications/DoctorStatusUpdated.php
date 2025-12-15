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
            'title_ar' => $parts['subject_ar'],
            'message' => $parts['message'],
            'message_ar' => $parts['message_ar'],
            'note' => $this->doctor->status_note,
        ];
    }

    /**
     * @return array{
     *     subject: string,
     *     subject_ar: string,
     *     message: string,
     *     message_ar: string
     * }
     */
    protected function messageParts(): array
    {
        $parts = match ($this->doctor->status) {
            DoctorStatus::Approved->value => [
                'subject_ar' => 'تمت الموافقة على حسابك كمعالج',
                'message_ar' => 'تمت مراجعة ملفك الطبي وتمت الموافقة عليه. حسابك أصبح مرئياً للمرضى ويمكنك استقبال الحجوزات.',
            ],
            DoctorStatus::Rejected->value => [
                'subject_ar' => 'نعتذر، نحتاج إلى بعض التعديلات',
                'message_ar' => 'بعد مراجعة ملفك، نحتاج إلى بعض التعديلات قبل النشر. راجع الملاحظات وأعد الإرسال متى كنت جاهزاً.',
            ],
            default => [
                'subject_ar' => 'تحديث على حالة حسابك',
                'message_ar' => 'تم تحديث حالة ملفك. يرجى مراجعة التفاصيل في لوحة التحكم.',
            ],
        };

        $parts['subject'] = $parts['subject_ar'];
        $parts['message'] = $parts['message_ar'];

        return $parts;
    }
}
