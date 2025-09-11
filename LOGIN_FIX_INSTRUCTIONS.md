# إصلاح مشكلة تسجيل الدخول - تعليمات مفصلة

## المشكلة المكتشفة
بعد فحص النظام، تم اكتشاف المشاكل التالية:
- ✅ الاتصال بقاعدة البيانات يعمل
- ❌ حساب المدير غير موجود
- ❌ جدول profiles يحتاج إعداد
- ❌ مفتاح Service Role Key قد يكون غير صالح

## خطوات الإصلاح

### الخطوة 1: إعداد قاعدة البيانات
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `jrtctjgdkvkdrjcbbbaz`
3. اذهب إلى **SQL Editor**
4. انسخ والصق محتوى ملف `scripts/create-admin-manual.sql`
5. اضغط **Run** لتشغيل السكريپت

### الخطوة 2: إنشاء حساب المدير
1. في Supabase Dashboard، اذهب إلى **Authentication > Users**
2. اضغط **Add user**
3. أدخل البيانات التالية:
   ```
   Email: admin@zomiga.com
   Password: Admin123!@#
   Email Confirm: ✅ (مؤكد)
   ```
4. اضغط **Create user**

### الخطوة 3: تعيين دور المدير
1. بعد إنشاء المستخدم، انسخ **User ID** الخاص به
2. اذهب إلى **SQL Editor**
3. شغل هذا الاستعلام (استبدل USER_ID بالمعرف الفعلي):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin', full_name = 'مدير النظام'
   WHERE id = 'USER_ID_HERE';
   ```

### الخطوة 4: التحقق من الإعداد
1. في **SQL Editor**، شغل:
   ```sql
   SELECT * FROM public.profiles WHERE role = 'admin';
   ```
2. يجب أن ترى سجل المدير

### الخطوة 5: اختبار تسجيل الدخول
1. اذهب إلى [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. أدخل:
   ```
   Email: admin@zomiga.com
   Password: Admin123!@#
   ```
3. اضغط **تسجيل الدخول**

## إصلاح مفتاح Service Role Key (اختياري)
إذا كنت تريد استخدام السكريپتات الآلية:

1. في Supabase Dashboard، اذهب إلى **Settings > API**
2. انسخ **service_role** key الجديد
3. حدث ملف `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=المفتاح_الجديد_هنا
   ```

## اختبار النظام
بعد تطبيق الخطوات، شغل:
```bash
node scripts/test-supabase-connection.js
```

يجب أن ترى:
- ✅ الاتصال بقاعدة البيانات: يعمل
- ✅ نظام المصادقة: يعمل  
- ✅ جدول المستخدمين: يعمل
- ✅ تسجيل الدخول: يعمل

## ملاحظات مهمة
- تأكد من تأكيد البريد الإلكتروني عند إنشاء المستخدم
- كلمة المرور يجب أن تكون قوية (8 أحرف على الأقل)
- دور المدير يجب أن يكون بالضبط `admin` (بأحرف صغيرة)

## في حالة استمرار المشكلة
1. تحقق من صحة متغيرات البيئة في `.env.local`
2. تأكد من أن المشروع في Supabase نشط
3. تحقق من إعدادات RLS (Row Level Security)
4. راجع سجلات الأخطاء في المتصفح (F12 > Console)