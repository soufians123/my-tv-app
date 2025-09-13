# حل مشكلة تسجيل الدخول على Vercel

## المشكلة
عند نشر التطبيق على Vercel، تسجيل الدخول يبقى في حالة تحميل (دوران) ولا يكتمل.

## السبب الرئيسي
متغيرات البيئة غير مضبوطة بشكل صحيح على Vercel، خاصة `NEXTAUTH_URL` الذي يشير إلى localhost بدلاً من URL الفعلي للموقع.

## الحلول المطلوبة

### 1. إعداد متغيرات البيئة في Vercel

#### الخطوات:
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jrtctjgdkvkdrjcbbbaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAzODIzOSwiZXhwIjoyMDcxNjE0MjM5fQ.Ej8qJQZvXhQGJQZvXhQGJQZvXhQGJQZvXhQGJQZvXhQ

# Next.js Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=zomiga-secret-key-2024
```

**⚠️ مهم جداً:** استبدل `https://your-app-name.vercel.app` بـ URL موقعك الفعلي على Vercel.

### 2. إعدادات Supabase

#### الخطوات:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Authentication** → **URL Configuration**
4. في **Site URL**، أضف: `https://your-app-name.vercel.app`
5. في **Redirect URLs**، أضف:
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/auth/login`
   - `https://your-app-name.vercel.app`

### 3. إعادة النشر

1. بعد تحديث متغيرات البيئة في Vercel
2. اذهب إلى **Deployments** في Vercel
3. اضغط على **Redeploy** للنشر الأخير
4. أو ادفع تحديث جديد إلى GitHub

## التحسينات المضافة في الكود

### 1. Timeout للطلبات
- تم إضافة timeout 15 ثانية لطلبات تسجيل الدخول والتسجيل
- يمنع التعليق اللانهائي

### 2. معالجة أفضل للأخطاء
- رسائل خطأ أكثر وضوحاً
- معالجة خاصة لـ timeout
- تسجيل الأخطاء في console للتشخيص

### 3. تحسين تجربة المستخدم
- رسائل خطأ باللغة العربية
- معلومات أكثر تفصيلاً عن سبب الخطأ

## اختبار الحل

1. تأكد من تحديث جميع متغيرات البيئة
2. أعد نشر التطبيق
3. جرب تسجيل الدخول على الموقع المنشور
4. تحقق من console المتصفح للأخطاء إن وجدت

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من Network tab في Developer Tools**
   - ابحث عن طلبات فاشلة
   - تحقق من response codes

2. **تحقق من Console للأخطاء**
   - ابحث عن رسائل خطأ JavaScript
   - تحقق من أخطاء CORS

3. **تحقق من Vercel Function Logs**
   - اذهب إلى Vercel Dashboard → Functions
   - تحقق من logs للأخطاء

4. **تحقق من Supabase Logs**
   - اذهب إلى Supabase Dashboard → Logs
   - ابحث عن طلبات فاشلة

## ملاحظات مهمة

- تأكد من أن جميع URLs تستخدم HTTPS وليس HTTP
- تأكد من عدم وجود مسافات إضافية في متغيرات البيئة
- قد تحتاج إلى انتظار بضع دقائق بعد تحديث متغيرات البيئة
- تأكد من أن Supabase project نشط وليس في وضع pause