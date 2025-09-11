import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Checking profiles table...');
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return res.status(500).json({ error: 'Failed to fetch profiles', details: profilesError });
    }
    
    console.log('Profiles found:', profiles);
    
    // Check if we can create a test profile
    const testProfile = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating test profile:', testProfile);
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating test profile:', createError);
      return res.status(500).json({ 
        error: 'Failed to create test profile', 
        details: createError,
        existingProfiles: profiles
      });
    }
    
    console.log('Test profile created:', newProfile);
    
    return res.status(200).json({
      success: true,
      message: 'Profiles check completed',
      existingProfiles: profiles,
      testProfile: newProfile
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
}