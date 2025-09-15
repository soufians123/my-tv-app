// سكريبت لتحميل القنوات من ملف zomiga_channels.json إلى localStorage
const fs = require('fs');
const path = require('path');

// قراءة ملف القنوات
const channelsFilePath = path.join(__dirname, 'zomiga_channels.json');

try {
  // قراءة البيانات من الملف
  const channelsData = fs.readFileSync(channelsFilePath, 'utf8');
  const channels = JSON.parse(channelsData);
  
  console.log(`تم تحميل ${channels.length} قناة من الملف`);
  
  // إنشاء ملف HTML لتحميل البيانات إلى localStorage
  const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحميل بيانات القنوات</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 50px;
            margin: 0;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 600px;
            margin: 0 auto;
        }
        .success {
            color: #4CAF50;
            font-size: 18px;
            margin: 20px 0;
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 تحميل بيانات القنوات</h1>
        <div id="status">جاري تحميل البيانات...</div>
        <div class="info">
            <p><strong>عدد القنوات:</strong> ${channels.length}</p>
            <p><strong>آخر تحديث:</strong> ${new Date().toLocaleString('ar-SA')}</p>
        </div>
        <button onclick="goToChannels()">انتقل إلى صفحة القنوات</button>
        <button onclick="location.reload()">إعادة تحميل</button>
    </div>

    <script>
        // بيانات القنوات
        const channelsData = ${JSON.stringify(channels, null, 2)};
        
        // تحميل البيانات إلى localStorage
        try {
            localStorage.setItem('zomiga_channels', JSON.stringify(channelsData));
            localStorage.setItem('zomiga_channels_version', Date.now().toString());
            
            document.getElementById('status').innerHTML = 
                '<div class="success">✅ تم تحميل البيانات بنجاح!</div>';
            
            console.log('تم تحميل', channelsData.length, 'قناة إلى localStorage');
            
            // إحصائيات الفئات
            const categories = {};
            channelsData.forEach(channel => {
                categories[channel.category] = (categories[channel.category] || 0) + 1;
            });
            
            console.log('توزيع الفئات:', categories);
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            document.getElementById('status').innerHTML = 
                '<div style="color: #f44336;">❌ خطأ في تحميل البيانات</div>';
        }
        
        function goToChannels() {
            window.location.href = '/channels';
        }
    </script>
</body>
</html>
  `;
  
  // حفظ ملف HTML
  const htmlFilePath = path.join(__dirname, 'public', 'load-channels.html');
  
  // إنشاء مجلد public إذا لم يكن موجوداً
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(htmlFilePath, htmlContent);
  
  console.log('✅ تم إنشاء ملف التحميل: public/load-channels.html');
  console.log('🌐 افتح الرابط: http://localhost:3000/load-channels.html');
  
  // عرض إحصائيات سريعة
  const categories = {};
  channels.forEach(channel => {
    categories[channel.category] = (categories[channel.category] || 0) + 1;
  });
  
  console.log('\n📊 إحصائيات الفئات:');
  Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count} قناة`);
    });
    
} catch (error) {
  console.error('❌ خطأ في قراءة ملف القنوات:', error.message);
  process.exit(1);
}