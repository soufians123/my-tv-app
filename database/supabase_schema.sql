-- إنشاء جداول قاعدة البيانات لتطبيق الألعاب
-- يجب تشغيل هذا الملف في Supabase SQL Editor

-- جدول الألعاب
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    max_score INTEGER DEFAULT 0,
    play_time TEXT,
    players INTEGER DEFAULT 0,
    image TEXT,
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    achievements TEXT[], -- مصفوفة من الإنجازات
    game_file TEXT,
    game_type TEXT,
    instructions TEXT[], -- مصفوفة من التعليمات
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول نقاط المستخدمين
CREATE TABLE IF NOT EXISTS user_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    play_time INTEGER, -- بالثواني
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id, completed_at)
);

-- جدول إنجازات المستخدمين
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id, achievement_name)
);

-- جدول إحصائيات المستخدمين
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_play_time INTEGER DEFAULT 0, -- بالثواني
    achievements_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول فئات الألعاب
CREATE TABLE IF NOT EXISTS game_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج البيانات الأساسية للفئات
INSERT INTO game_categories (id, name, icon, description) VALUES
('strategy', 'استراتيجية', '♟️', 'ألعاب تتطلب التخطيط والتفكير الاستراتيجي'),
('memory', 'ذاكرة', '🧠', 'ألعاب تختبر وتحسن الذاكرة'),
('puzzle', 'ألغاز', '🧩', 'ألعاب الألغاز والتحديات المنطقية'),
('word', 'كلمات', '📝', 'ألعاب الكلمات والمفردات'),
('math', 'رياضيات', '🔢', 'ألعاب الحساب والرياضيات')
ON CONFLICT (id) DO NOTHING;

