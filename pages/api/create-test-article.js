import { createArticle } from '../../lib/articlesService';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For testing purposes, we'll create a test user or use null
    let userId = null;
    
    // Try to get current session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      userId = session.user.id;
      console.log('Using authenticated user:', userId);
    } else {
      console.log('No authenticated user, will use null for testing');
    }

    // Create test article
    const testArticle = {
      title: 'مقال تجريبي ' + Date.now(),
      content: 'هذا محتوى المقال التجريبي',
      excerpt: 'مقتطف تجريبي',
      status: 'draft',
      category_id: null // Allow null category for testing
    };

    console.log('Article data:', testArticle);

    const result = await createArticle(testArticle, userId);
    
    if (result) {
      console.log('Article created successfully:', result);
      return res.status(200).json({ 
        success: true, 
        message: 'Article created successfully',
        article: result 
      });
    } else {
      console.log('Article creation failed - no result returned');
      return res.status(500).json({ 
        error: 'Article creation failed',
        message: 'No result returned from createArticle function'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
}