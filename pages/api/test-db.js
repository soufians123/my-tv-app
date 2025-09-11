import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    console.log('Testing database connection...');
    
    // Test articles table
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (articlesError) {
      console.error('Articles table error:', articlesError);
      return res.status(500).json({ error: 'Articles table error', details: articlesError });
    }
    
    // Test article_categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError);
      return res.status(500).json({ error: 'Categories table error', details: categoriesError });
    }
    
    // Test creating a simple article
    console.log('Testing article creation...');
    const testTitle = 'Test Article ' + Date.now();
    const testSlug = testTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
    const testArticle = {
      title: testTitle,
      slug: testSlug,
      content: 'This is a test article content',
      excerpt: 'Test excerpt',
      status: 'draft',
      author_id: null, // Allow null for testing
      category_id: categories.length > 0 ? categories[0].id : null
    };
    
    const { data: newArticle, error: createError } = await supabase
      .from('articles')
      .insert([testArticle])
      .select()
      .single();
    
    if (createError) {
      console.error('Article creation error:', createError);
      return res.status(500).json({ 
        error: 'Article creation failed', 
        details: createError,
        testData: testArticle
      });
    }
    
    // Clean up - delete the test article
    await supabase.from('articles').delete().eq('id', newArticle.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Database connection and article creation test successful',
      articlesTableStructure: articles.length > 0 ? Object.keys(articles[0]) : 'No articles found',
      categoriesTableStructure: categories.length > 0 ? Object.keys(categories[0]) : 'No categories found',
      testArticleId: newArticle.id
    });
    
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}