-- إدراج البيانات الأساسية للألعاب
INSERT INTO games (id, title, description, category, difficulty, max_score, play_time, players, image, featured, rating, achievements, game_file, game_type, instructions) VALUES
('chess', 'الشطرنج الذكي', 'لعبة شطرنج متقدمة مع ذكاء اصطناعي قوي ومستويات صعوبة متدرجة', 'strategy', 'hard', 5000, '15-45 دقيقة', 2340, 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center', true, 4.9, ARRAY['سيد الشطرنج', 'استراتيجي محترف'], '/games/chess', 'chess', ARRAY['حرك القطع وفقاً لقواعد الشطرنج', 'خطط لحماية الملك', 'استخدم استراتيجيات متقدمة', 'اهزم الذكاء الاصطناعي']),

('kingdom-wars', 'حرب الممالك', 'لعبة استراتيجية شاملة لإدارة الموارد وبناء الجيوش والتوسع', 'strategy', 'hard', 8000, '30-60 دقيقة', 1890, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center', true, 4.8, ARRAY['ملك الممالك', 'قائد عسكري'], '/games/kingdom-wars', 'strategy', ARRAY['ابن مملكتك وطور مواردك', 'جند الجيوش وخطط للمعارك', 'وسع أراضيك واحتل المناطق', 'اهزم الأعداء واصبح الملك الأعظم']),

('memory', 'لعبة الذاكرة المتقدمة', 'اختبر قوة ذاكرتك مع مستويات متدرجة الصعوبة وتحديات مثيرة', 'memory', 'medium', 3000, '5-15 دقيقة', 3450, 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center', false, 4.6, ARRAY['ذاكرة فولاذية', 'سرعة البرق'], '/games/memory', 'memory', ARRAY['انقر على البطاقات لكشفها', 'ابحث عن الأزواج المتطابقة', 'اكمل جميع الأزواج قبل انتهاء الوقت', 'كلما أنهيت بسرعة، كلما حصلت على نقاط أكثر']),

('sudoku', 'سودوكو الخبراء', 'حل ألغاز السودوكو المتقدمة مع مستويات صعوبة مختلفة', 'puzzle', 'hard', 4000, '10-30 دقيقة', 2100, 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center', false, 4.7, ARRAY['خبير سودوكو', 'حلال الألغاز'], '/games/sudoku', 'sudoku', ARRAY['املأ الشبكة بالأرقام من 1 إلى 9', 'كل صف وعمود ومربع يجب أن يحتوي على كل رقم مرة واحدة', 'استخدم المنطق لحل اللغز', 'اكمل الشبكة بأسرع وقت ممكن']),

('crossword', 'الكلمات المتقاطعة', 'حل الكلمات المتقاطعة باللغة العربية مع مستويات متنوعة', 'word', 'medium', 2500, '10-25 دقيقة', 1750, 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center', false, 4.4, ARRAY['خبير الكلمات', 'لغوي ماهر'], '/games/crossword', 'word', ARRAY['اقرأ التلميحات بعناية', 'املأ الكلمات في الشبكة', 'استخدم الحروف المتقاطعة كمساعدة', 'اكمل جميع الكلمات لتفوز'])
ON CONFLICT (id) DO NOTHING;

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_game_id ON user_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_score ON user_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(featured);

-- إنشاء دالة لتحديث إحصائيات المستخدم
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث إحصائيات المستخدم عند إضافة نقاط جديدة
    INSERT INTO user_stats (user_id, total_score, games_played, best_score, achievements_count)
    SELECT 
        NEW.user_id,
        COALESCE(SUM(score), 0) as total_score,
        COUNT(DISTINCT game_id) as games_played,
        COALESCE(MAX(score), 0) as best_score,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = NEW.user_id) as achievements_count
    FROM user_scores 
    WHERE user_id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        games_played = EXCLUDED.games_played,
        best_score = GREATEST(user_stats.best_score, EXCLUDED.best_score),
        achievements_count = EXCLUDED.achievements_count,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المشغل لتحديث الإحصائيات تلقائياً
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE ON user_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- إنشاء دالة للحصول على لوحة المتصدرين
CREATE OR REPLACE FUNCTION get_leaderboard(game_filter TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    total_score INTEGER,
    games_played INTEGER,
    best_score INTEGER,
    achievements_count INTEGER,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.user_id,
        COALESCE(p.username, p.email, 'مستخدم مجهول') as username,
        p.avatar_url,
        us.total_score,
        us.games_played,
        us.best_score,
        us.achievements_count,
        ROW_NUMBER() OVER (ORDER BY us.total_score DESC)::INTEGER as rank
    FROM user_stats us
    LEFT JOIN auth.users p ON us.user_id = p.id
    WHERE (game_filter IS NULL OR us.user_id IN (
        SELECT DISTINCT user_id FROM user_scores WHERE game_id = game_filter
    ))
    ORDER BY us.total_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- تمكين Row Level Security
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
-- المستخدمون يمكنهم قراءة جميع النقاط ولكن تعديل نقاطهم فقط
CREATE POLICY "Users can view all scores" ON user_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert their own scores" ON user_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON user_scores FOR UPDATE USING (auth.uid() = user_id);

-- المستخدمون يمكنهم قراءة جميع الإنجازات ولكن تعديل إنجازاتهم فقط
CREATE POLICY "Users can view all achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المستخدمون يمكنهم قراءة جميع الإحصائيات ولكن تعديل إحصائياتهم فقط
CREATE POLICY "Users can view all stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- تعليقات للمطورين
COMMENT ON TABLE games IS 'جدول الألعاب المتاحة في التطبيق';
COMMENT ON TABLE user_scores IS 'جدول نقاط المستخدمين في الألعاب المختلفة';
COMMENT ON TABLE user_achievements IS 'جدول إنجازات المستخدمين';
COMMENT ON TABLE user_stats IS 'جدول إحصائيات المستخدمين الإجمالية';
COMMENT ON TABLE game_categories IS 'جدول فئات الألعاب';

-- إنشاء view للإحصائيات العامة
CREATE OR REPLACE VIEW game_statistics AS
SELECT 
    g.id,
    g.title,
    g.category,
    COUNT(us.id) as total_plays,
    AVG(us.score) as average_score,
    MAX(us.score) as highest_score,
    COUNT(DISTINCT us.user_id) as unique_players
FROM games g
LEFT JOIN user_scores us ON g.id = us.game_id
GROUP BY g.id, g.title, g.category;

COMMENT ON VIEW game_statistics IS 'إحصائيات عامة للألعاب';