-- إنشاء المستخدم الإداري في Supabase
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

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
    is_active
)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    'admin',
    'مدير النظام',
    'مدير النظام الرئيسي',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com')
);

-- إنشاء تفضيلات المستخدم الإداري (مع تجنب التكرار)
INSERT INTO user_preferences (
    user_id,
    language,
    theme,
    notifications_enabled,
    email_notifications,
    push_notifications
)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    'ar',
    'light',
    true,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com')
);

-- إنشاء نقاط المستخدم الإداري (مع تجنب التكرار)
INSERT INTO user_points (
    user_id,
    total_points,
    available_points
)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com'),
    1000,
    1000
WHERE NOT EXISTS (
    SELECT 1 FROM user_points WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@zomiga.com')
);

COMMIT;