// API endpoint لتحميل القنوات من ملف zomiga_channels.json
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // مسار ملف القنوات
    const channelsFilePath = path.join(process.cwd(), 'zomiga_channels.json');
    
    // التحقق من وجود الملف
    if (!fs.existsSync(channelsFilePath)) {
      console.error('ملف القنوات غير موجود:', channelsFilePath);
      return res.status(404).json({ 
        error: 'ملف القنوات غير موجود',
        channels: [] 
      });
    }

    // قراءة الملف
    const fileContent = fs.readFileSync(channelsFilePath, 'utf8');
    const channels = JSON.parse(fileContent);

    // التحقق من صحة البيانات
    if (!Array.isArray(channels)) {
      console.error('بيانات القنوات غير صحيحة - ليست مصفوفة');
      return res.status(400).json({ 
        error: 'بيانات القنوات غير صحيحة',
        channels: [] 
      });
    }

    // تصفية القنوات النشطة فقط
    const activeChannels = channels.filter(channel => 
      channel && 
      channel.status === 'active' && 
      channel.name && 
      channel.url
    );

    console.log(`✅ تم تحميل ${activeChannels.length} قناة نشطة من أصل ${channels.length}`);

    // إرجاع البيانات
    res.status(200).json({
      success: true,
      channels: activeChannels,
      total: activeChannels.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في تحميل القنوات من الملف:', error);
    res.status(500).json({ 
      error: 'خطأ في تحميل القنوات من الملف',
      message: error.message,
      channels: [] 
    });
  }
}