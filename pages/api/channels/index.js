import { loadChannels } from '../../../lib/supabaseChannelsService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const channels = await loadChannels()
    res.status(200).json(channels)
  } catch (error) {
    console.error('خطأ في تحميل القنوات:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}