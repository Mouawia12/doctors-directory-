<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName ?? config('app.name') }} - {{ $subject }}</title>
</head>
<body style="background-color:#f4f6fb;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0f172a;text-align:center;">
@php
    $isApproved = $doctor->status === \App\Enums\DoctorStatus::Approved->value;
    $statusColor = $isApproved ? '#16a34a' : '#dc2626';
    $statusBg = $isApproved ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)';
    $accentGradient = $isApproved ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#dc2626,#ef4444)';
    $statusLabel = $isApproved ? 'تمت الموافقة' : 'تم الرفض';
    $ctaAr = $isApproved ? 'عرض ملفك الآن' : 'مراجعة الملاحظات';
@endphp
    <div style="max-width:640px;margin:0 auto;background-color:#ffffff;border-radius:24px;padding:32px;box-shadow:0 16px 48px rgba(15,23,42,0.12);text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;text-align:start;">
            <p style="margin:0;color:#64748b;font-size:13px;">{{ $appName ?? config('app.name') }}</p>
            <span style="display:inline-flex;align-items:center;gap:6px;background:{{ $statusBg }};color:{{ $statusColor }};padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">
                <span style="width:8px;height:8px;border-radius:50%;background:{{ $statusColor }};"></span>
                {{ $statusLabel }}
            </span>
        </div>
        <div style="margin-bottom:20px;">
            <h1 style="margin:4px 0;font-size:22px;color:#0f172a;direction:rtl;text-align:center;">{{ $subjectAr }}</h1>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:20px;">
            <div style="padding:18px;border-radius:16px;background-color:#f8fafc;border:1px solid #e2e8f0;direction:rtl;text-align:center;line-height:1.7;font-size:15px;color:#0f172a;">
                <p style="margin:0 0 8px;font-weight:700;">مرحباً {{ $user->name ?? 'دكتورنا العزيز' }},</p>
                <p style="margin:0;color:#334155;">{{ $messageAr }}</p>
            </div>
        </div>

        @if(!empty($note))
            <div style="margin-bottom:20px;padding:16px;border-radius:16px;background-color:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;">
                <p style="margin:0;font-size:14px;font-weight:700;">ملاحظات الإدارة / Admin notes</p>
                <p style="margin:6px 0 0;font-weight:600;line-height:1.6;">{{ $note }}</p>
            </div>
        @endif

        <div style="text-align:center;margin:26px 0;">
            <a href="{{ $portalUrl }}"
               style="display:inline-flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;background:{{ $accentGradient }};color:#ffffff;font-weight:700;padding:14px 26px;border-radius:14px;text-decoration:none;box-shadow:0 10px 30px rgba(37,99,235,0.25);">
                <span style="font-size:15px;">{{ $ctaAr }}</span>
            </a>
        </div>

        <p style="margin-bottom:18px;font-size:13px;color:#475569;text-align:center;line-height:1.6;">
            شكراً لكونك جزءاً من {{ $appName ?? config('app.name') }}. نعمل معك لبناء تجربة علاجية موثوقة للمرضى.
        </p>
        <div style="border-top:1px solid #e2e8f0;padding-top:14px;font-size:12px;color:#94a3b8;text-align:center;">
            © {{ date('Y') }} {{ $appName ?? config('app.name') }}. جميع الحقوق محفوظة.
        </div>
    </div>
</body>
</html>
