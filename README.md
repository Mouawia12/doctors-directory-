# دليل المعالجين النفسيين (Mental Health Directory)

منصّة عربية متخصصة بربط العملاء مع المعالجين النفسيين المرخّصين، مبنية بـ **Laravel 12 + React/Vite + TypeScript** مع دعم Google Maps، صلاحيات Spatie، ولوحة إدارة لاعتماد الممارسين ومتابعة ملفاتهم.

## بنية المستودع

```
doctors-directory/
├─ backend-doctors-directory   ← API Laravel + Sanctum + Spatie
└─ frontend-doctors-directory  ← واجهات React + Vite + Tailwind RTL
```

## المتطلبات المسبقة

- PHP 8.2 مع Composer
- Node.js 20+
- MySQL أو أي محرك متوافق مع Laravel

## الإعداد السريع

1. **انسخ ملفات البيئة الافتراضية (أو عدّلها عند الحاجة):**
   - `backend-doctors-directory/.env` أو `.env.production.example` (يتضمن أمثلة لـ `https://api-doctors-directory.souftech.com` و `https://doctors-directory.souftech.com`).
   - `frontend-doctors-directory/.env` أو `.env.production.example` وحدد `VITE_API_BASE_URL` لواجهة الـ API.

2. **شغّل إعدادات الـ Backend:**
   ```bash
   cd backend-doctors-directory
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan storage:link
   php artisan serve
   ```
   أو ببساطة: `make setup`

3. **شغّل واجهة الويب:**
   ```bash
   cd ../frontend-doctors-directory
   npm install
   npm run dev
   ```

4. **أسماء دخول جاهزة بعد Seeder:**
   - Admin: `admin@doctors.local / password`
   - Therapist: `doctor@doctors.local / password`
   - User: `user@doctors.local / password`
   - يتم توليد 150+ معالج/معالجة ببيانات علاج نفسي وعيادات تجريبية.

## أوامر مهمة

| المجال     | الأمر                            | الوصف                                    |
|------------|----------------------------------|------------------------------------------|
| Backend    | `make setup`                     | تثبيت الحزم، migrate/seed، ربط التخزين   |
|            | `composer test`                  | اختبارات Pest                            |
|            | `composer lint`                  | Pint + PHPStan/Larastan                  |
| Frontend   | `npm run dev`                    | تشغيل Vite مع Tailwind RTL              |
|            | `npm run lint`                   | ESLint (TypeScript)                      |
|            | `npm run typecheck`              | فحص TypeScript                           |

## تهيئة النطاقات (localhost + souftech.com)

| المتغير                            | التطوير المحلي                         | الإنتاج (`*.souftech.com`)                        |
|-----------------------------------|----------------------------------------|---------------------------------------------------|
| `APP_URL`                         | `http://localhost:8000`                | `https://api-doctors-directory.souftech.com`      |
| `FRONTEND_URLS` / `FRONTEND_URL`  | `http://localhost:5174`                | `http://localhost:5174,https://doctors-directory.souftech.com` |
| `SANCTUM_STATEFUL_DOMAINS`        | `localhost:5174`                       | `localhost:5174,doctors-directory.souftech.com`   |
| `SESSION_DOMAIN`                  | `localhost`                            | `.souftech.com`                                   |
| `VITE_API_BASE_URL`               | `http://localhost:8001`                | `https://api-doctors-directory.souftech.com`      |

### ربط تسجيل الدخول عبر Google

| المتغير/الإعداد            | القيمة المحلية                                  | الإنتاج                                      |
|---------------------------|-------------------------------------------------|----------------------------------------------|
| Google Cloud OAuth        | أنشئ OAuth Client من نوع **Web** وحدد النطاقات `email profile openid` | نفس المشروع لكن مع نطاقات `https://*.souftech.com` |
| `GOOGLE_CLIENT_ID`        | معرف الـ OAuth نفسه                             | معرف الإنتاج (يمكن استخدام نفس المعرف)       |
| `GOOGLE_CLIENT_SECRET`    | السر المولّد من Google                          | السر الخاص بالإنتاج                          |
| `VITE_GOOGLE_CLIENT_ID`   | نفس قيمة `GOOGLE_CLIENT_ID` لواجهة Vite         | معرف واجهة الإنتاج                           |

> لا حاجة لإدخال الـ redirect URI لأننا نستعمل **Google Identity Services** عبر الـ token المباشر (One Tap / Popup). يكفي السماح لنطاقات الواجهة (localhost و souftech) داخل Google Cloud Console.

> **مهم:** لا تضع الدومينات داخل الكود. حدّدها في ملفات البيئة فقط وسيتم استهلاكها تلقائياً من الواجهة والخلفية (CORS + Sanctum + axios).

## أبرز الميزات

- **المصادقة:** Laravel Sanctum + استمارات React Hook Form/Zod مع استدعاء `/sanctum/csrf-cookie`.
- **الأدوار والصلاحيات:** Spatie Permission (admin / doctor / user) مع حماية المسارات عبر Middleware وواجهات React.
- **ملفات ووسائط:** Spatie Media Library لرفع التراخيص وصور العيادات، مع تحقق من النوع والحجم في Laravel.
- **بحث متقدم:** فلاتر المدينة، التخصص، اللغة، الخبرة، مواقع العيادات (Haversine) + خريطة Google Maps عبر `@googlemaps/js-api-loader`.
- **لوحة الممارس النفسي:** نموذج متعدد الأقسام لإدارة البيانات العلاجية، العيادات، والوسائط مع تتبع تقدم الاعتماد.
- **لوحة الإدارة:** بطاقات مؤشرات (Pending/Approved/Rejected)، مراجعة ملفات المعالجين النفسيين، وأدوات تصنيف متخصصة.
- **i18n + RTL:** العربية افتراضيًا مع إمكانية إضافة EN لاحقًا، وتحكم في اتجاه الصفحات عبر hook مخصص.
- **تسجيل دخول Google:** زر موحّد للمستخدمين والأطباء مع إنشاء الملف الأولي للطبيب اعتمادًا على بيانات Google.
- **اختبارات:** Pest تغطي التسجيل، البحث، المفضلة؛ + ESLint/TypeScript على الواجهة.

## ملاحظات إضافية

- ملفات Docker Compose تجريبية يمكن إضافتها لاحقًا (الخدمة حالياً تعتمد على الإعداد المحلي).
- Google Maps يعمل فقط عند تزويد قيمة `VITE_GOOGLE_MAPS_API_KEY`.
- الاستجابات الخلفية موحّدة بالهيكل:
  ```json
  {
    "data": { "items": [], "pagination": { "page": 1, "per_page": 10, "total": 0 } },
    "message": null,
    "errors": null
  }
  ```

لأي تخصيص إضافي (ربط حجز المواعيد، الدفع، أو المراجعات) تم تجهيز قاعدة البيانات والـ API لتوسعة المستقبل دون كسر المنظومة الحالية.
