-- =============================================
-- FIX REMAINING TABLES FOR SUPABASE
-- This script handles existing triggers and creates missing tables
-- =============================================

BEGIN;

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
DROP TRIGGER IF EXISTS update_affiliate_products_updated_at ON affiliate_products;
DROP TRIGGER IF EXISTS update_gifts_updated_at ON gifts;
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
DROP TRIGGER IF EXISTS update_gift_claims_updated_at ON gift_claims;

-- Create advertisements table if not exists
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
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    impression_count INTEGER DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT 0,
    cost_per_click DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad clicks tracking table if not exists
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad impressions tracking table if not exists
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate products table if not exists
CREATE TABLE IF NOT EXISTS affiliate_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    affiliate_url TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate clicks tracking table if not exists
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate earnings table if not exists
CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gifts table if not exists
CREATE TABLE IF NOT EXISTS gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    image_url TEXT,
    category TEXT DEFAULT 'general',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_active column to gifts table if it doesn't exist
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create user points table if not exists
CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create point transactions table if not exists
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift claims table if not exists
CREATE TABLE IF NOT EXISTS gift_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON affiliate_products(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_id ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_user_id ON affiliate_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_active ON gifts(is_active);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_claims_user_id ON gift_claims(user_id);

-- Enable Row Level Security (RLS)
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

-- RLS Policies for advertisements
-- Ensure old combined policy is removed if it exists
DROP POLICY IF EXISTS "Admins can manage advertisements" ON advertisements;
-- Ensure idempotence: drop existing policies if they exist before re-creating
DROP POLICY IF EXISTS "Public advertisements are viewable by everyone" ON advertisements;
DROP POLICY IF EXISTS "Users can view advertisement analytics" ON advertisements;
DROP POLICY IF EXISTS "Admins can view all advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can insert advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can update advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can delete advertisements" ON advertisements;
CREATE POLICY "Public advertisements are viewable by everyone" ON advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view advertisement analytics" ON advertisements FOR SELECT USING (auth.role() = 'authenticated');
-- Admin granular policies using profiles.role
CREATE POLICY "Admins can view all advertisements" ON advertisements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can insert advertisements" ON advertisements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update advertisements" ON advertisements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete advertisements" ON advertisements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for ad tracking
-- Ensure idempotence: drop existing policies before creating
DROP POLICY IF EXISTS "Users can insert ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Users can view their own ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Users can insert ad impressions" ON ad_impressions;
CREATE POLICY "Users can insert ad clicks" ON ad_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own ad clicks" ON ad_clicks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert ad impressions" ON ad_impressions FOR INSERT WITH CHECK (true);

-- RLS Policies for affiliate products
DROP POLICY IF EXISTS "Active affiliate products are viewable by everyone" ON affiliate_products;
CREATE POLICY "Active affiliate products are viewable by everyone" ON affiliate_products FOR SELECT USING (is_active = true);

-- RLS Policies for affiliate tracking
DROP POLICY IF EXISTS "Users can insert affiliate clicks" ON affiliate_clicks;
DROP POLICY IF EXISTS "Users can view their own affiliate clicks" ON affiliate_clicks;
DROP POLICY IF EXISTS "Users can view their own affiliate earnings" ON affiliate_earnings;
CREATE POLICY "Users can insert affiliate clicks" ON affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own affiliate clicks" ON affiliate_clicks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own affiliate earnings" ON affiliate_earnings FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for gifts
DROP POLICY IF EXISTS "Active gifts are viewable by everyone" ON gifts;
CREATE POLICY "Active gifts are viewable by everyone" ON gifts FOR SELECT USING (is_active = true);

-- RLS Policies for user points
-- User points policies (ensure idempotence)
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON user_points;
DROP POLICY IF EXISTS "System can insert user points" ON user_points;
CREATE POLICY "Users can view their own points" ON user_points FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own points" ON user_points FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert user points" ON user_points FOR INSERT WITH CHECK (true);

-- RLS Policies for point transactions
-- Point transactions policies (ensure idempotence)
DROP POLICY IF EXISTS "Users can view their own point transactions" ON point_transactions;
DROP POLICY IF EXISTS "System can insert point transactions" ON point_transactions;
CREATE POLICY "Users can view their own point transactions" ON point_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert point transactions" ON point_transactions FOR INSERT WITH CHECK (true);

-- RLS Policies for gift claims
-- Gift claims policies (ensure idempotence)
DROP POLICY IF EXISTS "Users can view their own gift claims" ON gift_claims;
DROP POLICY IF EXISTS "Users can insert their own gift claims" ON gift_claims;
DROP POLICY IF EXISTS "Users can update their own gift claims" ON gift_claims;
CREATE POLICY "Users can view their own gift claims" ON gift_claims FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own gift claims" ON gift_claims FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own gift claims" ON gift_claims FOR UPDATE USING (user_id = auth.uid());

-- Create or replace update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_products_updated_at
    BEFORE UPDATE ON affiliate_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON gifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_claims_updated_at
    BEFORE UPDATE ON gift_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO gifts (name, description, points_required, category, stock_quantity) VALUES
('قسيمة شراء 50 ريال', 'قسيمة شراء بقيمة 50 ريال سعودي', 500, 'vouchers', 100),
('قسيمة شراء 100 ريال', 'قسيمة شراء بقيمة 100 ريال سعودي', 1000, 'vouchers', 50),
('سماعات لاسلكية', 'سماعات بلوتوث عالية الجودة', 1500, 'electronics', 20),
('كوب قهوة مخصص', 'كوب قهوة بتصميم مخصص', 300, 'accessories', 200),
('تيشيرت مخصص', 'تيشيرت بتصميم التطبيق', 400, 'clothing', 100)
ON CONFLICT DO NOTHING;

COMMIT;