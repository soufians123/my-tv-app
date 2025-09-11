-- إصلاح Row Level Security policies لجدول profiles
-- يجب تشغيل هذا السكريبت في SQL Editor في Supabase Dashboard

-- أولاً: حذف جميع الـ policies الموجودة
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- ثانياً: إنشاء policies جديدة تسمح بالعمليات المطلوبة

-- السماح للمستخدمين المصادقين بقراءة ملفاتهم الشخصية
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- السماح للمستخدمين المصادقين بإنشاء ملفاتهم الشخصية
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- السماح للمستخدمين المصادقين بتحديث ملفاتهم الشخصية
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- السماح للمدراء بقراءة جميع الملفات الشخصية
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- السماح للمدراء بتحديث جميع الملفات الشخصية
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- إنشاء function لإنشاء profile تلقائياً عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, is_active, is_verified)
  VALUES (NEW.id, 'user', true, false);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- إذا فشل الإدراج، لا نريد أن نمنع إنشاء المستخدم
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لاستدعاء الـ function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إنشاء مستخدم المدير مباشرة (يتطلب صلاحيات service_role)
-- هذا الجزء اختياري ويمكن تشغيله منفصلاً
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
*/

-- رسالة تأكيد
SELECT 'تم إصلاح Row Level Security policies بنجاح!' as message;