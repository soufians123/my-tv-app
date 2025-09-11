const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...')
    
    const adminEmail = 'admin@zomiga.com'
    const adminPassword = 'Admin123!@#'
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    })
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('⚠️  Admin user already exists, updating profile...')
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(user => user.email === adminEmail)
        
        if (existingUser) {
          // Update or create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.id,
              email: adminEmail,
              full_name: 'مدير النظام',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (profileError) {
            console.error('❌ Error updating profile:', profileError)
            return
          }
          
          console.log('✅ Admin profile updated successfully!')
          console.log(`📧 Email: ${adminEmail}`)
          console.log(`🔑 Password: ${adminPassword}`)
          return
        }
      } else {
        console.error('❌ Error creating admin user:', authError)
        return
      }
    }
    
    if (authData?.user) {
      console.log('✅ Admin user created in auth system')
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: adminEmail,
          full_name: 'مدير النظام',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('❌ Error creating profile:', profileError)
        return
      }
      
      console.log('✅ Admin profile created successfully!')
      console.log('\n🎉 Admin account setup complete!')
      console.log(`📧 Email: ${adminEmail}`)
      console.log(`🔑 Password: ${adminPassword}`)
      console.log('\n⚠️  Please change the password after first login!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('\n✨ Script completed')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})