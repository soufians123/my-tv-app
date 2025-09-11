const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAdmin() {
  try {
    console.log('🚀 Setting up admin account...')
    
    const adminEmail = 'admin@zomiga.com'
    const adminPassword = 'Admin123!@#'
    
    console.log('📝 Please follow these steps to create the admin account:')
    console.log('\n1. Go to your Supabase Dashboard')
    console.log('2. Navigate to Authentication > Users')
    console.log('3. Click "Add User" button')
    console.log(`4. Enter email: ${adminEmail}`)
    console.log(`5. Enter password: ${adminPassword}`)
    console.log('6. Make sure "Auto Confirm User" is checked')
    console.log('7. Click "Create User"')
    console.log('\n8. Then go to Table Editor > profiles table')
    console.log('9. Click "Insert" > "Insert row"')
    console.log('10. Fill in the following data:')
    console.log('    - id: [copy the user ID from Authentication > Users]')
    console.log(`    - email: ${adminEmail}`)
    console.log('    - full_name: مدير النظام')
    console.log('    - role: admin')
    console.log('    - created_at: [current timestamp]')
    console.log('    - updated_at: [current timestamp]')
    console.log('11. Click "Save"')
    
    console.log('\n✅ Admin account will be ready after completing these steps!')
    console.log(`📧 Login Email: ${adminEmail}`)
    console.log(`🔑 Login Password: ${adminPassword}`)
    console.log('\n⚠️  Remember to change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
setupAdmin().then(() => {
  console.log('\n✨ Instructions provided successfully')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})