import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // جلب الفئات من قاعدة البيانات مع عدد القنوات في كل فئة
    const { data: categories, error } = await supabase
      .from('channel_categories')
      .select(`
        id,
        name,
        name_ar,
        description,
        icon,
        color,
        sort_order,
        channels(count)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) {
      console.error('خطأ في تحميل الفئات:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
    
    // تنسيق البيانات لتشمل عدد القنوات
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name || category.name_ar,
      name_ar: category.name_ar || category.name,
      description: category.description,
      icon: category.icon || 'tv',
      color: category.color || '#059669',
      sort_order: category.sort_order || 0,
      channel_count: category.channels?.[0]?.count || 0
    }))
    
    res.status(200).json(formattedCategories)
  } catch (error) {
    console.error('خطأ في تحميل الفئات:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}