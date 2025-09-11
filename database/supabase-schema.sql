-- إنشاء قاعدة بيانات Zomiga TV
-- هذا الملف يحتوي على جميع الجداول المطلوبة للنظام

-- تفعيل Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- إنشاء جدول فئات القنوات
CREATE TABLE IF NOT EXISTS channel_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#059669',
    icon VARCHAR(50) DEFAULT 'tv',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول القنوات
CREATE TABLE IF NOT EXISTS channels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    description TEXT,
    logo_url TEXT,
    stream_url TEXT NOT NULL,
    backup_stream_url TEXT,
    category_id BIGINT REFERENCES channel_categories(id) ON DELETE SET NULL,
    country VARCHAR(100),
    language VARCHAR(50) DEFAULT 'العربية',
    quality VARCHAR(10) DEFAULT 'HD',
    is_live BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    viewer_count BIGINT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(200),
    avatar_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    country VARCHAR(100),
    language VARCHAR(10) DEFAULT 'ar',
    theme VARCHAR(10) DEFAULT 'light',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS channel_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- إنشاء جدول مشاهدات القنوات
CREATE TABLE IF NOT EXISTS channel_views (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    view_duration INTEGER DEFAULT 0, -- بالثواني
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المقالات
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    views_count BIGINT DEFAULT 0,
    reading_time INTEGER, -- بالدقائق
    seo_title VARCHAR(200),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول الألعاب
CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    game_url TEXT NOT NULL,
    category VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'easy',
    max_score INTEGER,
    is_active BOOLEAN DEFAULT true,
    play_count BIGINT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول نقاط المستخدمين في الألعاب
CREATE TABLE IF NOT EXISTS user_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    game_id BIGINT REFERENCES games(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level_reached INTEGER DEFAULT 1,
    time_played INTEGER DEFAULT 0, -- بالثواني
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- إنشاء جدول المنتجات التابعة
CREATE TABLE IF NOT EXISTS affiliate_products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    image_url TEXT,
    affiliate_url TEXT NOT NULL,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100),
    brand VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    click_count BIGINT DEFAULT 0,
    conversion_count BIGINT DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول نقرات المنتجات التابعة
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES affiliate_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_channels_category_id ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_is_active ON channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_sort_order ON channels(sort_order);
CREATE INDEX IF NOT EXISTS idx_channels_country ON channels(country);
CREATE INDEX IF NOT EXISTS idx_channels_language ON channels(language);

CREATE INDEX IF NOT EXISTS idx_channel_favorites_user_id ON channel_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_favorites_channel_id ON channel_favorites(channel_id);

CREATE INDEX IF NOT EXISTS idx_channel_views_user_id ON channel_views(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_views_channel_id ON channel_views(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_views_created_at ON channel_views(created_at);

CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_game_id ON user_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_score ON user_scores(score DESC);

-- إنشاء دوال التحديث التلقائي للوقت
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة المشغلات للتحديث التلقائي
CREATE TRIGGER update_channel_categories_updated_at BEFORE UPDATE ON channel_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_scores_updated_at BEFORE UPDATE ON user_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_products_updated_at BEFORE UPDATE ON affiliate_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج بيانات أولية لفئات القنوات
INSERT INTO channel_categories (name, name_ar, color, icon, sort_order) VALUES
('news', 'إخبارية', '#dc2626', 'news', 1),
('general', 'عامة', '#059669', 'tv', 2),
('sports', 'رياضية', '#2563eb', 'sports', 3),
('kids', 'أطفال', '#7c3aed', 'kids', 4),
('entertainment', 'ترفيهية', '#ea580c', 'entertainment', 5),
('cultural', 'ثقافية', '#0891b2', 'cultural', 6),
('documentary', 'وثائقية', '#65a30d', 'documentary', 7),
('music', 'موسيقية', '#c2410c', 'music', 8),
('cooking', 'طبخ', '#be185d', 'cooking', 9)
ON CONFLICT (name) DO NOTHING;

-- إدراج بيانات أولية للقنوات
INSERT INTO channels (name, name_ar, description, logo_url, stream_url, category_id, country, language, quality, sort_order) VALUES
('الجزيرة', 'الجزيرة', 'قناة إخبارية عربية رائدة تقدم تغطية شاملة للأحداث العالمية والعربية', 'https://i.imgur.com/BB93NQP.png', 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8', 1, 'قطر', 'العربية', 'HD', 1),
('العربية', 'العربية', 'قناة إخبارية عربية تقدم آخر الأخبار والتحليلات السياسية والاقتصادية', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al-Arabiya_new_logo.svg/640px-Al-Arabiya_new_logo.svg.png', 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8', 1, 'السعودية', 'العربية', 'HD', 2),
('MBC 1', 'MBC 1', 'قناة ترفيهية عامة تقدم أفضل المسلسلات والبرامج العربية', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/MBC1_logo.svg/512px-MBC1_logo.svg.png', 'https://shls-mbc1ksa-prod-dub.shahid.net/out/v1/451b666db1fb41c7a4bbecf7b4865107/index.m3u8', 2, 'السعودية', 'العربية', 'HD', 3);

-- إدراج إعدادات أولية
INSERT INTO settings (key, value, description, type, is_public) VALUES
('site_name', 'Zomiga TV', 'اسم الموقع', 'string', true),
('site_description', 'منصة مشاهدة القنوات التلفزيونية العربية', 'وصف الموقع', 'string', true),
('max_channels_per_user', '50', 'الحد الأقصى للقنوات المفضلة لكل مستخدم', 'number', false),
('enable_user_registration', 'true', 'تفعيل تسجيل المستخدمين الجدد', 'boolean', false),
('default_language', 'ar', 'اللغة الافتراضية للموقع', 'string', true)
ON CONFLICT (key) DO NOTHING;

-- تفعيل Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
-- المستخدمون يمكنهم قراءة وتحديث ملفاتهم الشخصية فقط
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- المستخدمون يمكنهم إدارة مفضلاتهم فقط
CREATE POLICY "Users can manage own favorites" ON channel_favorites FOR ALL USING (auth.uid() = user_id);

-- المستخدمون يمكنهم رؤية مشاهداتهم فقط
CREATE POLICY "Users can view own views" ON channel_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own views" ON channel_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المستخدمون يمكنهم إدارة نقاطهم في الألعاب
CREATE POLICY "Users can manage own scores" ON user_scores FOR ALL USING (auth.uid() = user_id);

-- الجداول العامة (قراءة فقط للجميع)
CREATE POLICY "Anyone can view channels" ON channels FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view channel categories" ON channel_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view published articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view active games" ON games FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active affiliate products" ON affiliate_products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view public settings" ON settings FOR SELECT USING (is_public = true);

-- دالة لإنشاء ملف شخصي تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- مشغل لإنشاء الملف الشخصي
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة لتحديث عداد المشاهدات
CREATE OR REPLACE FUNCTION increment_channel_views(channel_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE channels 
  SET viewer_count = viewer_count + 1 
  WHERE id = channel_id_param;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب متوسط التقييم
CREATE OR REPLACE FUNCTION calculate_average_rating(channel_id_param BIGINT)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM channel_views 
  WHERE channel_id = channel_id_param AND rating IS NOT NULL;
  
  UPDATE channels 
  SET rating = COALESCE(avg_rating, 0.0)
  WHERE id = channel_id_param;
  
  RETURN COALESCE(avg_rating, 0.0);
END;
$$ LANGUAGE plpgsql;

COMMIT;