-- Complete Supabase Schema for All Application Components
-- This file contains all tables needed to migrate the application to Supabase

-- =============================================
-- PROFILES AND USER MANAGEMENT
-- =============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'ar',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    favorite_categories TEXT[] DEFAULT '{}',
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- TV CHANNELS SYSTEM
-- =============================================

-- Channel categories table
CREATE TABLE IF NOT EXISTS channel_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    stream_url TEXT NOT NULL,
    backup_stream_url TEXT,
    category_id UUID REFERENCES channel_categories(id) ON DELETE SET NULL,
    country TEXT DEFAULT 'SA',
    language TEXT DEFAULT 'ar',
    quality TEXT DEFAULT 'HD' CHECK (quality IN ('SD', 'HD', '4K')),
    is_live BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    viewer_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorite channels
CREATE TABLE IF NOT EXISTS channel_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- Channel viewing history
CREATE TABLE IF NOT EXISTS channel_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    view_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ARTICLES SYSTEM
-- =============================================

-- Article categories table
CREATE TABLE IF NOT EXISTS article_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#10B981',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0, -- in minutes
    tags TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article comments table
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article likes table
CREATE TABLE IF NOT EXISTS article_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Article views table
CREATE TABLE IF NOT EXISTS article_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADVERTISEMENTS SYSTEM
-- =============================================

-- Advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT NOT NULL,
    ad_type TEXT DEFAULT 'banner' CHECK (ad_type IN ('banner', 'popup', 'video', 'native')),
    position TEXT DEFAULT 'sidebar' CHECK (position IN ('header', 'sidebar', 'footer', 'content', 'popup')),
    target_audience TEXT[] DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    impression_count INTEGER DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT 0,
    cost_per_click DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AFFILIATE PRODUCTS SYSTEM
-- =============================================

-- Affiliate products table
CREATE TABLE IF NOT EXISTS affiliate_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    affiliate_link TEXT NOT NULL,
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 0,
    category TEXT,
    brand TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate earnings tracking
CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GIFTS AND POINTS SYSTEM
-- =============================================

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    points_required INTEGER NOT NULL,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    claimed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Point transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
    source TEXT NOT NULL, -- 'game_score', 'daily_login', 'gift_claim', etc.
    reference_id UUID, -- ID of related record (game_id, gift_id, etc.)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift claims table
CREATE TABLE IF NOT EXISTS gift_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
    delivery_address TEXT,
    delivery_notes TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_country ON channels(country);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channel_favorites_user ON channel_favorites(user_id);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_article ON article_likes(article_id);

-- Advertisements indexes
CREATE INDEX IF NOT EXISTS idx_ads_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id);

