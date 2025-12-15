<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName ?? config('app.name') }} - إعادة تعيين كلمة المرور</title>
</head>
<body style="background-color:#f4f6fb;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0f172a;direction:rtl;text-align:center;">
    <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:24px;padding:32px;box-shadow:0 10px 40px rgba(15,23,42,0.08);text-align:center;">
        <div style="margin-bottom:24px;">
            <p style="margin:0;color:#64748b;font-size:13px;">{{ $appName ?? config('app.name') }}</p>
            <h1 style="margin:8px 0 0;font-size:22px;color:#0f172a;">إعادة تعيين كلمة المرور</h1>
        </div>
        <div style="margin-bottom:24px;line-height:1.7;font-size:15px;color:#334155;">
            <p style="margin-bottom:12px;">مرحباً {{ $user->name ?? 'صديقنا' }},</p>
            <p style="margin:0;">
                استلمنا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
                اضغط على الزر التالي لإنشاء كلمة مرور جديدة.
                ينتهي الرابط خلال {{ $expiresInMinutes }} دقيقة لضمان حمايتك.
            </p>
        </div>
        <div style="text-align:center;margin-bottom:28px;">
            <a href="{{ $resetUrl }}"
               style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;font-weight:600;padding:14px 28px;border-radius:999px;text-decoration:none;">
                إعادة تعيين كلمة المرور
            </a>
        </div>
        <p style="margin-bottom:24px;font-size:14px;color:#475569;">
            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة. ما زالت كلمة المرور الخاصة بك آمنة.
        </p>
        <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#94a3b8;text-align:center;">
            © {{ date('Y') }} {{ $appName ?? config('app.name') }}. جميع الحقوق محفوظة.
        </div>
    </div>
</body>
</html>
