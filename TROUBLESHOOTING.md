# دليل حل مشاكل تسجيل الدخول

## المشكلة المكتشفة ✅
**تم تحديد المشكلة الحقيقية**: المشكلة هي في Row Level Security (RLS) policies في جدول profiles.

الخطأ الفعلي: `new row violates row-level security policy for table "profiles"`

## الحل الصحيح (مطلوب تطبيقه)

### 1. إصلاح Row Level Security Policies (الحل الأساسي)

**هذا هو الحل المطلوب لإصلاح المشكلة:**

1. اذهب إلى Supabase Dashboard: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ والصق المحتوى من الملف: `scripts/fix-rls-policies-clean.sql`
   (إذا واجهت مشاكل في الترميز، استخدم هذا الملف بدلاً من الملف الأصلي)
5. اضغط **Run** لتشغيل السكريبت

**أو يمكنك نسخ هذا الكود مباشرة:**

```sql
-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- إنشاء policies جديدة صحيحة
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- إنشاء function لإنشاء profile تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, is_active, is_verified)
  VALUES (NEW.id, 'user', true, false);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. اختبار الحل (مطلوب بعد تطبيق الإصلاح)

**بعد تشغيل سكريبت إصلاح RLS، قم بالاختبار:**

1. شغل سكريبت الاختبار:
```bash
node scripts/test-after-fix.js
```

2. يجب أن ترى رسائل نجاح مثل:
   - ✅ تم تسجيل المستخدم بنجاح!
   - ✅ تم إنشاء profile تلقائياً!
   - ✅ تم تسجيل الدخول بنجاح!
   - ✅ تم تحديث profile بنجاح!

#### إنشاء مستخدم المدير (اختياري):
1. اذهب إلى Authentication > Users
2. اضغط "Add user"
3. أدخل:
   - Email: `admin@example.com`
   - Password: `admin123456`
   - Email Confirm: ✅ (مؤكد)
4. بعد إنشاء المستخدم، انسخ User ID
5. اذهب إلى Database > Table Editor > profiles
6. اضغط "Insert" > "Insert row"
7. أدخل:
   - id: [User ID المنسوخ]
   - username: admin
   - role: admin
   - is_active: true
   - is_verified: true

### 3. تحقق من Row Level Security (RLS)

1. اذهب إلى Database > Table Editor > profiles
2. اضغط على أيقونة الحماية بجانب اسم الجدول
3. تأكد من وجود policies صحيحة:

```sql
-- Policy للقراءة
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy للإدراج
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy للتحديث
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 4. اختبار الحل

بعد تطبيق الحلول أعلاه:

1. افتح الموقع: http://localhost:3000/auth/login
2. أدخل:
   - البريد الإلكتروني: admin@example.com
   - كلمة المرور: admin123456
3. اضغط تسجيل الدخول

### 5. إذا لم تعمل الحلول السابقة

#### تحقق من Console Errors:
1. افتح Developer Tools (F12)
2. اذهب إلى Console tab
3. جرب تسجيل الدخول ولاحظ أي أخطاء
4. اذهب إلى Network tab
5. لاحظ طلبات API وردودها

#### تحقق من Supabase Logs:
1. في Supabase Dashboard
2. اذهب إلى Logs > Auth Logs
3. لاحظ أي أخطاء عند محاولة تسجيل الدخول

## معلومات الاتصال الحالية

- **Supabase URL**: https://jrtctjgdkvkdrjcbbbaz.supabase.co
- **البريد الإلكتروني المطلوب**: admin@example.com
- **كلمة المرور المطلوبة**: admin123456
- **الدور المطلوب**: admin

## ملاحظات مهمة

1. تأكد من أن مشروع Supabase نشط وليس متوقف
2. تحقق من حدود الاستخدام في خطة Supabase المجانية
3. تأكد من صحة متغيرات البيئة في `.env.local`
4. إذا كنت تستخدم VPN، جرب تعطيله مؤقتاً

## الخطوة التالية

بعد تطبيق هذه الحلول، أخبرني بالنتيجة وأي رسائل خطأ جديدة تظهر.