-- Points and transactions indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gift_claims_user ON gift_claims(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_claims ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Channel favorites policies
CREATE POLICY "Users can manage own favorites" ON channel_favorites FOR ALL USING (auth.uid() = user_id);

-- Channel views policies
CREATE POLICY "Users can view own history" ON channel_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own views" ON channel_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Article interactions policies
CREATE POLICY "Users can manage own comments" ON article_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view approved comments" ON article_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own likes" ON article_likes FOR ALL USING (auth.uid() = user_id);

-- Points and transactions policies
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gift claims" ON gift_claims FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_products_updated_at BEFORE UPDATE ON affiliate_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    
    INSERT INTO user_points (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update article stats
CREATE OR REPLACE FUNCTION update_article_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'article_likes' THEN
            UPDATE articles SET like_count = like_count + 1 WHERE id = NEW.article_id;
        ELSIF TG_TABLE_NAME = 'article_comments' THEN
            UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
        ELSIF TG_TABLE_NAME = 'article_views' THEN
            UPDATE articles SET view_count = view_count + 1 WHERE id = NEW.article_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'article_likes' THEN
            UPDATE articles SET like_count = like_count - 1 WHERE id = OLD.article_id;
        ELSIF TG_TABLE_NAME = 'article_comments' THEN
            UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for article stats
CREATE TRIGGER update_article_like_count AFTER INSERT OR DELETE ON article_likes FOR EACH ROW EXECUTE FUNCTION update_article_stats();
CREATE TRIGGER update_article_comment_count AFTER INSERT OR DELETE ON article_comments FOR EACH ROW EXECUTE FUNCTION update_article_stats();
CREATE TRIGGER update_article_view_count AFTER INSERT ON article_views FOR EACH ROW EXECUTE FUNCTION update_article_stats();

-- Function to handle point transactions
CREATE OR REPLACE FUNCTION handle_point_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.transaction_type IN ('earned', 'bonus') THEN
            UPDATE user_points 
            SET total_points = total_points + NEW.points,
                available_points = available_points + NEW.points,
                lifetime_points = lifetime_points + NEW.points
            WHERE user_id = NEW.user_id;
        ELSIF NEW.transaction_type IN ('spent', 'penalty') THEN
            UPDATE user_points 
            SET available_points = available_points - ABS(NEW.points)
            WHERE user_id = NEW.user_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for point transactions
CREATE TRIGGER handle_point_transaction_trigger AFTER INSERT ON point_transactions FOR EACH ROW EXECUTE FUNCTION handle_point_transaction();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default channel categories
INSERT INTO channel_categories (name, name_ar, description, icon, color) VALUES
('News', 'الأخبار', 'News and current affairs channels', '📺', '#EF4444'),
('Sports', 'الرياضة', 'Sports and fitness channels', '⚽', '#10B981'),
('Entertainment', 'الترفيه', 'Entertainment and variety shows', '🎭', '#8B5CF6'),
('Movies', 'الأفلام', 'Movie channels', '🎬', '#F59E0B'),
('Kids', 'الأطفال', 'Children and family channels', '🧸', '#EC4899'),
('Religious', 'الدينية', 'Religious and spiritual content', '🕌', '#06B6D4'),
('Educational', 'التعليمية', 'Educational and documentary channels', '📚', '#84CC16'),
('Music', 'الموسيقى', 'Music and concerts', '🎵', '#F97316')
ON CONFLICT DO NOTHING;

-- Insert default article categories
INSERT INTO article_categories (name, name_ar, slug, description, icon, color) VALUES
('Technology', 'التكنولوجيا', 'technology', 'Latest tech news and reviews', '💻', '#3B82F6'),
('Sports', 'الرياضة', 'sports', 'Sports news and updates', '⚽', '#10B981'),
('Health', 'الصحة', 'health', 'Health and wellness articles', '🏥', '#EF4444'),
('Business', 'الأعمال', 'business', 'Business and finance news', '💼', '#8B5CF6'),
('Entertainment', 'الترفيه', 'entertainment', 'Entertainment and celebrity news', '🎭', '#F59E0B'),
('Travel', 'السفر', 'travel', 'Travel guides and tips', '✈️', '#06B6D4'),
('Food', 'الطعام', 'food', 'Recipes and food culture', '🍽️', '#84CC16'),
('Lifestyle', 'نمط الحياة', 'lifestyle', 'Lifestyle and fashion', '👗', '#EC4899')
ON CONFLICT DO NOTHING;

-- Insert sample gifts
INSERT INTO gifts (name, description, points_required, category, stock_quantity) VALUES
('قسيمة شراء 50 ريال', 'قسيمة شراء بقيمة 50 ريال سعودي', 500, 'vouchers', 100),
('قسيمة شراء 100 ريال', 'قسيمة شراء بقيمة 100 ريال سعودي', 1000, 'vouchers', 50),
('سماعات لاسلكية', 'سماعات بلوتوث عالية الجودة', 1500, 'electronics', 20),
('كوب قهوة مخصص', 'كوب قهوة بتصميم مخصص', 300, 'accessories', 200),
('تيشيرت مخصص', 'تيشيرت بتصميم التطبيق', 400, 'clothing', 100)
ON CONFLICT DO NOTHING;

COMMIT;