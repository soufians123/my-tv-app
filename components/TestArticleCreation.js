import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const TestArticleCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleCreateTestArticle = async () => {
    setIsCreating(true);
    setTestResult(null);
    
    try {
      console.log('🧪 بدء اختبار إنشاء المقال...');
      
      // إنشاء slug فريد
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const slug = `test-article-${timestamp}-${randomString}`;
      
      const testArticle = {
        title: `مقال تجريبي ${new Date().toLocaleString('ar')}`,
        slug: slug,
        content: 'هذا محتوى المقال التجريبي. يحتوي على نص عربي لاختبار النظام.',
        excerpt: 'مقتطف تجريبي للمقال',
        status: 'draft',
        category_id: null,
        tags: ['تجريبي', 'اختبار'],
        is_featured: false,
        author_id: 'f0205754-6eb8-421f-b3c5-29f793231add', // ID المدير
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 بيانات المقال:', testArticle);
      
      // محاولة إدراج المقال مباشرة في قاعدة البيانات
      const { data, error } = await supabase
        .from('articles')
        .insert([testArticle])
        .select()
        .single();
      
      if (error) {
        console.error('❌ خطأ في إنشاء المقال:', error);
        setTestResult({
          success: false,
          error: error.message,
          details: error
        });
        toast.error(`فشل في إنشاء المقال: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء المقال بنجاح:', data);
        setTestResult({
          success: true,
          article: data
        });
        toast.success('تم إنشاء المقال التجريبي بنجاح!');
      }
    } catch (error) {
      console.error('💥 خطأ غير متوقع:', error);
      setTestResult({
        success: false,
        error: error.message,
        details: error
      });
      toast.error('حدث خطأ غير متوقع: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        🧪 اختبار إنشاء المقالات
      </h3>
      <p className="text-yellow-700 mb-4">
        هذا المكون مخصص لاختبار وظيفة إنشاء المقالات. اضغط على الزر أدناه لإنشاء مقال تجريبي.
      </p>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCreateTestArticle}
          disabled={isCreating}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {isCreating ? 'جاري الإنشاء...' : 'إنشاء مقال تجريبي'}
        </button>
        
        {testResult && (
          <button
            onClick={() => setTestResult(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            مسح النتائج
          </button>
        )}
      </div>
      
      {/* عرض نتائج الاختبار */}
      {testResult && (
        <div className={`mt-4 p-4 rounded-md ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? '✅ نجح الاختبار' : '❌ فشل الاختبار'}
          </h4>
          
          {testResult.success ? (
            <div className="text-green-700">
              <p><strong>عنوان المقال:</strong> {testResult.article.title}</p>
              <p><strong>الرقم التعريفي:</strong> {testResult.article.id}</p>
              <p><strong>الحالة:</strong> {testResult.article.status}</p>
              <p><strong>تاريخ الإنشاء:</strong> {new Date(testResult.article.created_at).toLocaleString('ar')}</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p><strong>رسالة الخطأ:</strong> {testResult.error}</p>
              {testResult.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">تفاصيل الخطأ</summary>
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestArticleCreation;