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
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'refund')),
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift claims table
CREATE TABLE IF NOT EXISTS gift_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
    delivery_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Advertisement indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);

-- Affiliate product indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON affiliate_products(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_featured ON affiliate_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_category ON affiliate_products(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_id ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_product_id ON affiliate_earnings(product_id);

-- Gift and points indexes
CREATE INDEX IF NOT EXISTS idx_gifts_available ON gifts(is_available);
CREATE INDEX IF NOT EXISTS idx_gifts_category ON gifts(category);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_claims_user_id ON gift_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_claims_gift_id ON gift_claims(gift_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_claims ENABLE ROW LEVEL SECURITY;

-- Advertisement policies
-- Ensure idempotence by dropping if they already exist
DROP POLICY IF EXISTS "Public can view active advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can view all advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can insert advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can update advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can delete advertisements" ON advertisements;

CREATE POLICY "Public can view active advertisements" ON advertisements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all advertisements" ON advertisements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert advertisements" ON advertisements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update advertisements" ON advertisements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete advertisements" ON advertisements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Affiliate product policies
-- Ensure idempotence by dropping existing policies if they exist
DROP POLICY IF EXISTS "Public can view active affiliate products" ON affiliate_products;
DROP POLICY IF EXISTS "Admins can manage affiliate products" ON affiliate_products;
CREATE POLICY "Public can view active affiliate products" ON affiliate_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage affiliate products" ON affiliate_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Gift policies
-- Ensure idempotence by dropping existing policies if they exist
DROP POLICY IF EXISTS "Public can view available gifts" ON gifts;
DROP POLICY IF EXISTS "Admins can manage gifts" ON gifts;
CREATE POLICY "Public can view available gifts" ON gifts
    FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage gifts" ON gifts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User points policies
-- Ensure idempotence by dropping existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON user_points;
CREATE POLICY "Users can view their own points" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON user_points
    FOR UPDATE USING (auth.uid() = user_id);

-- Point transactions policies
-- Ensure idempotence by dropping existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON point_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON point_transactions;
CREATE POLICY "Users can view their own transactions" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON point_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gift claims policies
-- Ensure idempotence by dropping existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own claims" ON gift_claims;
DROP POLICY IF EXISTS "Users can create their own claims" ON gift_claims;
DROP POLICY IF EXISTS "Admins can manage all claims" ON gift_claims;
CREATE POLICY "Users can view their own claims" ON gift_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" ON gift_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON gift_claims
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_products_updated_at ON affiliate_products;
CREATE TRIGGER update_affiliate_products_updated_at
    BEFORE UPDATE ON affiliate_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gifts_updated_at ON gifts;
CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gift_claims_updated_at ON gift_claims;
CREATE TRIGGER update_gift_claims_updated_at
    BEFORE UPDATE ON gift_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();