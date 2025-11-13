# Backend – Mental Health Directory API

Laravel 12 + Sanctum + Spatie (Permission/Media Library) powering دليل المعالجين النفسيين.

## إعداد المشروع

```bash
cp .env.example .env   # عدّل إعدادات قاعدة البيانات إن لزم
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

> أو ببساطة: `make setup`

## أوامر مفيدة

| الأمر              | الوصف                                               |
|--------------------|-----------------------------------------------------|
| `composer lint`    | Pint + Larastan                                      |
| `composer test`    | اختبارات Pest (تشمل تسجيل، بحث، مفضلة)              |
| `php artisan serve`| تشغيل الـ API على `http://localhost:8000`           |
| `docker compose up -d` | قاعدة بيانات MySQL + Meilisearch تجريبية        |

## أبرز الحزم والتكوين

- **Sanctum SPA** مع `EnsureFrontendRequestsAreStateful` وSession middleware في مجموعة `api`.
- **Spatie Permission** (أدوار admin/doctor/user) مفعّلة على مستوى الـ Middleware.
- **Spatie Media Library** مع مجموعتي `documents` و`gallery` + تحويلات مصغرة.
- **Seeder ديناميكي** يولد 150 دكتورًا بعيادات متعددة، لغات وتأمينات مختلفة، وفئات مرتبطة.
- **اعدادات CORS** تسمح لـ `http://localhost:5173` (واجهة Vite).

## أهم المسارات

| المسار                           | الوصف                                                |
|----------------------------------|------------------------------------------------------|
| `POST /api/auth/register`        | تسجيل مستخدم/طبيب جديد                              |
| `POST /api/auth/login`           | تسجيل الدخول (Sanctum + جلسة)                        |
| `POST /api/auth/google`          | تسجيل/تسجيل دخول عبر Google Identity (token)        |
| `GET /api/doctors`               | بحث بفلاتر (مدينة، تخصص، لغات، نصف قطر)            |
| `GET /api/doctors/{id}`          | عرض ملف طبيب + العيادات والوسائط                    |
| `POST /api/doctor/profile`       | إدارة ملف الطبيب (محمي بدور doctor)                |
| `POST /api/doctor/media`         | رفع الوثائق/الصور مع التحقق                         |
| `GET /api/admin/doctors`         | لوحة مراجعة للأطباء مع فلاتر الحالة                 |
| `POST /api/admin/doctors/{id}/approve|reject` | اعتماد أو رفض الملف                            |
| `GET /api/favorites`             | استرجاع المفضلة للمستخدم                            |

## البيئة المتوقعة

| المتغير | التطوير | الإنتاج (souftech.com) |
|---------|---------|------------------------|
| `APP_URL` | `http://localhost:8000` | `https://api-doctors-directory.souftech.com` |
| `FRONTEND_URL`/`FRONTEND_URLS` | `http://localhost:5173` | `http://localhost:5173,https://doctors-directory.souftech.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:5173` | `localhost:5173,doctors-directory.souftech.com` |
| `SESSION_DOMAIN` | `localhost` | `.souftech.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | معرّف وسر OAuth (لـ localhost + 5173) | معرّف/سر الإنتاج (souftech.com) |

> استخدم `.env.production.example` كنقطة بداية لنشر الإنتاج، حيث تم ضبط القيم أعلاه مسبقاً.

معامل `DOCTOR_SEED_COUNT` يسمح بتعديل عدد بيانات العيّنة (الإعداد الافتراضي 150).

## اختبارات القبول

1. **تسجيل طبيب + تحميل وثيقة + موافقة Admin** → يظهر في `/api/doctors`.
2. **بحث متعدد الفلاتر (مدينة + تخصص + لغة)** ≤ 2 ثانية لعيّنة 150 طبيب.
3. **إضافة/حذف من المفضلة** عبر `/api/doctors/{id}/favorite`.
4. **عرض ملف طبيب** يحتوي على العيادات، الخريطة، الوسائط.

لأي تخصيص إضافي، راجع الجذر `../README.md` للحصول على نظرة شاملة عن المنصّة كاملة.
