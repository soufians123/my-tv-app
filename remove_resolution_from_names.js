const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Function to clean channel name by removing resolution info
function cleanChannelName(name) {
  if (!name) return name
  
  // Remove resolution patterns like (720p), (1080p), (480p), etc.
  return name
    .replace(/\s*\(\d+p\)/g, '') // Remove (XXXp)
    .replace(/\s*\[.*?\]/g, '') // Remove [Not 24/7], [Geo-blocked], etc.
    .trim()
}

async function updateChannelNames() {
  try {
    console.log('جاري جلب القنوات من قاعدة البيانات...')
    
    // Get all channels
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, name_ar')
    
    if (error) {
      console.error('خطأ في جلب القنوات:', error)
      return
    }
    
    console.log(`تم العثور على ${channels.length} قناة`)
    
    let updatedCount = 0
    
    for (const channel of channels) {
      const originalName = channel.name
      const originalNameAr = channel.name_ar
      
      const cleanedName = cleanChannelName(originalName)
      const cleanedNameAr = cleanChannelName(originalNameAr)
      
      // Check if any changes are needed
      if (cleanedName !== originalName || cleanedNameAr !== originalNameAr) {
        console.log(`تحديث القناة: ${originalName} -> ${cleanedName}`)
        
        const { error: updateError } = await supabase
          .from('channels')
          .update({
            name: cleanedName,
            name_ar: cleanedNameAr || cleanedName
          })
          .eq('id', channel.id)
        
        if (updateError) {
          console.error(`خطأ في تحديث القناة ${channel.id}:`, updateError)
        } else {
          updatedCount++
        }
      }
    }
    
    console.log(`\nتم تحديث ${updatedCount} قناة بنجاح`)
    console.log('انتهت عملية تنظيف أسماء القنوات')
    
  } catch (error) {
    console.error('خطأ عام:', error)
  }
}

// Run the update
updateChannelNames()