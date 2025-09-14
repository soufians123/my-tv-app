# حل مشاكل النشر على Vercel - دليل شامل

## المشكلة الحالية
التطبيق يعمل محلياً لكن يواجه مشاكل تحميل مستمر على Vercel (www.zomiga.live)

## الأسباب المحتملة
1. **متغيرات البيئة غير مضبوطة بشكل صحيح على Vercel**
2. **وجود متغيرات NextAuth غير مطلوبة**
3. **عدم وجود ملف vercel.json للتكوين**
4. **إعدادات Supabase غير متطابقة**

## الحلول المطبقة

### 1. إنشاء ملف vercel.json ✅
تم إنشاء ملف `vercel.json` مع:
- إعدادات متغيرات البيئة الصحيحة
- headers للـ CORS
- timeout للـ API functions
- rewrites للـ API routes

### 2. تنظيف ملف .env.local ✅
تم إزالة متغيرات NextAuth غير المطلوبة:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 3. تحسين AuthContext ✅ (مطبق مسبقاً)
- إضافة timeout (10 ثوانٍ)
- آلية fallback للتعامل مع فشل المصادقة
- معالجة أخطاء محسنة

### 4. إضافة LoadingFallback ✅ (مطبق مسبقاً)
- عرض رسائل خطأ واضحة
- خيارات إعادة التحميل
- timeout قابل للتخصيص

## خطوات النشر على Vercel

### الخطوة 1: التحقق من متغيرات البيئة في Vercel
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. تأكد من وجود هذه المتغيرات فقط:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jrtctjgdkvkdrjcbbbaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzgyMzksImV4cCI6MjA3MTYxNDIzOX0.39DoF_bU7Yp8MuYoDffNab8h8T-FmvI3u4XJTQ0iX1Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGN0amdka3ZrZHJqY2JiYmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAzODIzOSwiZXhwIjoyMDcxNjE0MjM5fQ.Ej8qJQZvXhQGJQZvXhQGJQZvXhQGJQZvXhQGJQZvXhQ
```

**⚠️ مهم:** احذف هذه المتغيرات إذا كانت موجودة:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### الخطوة 2: إعدادات Supabase
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `jrtctjgdkvkdrjcbbbaz`
3. اذهب إلى **Authentication** → **URL Configuration**
4. تأكد من الإعدادات التالية:

**Site URL:**
```
https://www.zomiga.live
```

**Redirect URLs:**
```
https://www.zomiga.live
https://www.zomiga.live/**
https://zomiga.live
https://zomiga.live/**
https://www.zomiga.live/auth/callback
```

### الخطوة 3: إعادة النشر
1. في Vercel Dashboard، اذهب إلى **Deployments**
2. اضغط على **Redeploy** للنشر الأخير
3. أو ادفع التحديثات الجديدة إلى GitHub

### الخطوة 4: اختبار التطبيق
1. انتظر انتهاء النشر
2. اذهب إلى `https://www.zomiga.live`
3. جرب تسجيل الدخول
4. تحقق من عمل التطبيق بشكل طبيعي

## استكشاف الأخطاء

### إذا استمرت مشكلة التحميل:
1. افتح Developer Tools (F12)
2. تحقق من Console للأخطاء
3. تحقق من Network tab للطلبات الفاشلة
4. تحقق من Application tab → Local Storage

### إذا ظهرت أخطاء CORS:
1. تأكد من إعدادات Supabase URLs
2. تحقق من ملف `vercel.json`
3. تأكد من headers في `next.config.js`

### إذا فشل تسجيل الدخول:
1. تحقق من متغيرات البيئة في Vercel
2. تأكد من إعدادات Supabase Auth
3. تحقق من وجود جدول profiles

## ملفات التكوين المحدثة
- ✅ `vercel.json` - جديد
- ✅ `.env.local` - محدث (إزالة NextAuth)
- ✅ `contexts/AuthContext.js` - محسن مع timeout
- ✅ `components/LoadingFallback.js` - جديد
- ✅ `next.config.js` - محسن للأداء

## الخطوات التالية
1. ادفع هذه التحديثات إلى GitHub
2. انتظر النشر التلقائي على Vercel
3. اختبر التطبيق على الرابط المباشر
4. راقب الأداء والأخطاء

---

**ملاحظة:** هذا الدليل يحل المشاكل الشائعة لنشر تطبيقات Next.js مع Supabase على Vercel.