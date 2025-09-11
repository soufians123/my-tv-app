-- إنشاء المستخدم الإداري في Supabase
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

BEGIN;

-- إنشاء المستخدم الإداري (مع تجنب التكرار)
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
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@zomiga.com',
    crypt('Admin123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "name": "مدير النظام"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@zomiga.com'
);

-- إنشاء ملف تعريف للمستخدم الإداري (مع تجنب التكرار)
INSERT INTO profiles (
    id,
    username,
    full_name,
    bio,
    is_verified,
    is_active,
    role,
    created_at,
    updated_at
)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    'admin',
    'مدير النظام',
    'مدير النظام الرئيسي',
    true,
    true,
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com')
);

COMMIT;

-- رسالة النجاح
SELECT 'تم إنشاء حساب الأدمن بنجاح!' as message;
SELECT 'البريد الإلكتروني: admin@zomiga.com' as email;
SELECT 'كلمة المرور: Admin123!@#' as password;
SELECT 'يرجى تغيير كلمة المرور بعد أول تسجيل دخول' as note;