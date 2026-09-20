# FleetRent — Frontend (Angular)

واجهة أمامية كاملة لمشروع **FleetRent** (نظام تأجير وإدارة سيارات)، مبنية بـ Angular (Standalone Components) بمعمارية Clean، ومربوطة بكل الـ Endpoints بتاعت الباك إند.

## 🚀 التشغيل خطوة بخطوة

### 1)  للتسجيل ك ادمن

## ⚠️ Demo Access

This is a live demo deployment. You can explore the admin dashboard using the credentials below:

**Admin Login**
- Email: `admin@fleetrent.com`
- Password: `Admin@123`

> ⚠️ **Note:** These are demo credentials for testing/showcase purposes only. Please do not use this account to store real or sensitive data.

🔗 Live Demo: [fleet-rent-eight.vercel.app](https://fleet-rent-eight.vercel.app/)
### 3) شغّل المشروع محليًا

```bash
npm start
```

هيفتح على `http://localhost:4200`

### 4) للـ Build النهائي (للنشر)

```bash
npm run build
```

الملفات الناتجة هتكون في `dist/fleetrent-frontend/`.

---

## 🏗️ هيكل المشروع (Clean Architecture)

```
src/app/
├── core/                     ← خدمات أساسية (Singleton) — تُحمّل مرة واحدة فقط
│   ├── models/                  DTOs و Interfaces مطابقة تمامًا لباك إند الـ .NET
│   ├── services/                خدمة لكل Controller (CarService, BookingService...)
│   ├── interceptors/             auth.interceptor.ts — يضيف JWT تلقائيًا لكل Request
│   └── guards/                   authGuard, roleGuard(['Admin', ...])
│
├── shared/                   ← عناصر واجهة قابلة لإعادة الاستخدام
│   ├── components/               navbar, toast
│   └── pages/                    not-found (404), forbidden (403)
│
├── features/                 ← كل Feature في فولدر مستقل (نفس تقسيم الـ Controllers)
│   ├── home/
│   ├── auth/                     login, register
│   ├── cars/                     car-list, car-details (+ booking), car-form (admin)
│   ├── bookings/                 my-bookings (Customer)
│   ├── contracts/                check-out / check-in (Employee/Admin)
│   ├── maintenance/              (Employee/Admin)
│   ├── payments/                 (Employee/Admin)
│   ├── branches/                 (Admin)
│   ├── categories/               (Admin)
│   ├── users/                    (Admin)
│   └── admin/admin-dashboard/    لوحة تحكم بإحصائيات وروابط سريعة
│
├── app.routes.ts              كل المسارات (Lazy Loaded) مع الـ Guards المناسبة
├── app.config.ts              تسجيل HttpClient + Interceptor + Router
└── app.component.ts           التخطيط العام (Navbar + Router Outlet + Toasts)
```

---

## 🔐 الصلاحيات (Roles)

| الصفحة | الصلاحية |
|---|---|
| `/`, `/cars`, `/cars/:id` | عام (بدون تسجيل دخول) |
| `/bookings/my` | Customer فقط |
| `/contracts`, `/maintenance`, `/payments` | Employee أو Admin |
| `/admin/*` | Admin فقط |

الحماية بتتم في مستويين:
1. **`roleGuard`** على مستوى الراوت — يمنع الدخول للصفحة أصلًا.
2. **الباك إند نفسه** — أي طلب بيتحقق منه السيرفر عن طريق `[Authorize(Roles = "...")]`، فحتى لو حصل تلاعب في الفرونت إند، السيرفر هو خط الدفاع الحقيقي.

---

## 🎨 نظام التصميم

كل الألوان والمسافات والـ radius معرّفة كـ CSS Variables في `src/styles.css`، فسهل جدًا تغيّر هوية المشروع البصرية من مكان واحد (`--color-primary`, `--color-accent`, إلخ).

---

## ⚠️ ملاحظة عن CORS

لو واجهت خطأ CORS وقت التطوير المحلي، تأكد إن الباك إند بتاعك مفعّل فيه:

```csharp
app.UseCors("AllowAll");
```

(موجودة بالفعل في الكود اللي بنيناه سوا في `Program.cs`)
