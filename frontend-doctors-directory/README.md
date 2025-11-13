# Frontend – Doctors Directory Web

واجهة React 19 + Vite + TypeScript + Tailwind RTL مخصّصة لربط المستفيدين بالمعالجين النفسيين المعتمدين.

## أوامر التشغيل

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # إنتاج النسخة النهائية
npm run lint       # ESLint
npm run typecheck  # فحص TypeScript
```

## المتغيرات

| المتغير               | القيمة المحلية                | الإنتاج (souftech)                            |
|-----------------------|-------------------------------|-----------------------------------------------|
| `VITE_API_BASE_URL`   | `http://localhost:8001`       | `https://api-doctors-directory.souftech.com`   |
| `VITE_GOOGLE_MAPS_API_KEY` | مفتاح Google Maps        | نفسه في الإنتاج                               |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (Web) | نفس المعرّف المسموح على `souftech.com`        |

> الملف `.env.production.example` يضم إعدادات جاهزة لـ `doctors-directory.souftech.com`. المكوّن `src/lib/env.ts` سيرفع خطأ في حال غياب `VITE_API_BASE_URL`.

## أهم المجلدات

```
src/
├─ app/              # المزودات، الراوتر، الـ layouts
├─ components/       # عناصر مشتركة (Navbar, MapWidget, DoctorCard ...)
├─ features/         # منطق المجال (auth, doctors, favorites, admin, doctor)
├─ lib/              # axios, env, queryClient, utils
├─ pages/            # الصفحات العامة، لوحة الطبيب، لوحة الإدارة
└─ types/            # DTOs وواجهات مشتركة
```

## المزايا

- **i18n + RTL:** العربية افتراضيًا مع إمكانية تغيير اللغة لاحقًا (`i18next` + hook للتحكم بالاتجاه).
- **React Query:** إدارة البيانات (doctors, favorites, auth) مع مفاتيح منظمة وعرض حالة التحميل.
- **React Router 7:** تخطيط متعدد (Public, Auth, Doctor, Admin) + `ProtectedRoute` حسب الدور.
- **Tailwind CSS + tailwindcss-rtl:** تصميم حديث مع Glass Panels، زوايا 2xl، وظلال ناعمة.
- **خرائط Google:** `MapWidget` يعتمد على `@googlemaps/js-api-loader` ويعرض عيادات الطبيب والبحث.
- **استمارات RHF + Zod:** تسجيل الدخول/التسجيل + التحقق من البيانات قبل إرسالها لـ API.
- **تسجيل دخول Google:** باستخدام `@react-oauth/google` وزر مستوحى من Google Identity Services لم يستخدم يدوياً.
- **Zustand (مهيأ للاستخدام):** جاهز لإدارة الحالات الخفيفة (مثلاً فتح فلاتر البحث).

## نقاط الاندماج مع الـ API

- Axios instance (`src/lib/http.ts`) يستعمل `withCredentials` و`ensureCsrf` لتكامل Sanctum.
- الاستجابات موحدة حسب هيكل Laravel (`data.items + pagination`).
- لوحة الطبيب تستدعي `/api/doctor/profile` لعرض/حفظ البيانات و `/api/doctor/media` لرفع الوسائط.
- لوحة الإدارة تستعمل `/api/admin/doctors` + `/api/admin/categories` مع تحديثات مباشرة عبر React Query.

> ملاحظة: فعّل مفتاح Google Maps داخل `.env` ليظهر الـ MapWidget بدل رسالة التنبيه.
