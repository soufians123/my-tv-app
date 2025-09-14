import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Validate URL format
if (supabaseUrl === 'Project URL/' || !supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL: "${supabaseUrl}". Please set NEXT_PUBLIC_SUPABASE_URL to your actual Supabase project URL (e.g., https://your-project.supabase.co)`)
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'zomiga-auth'
  },
  global: {
    headers: {
      'x-client-info': 'zomiga-web'
    }
  }
})

// Helper functions for authentication
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }
}

// Database helper functions
export const db = {
  // Channels
  getChannels: async () => {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
      .eq('is_active', true)
      .order('sort_order')
    return { data, error }
  },

  getChannelsByCategory: async (categoryId) => {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_categories(name, name_ar, color, icon)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order')
    return { data, error }
  },

  getChannelCategories: async () => {
    const { data, error } = await supabase
      .from('channel_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    return { data, error }
  },

  createChannel: async (channelData) => {
    const { data, error } = await supabase
      .from('channels')
      .insert([channelData])
      .select()
    return { data, error }
  },

  updateChannel: async (id, channelData) => {
    const { data, error } = await supabase
      .from('channels')
      .update(channelData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteChannel: async (id) => {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Articles
  getArticles: async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createArticle: async (article) => {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
    return { data, error }
  },

  // Games
  getGames: async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name')
    return { data, error }
  },

  updateUserScore: async (userId, gameId, score) => {
    const { data, error } = await supabase
      .from('user_scores')
      .upsert({
        user_id: userId,
        game_id: gameId,
        score: score,
        updated_at: new Date().toISOString()
      })
    return { data, error }
  },

  getLeaderboard: async (gameId) => {
    const { data, error } = await supabase
      .from('user_scores')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10)
    return { data, error }
  },

  // Affiliate Products
  getAffiliateProducts: async () => {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  trackClick: async (productId, userId) => {
    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert([{
        product_id: productId,
        user_id: userId,
        clicked_at: new Date().toISOString()
      }])
    return { data, error }
  }
}

// Log successful connection
console.log('Supabase client initialized successfully')