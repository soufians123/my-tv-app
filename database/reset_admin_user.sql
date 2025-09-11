-- حذف وإعادة إنشاء المستخدم الإداري
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- حذف البيانات المرتبطة بالمستخدم الإداري
DELETE FROM user_points WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com');
DELETE FROM user_preferences WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com');
DELETE FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com');
DELETE FROM auth.users WHERE email = 'admin@zomiga.com';

-- إنشاء المستخدم الإداري من جديد
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
    'admin@zomiga.com',
    crypt('Ab123456', gen_salt('bf')),
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
);

-- إنشاء ملف تعريف للمستخدم الإداري
INSERT INTO profiles (
    id,
    username,
    full_name,
    bio,
    is_verified,
    is_active
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    'admin',
    'مدير النظام',
    'مدير النظام الرئيسي',
    true,
    true
);

-- إنشاء تفضيلات المستخدم الإداري
INSERT INTO user_preferences (
    user_id,
    language,
    theme,
    notifications_enabled,
    email_notifications,
    push_notifications
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    'ar',
    'light',
    true,
    true,
    true
);

-- إنشاء نقاط المستخدم الإداري
INSERT INTO user_points (
    user_id,
    total_points,
    available_points
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    1000,
    1000
);

COMMIT;