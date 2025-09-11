import pkg from './lib/supabase.js';
const { supabase } = pkg;

(async () => {
  try {
    console.log('Testing database connection...');
    
    // Test articles table
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (articlesError) {
      console.error('Articles table error:', articlesError);
    } else {
      console.log('Articles table structure:', articles.length > 0 ? Object.keys(articles[0]) : 'No articles found');
    }
    
    // Test article_categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError);
    } else {
      console.log('Categories table structure:', categories.length > 0 ? Object.keys(categories[0]) : 'No categories found');
    }
    
    // Test creating a simple article
    console.log('\nTesting article creation...');
    const testArticle = {
      title: 'Test Article',
      content: 'This is a test article content',
      excerpt: 'Test excerpt',
      status: 'draft',
      author_id: '00000000-0000-0000-0000-000000000000', // placeholder UUID
      category_id: null
    };
    
    const { data: newArticle, error: createError } = await supabase
      .from('articles')
      .insert([testArticle])
      .select()
      .single();
    
    if (createError) {
      console.error('Article creation error:', createError);
    } else {
      console.log('Article created successfully:', newArticle.id);
      
      // Clean up - delete the test article
      await supabase.from('articles').delete().eq('id', newArticle.id);
      console.log('Test article cleaned up');
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
})();