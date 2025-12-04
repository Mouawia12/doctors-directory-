<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName ?? config('app.name') }} - {{ $subject }}</title>
</head>
<body style="background-color:#f4f6fb;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0f172a;direction:rtl;text-align:right;">
    <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:24px;padding:32px;box-shadow:0 10px 40px rgba(15,23,42,0.08);">
        <div style="margin-bottom:24px;">
            <p style="margin:0;color:#64748b;font-size:13px;">{{ $appName ?? config('app.name') }}</p>
            <h1 style="margin:8px 0 0;font-size:22px;color:#0f172a;">{{ $subject }}</h1>
        </div>
        <div style="margin-bottom:24px;line-height:1.7;font-size:15px;color:#334155;">
            <p style="margin-bottom:12px;">مرحباً {{ $user->name ?? 'دكتورنا العزيز' }},</p>
            <p style="margin:0;">{{ $messageBody }}</p>
        </div>
        @if(!empty($note))
            <div style="margin-bottom:24px;padding:16px;border-radius:16px;background-color:#f8fafc;color:#1e293b;">
                <p style="margin:0;font-size:14px;">ملاحظة الإدارة:</p>
                <p style="margin:4px 0 0;font-weight:600;">{{ $note }}</p>
            </div>
        @endif
        <div style="text-align:center;margin-bottom:28px;">
            <a href="{{ $portalUrl }}"
               style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;font-weight:600;padding:14px 28px;border-radius:999px;text-decoration:none;">
                فتح لوحة الطبيب
            </a>
        </div>
        <p style="margin-bottom:24px;font-size:14px;color:#475569;">
            شكراً لكونك جزءاً من {{ $appName ?? config('app.name') }}. نعمل معك لبناء تجربة علاجية موثوقة للمرضى.
        </p>
        <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#94a3b8;text-align:center;">
            © {{ date('Y') }} {{ $appName ?? config('app.name') }}. جميع الحقوق محفوظة.
        </div>
    </div>
</body>
</html>
