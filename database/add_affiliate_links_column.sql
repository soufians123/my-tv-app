-- إضافة عمود روابط الإحالة لجدول المقالات

-- إضافة عمود affiliate_links من نوع JSONB
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS affiliate_links JSONB DEFAULT '[]'::jsonb;

-- إضافة فهرس للبحث في روابط الإحالة
CREATE INDEX IF NOT EXISTS idx_articles_affiliate_links 
ON articles USING GIN (affiliate_links);

-- تحديث المقالات الموجودة لتحتوي على مصفوفة فارغة إذا كانت null
UPDATE articles 
SET affiliate_links = '[]'::jsonb 
WHERE affiliate_links IS NULL;

-- إضافة تعليق للعمود
COMMENT ON COLUMN articles.affiliate_links IS 'روابط الإحالة المرتبطة بالمقال في صيغة JSON';

-- مثال على بنية البيانات المتوقعة:
-- [
--   {
--     "title": "عنوان الرابط",
--     "url": "https://example.com/affiliate-link"
--   },
--   {
--     "title": "رابط آخر",
--     "url": "https://another-example.com/link"
--   }
-- ]