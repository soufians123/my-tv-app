import { loadChannelCategories } from '../../../lib/supabaseChannelsService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const categories = await loadChannelCategories()
    res.status(200).json(categories)
  } catch (error) {
    console.error('خطأ في تحميل الفئات:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}