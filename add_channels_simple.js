// إضافة القنوات باستخدام fetch API
const channelsToAdd = [
  {
    name: "2M TV",
    url: "https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/2m_monde/hls_video_ts_tuhawxpiemz257adfc/2m_monde.m3u8",
    category_name: "قنوات مغربية",
    language: "العربية",
    quality: "HD",
    country: "المغرب",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2M_TV_logo.svg/512px-2M_TV_logo.svg.png",
    description: "القناة الثانية المغربية"
  },
  {
    name: "2M Monde",
    url: "https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/2m_monde/hls_video_ts/2m_monde.m3u8",
    category_name: "قنوات مغربية",
    language: "العربية",
    quality: "HD",
    country: "المغرب",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2M_TV_logo.svg/512px-2M_TV_logo.svg.png",
    description: "القناة الثانية المغربية العالمية"
  },
  {
    name: "Al Aoula",
    url: "https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/al_aoula_inter/hls_video_ts/al_aoula_inter.m3u8",
    category_name: "قنوات مغربية",
    language: "العربية",
    quality: "HD",
    country: "المغرب",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Al_Aoula.svg/512px-Al_Aoula.svg.png",
    description: "القناة الأولى المغربية"
  },
  {
    name: "Al Jazeera",
    url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8",
    category_name: "أخبار",
    language: "العربية",
    quality: "HD",
    country: "قطر",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Aljazeera.svg/512px-Aljazeera.svg.png",
    description: "قناة الجزيرة الإخبارية"
  },
  {
    name: "BBC Arabic",
    url: "https://vs-cmaf-pushb-ww-live.akamaized.net/x=3/i=urn:bbc:pips:service:bbc_arabic_tv/iptv_hd_abr_v1.mpd",
    category_name: "أخبار",
    language: "العربية",
    quality: "HD",
    country: "بريطانيا",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/BBC_Arabic_logo.svg/512px-BBC_Arabic_logo.svg.png",
    description: "بي بي سي العربية"
  }
];

async function addChannels() {
  console.log('بدء إضافة القنوات...');
  
  for (const channel of channelsToAdd) {
    try {
      const response = await fetch('http://localhost:3001/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channel)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ تم إضافة القناة: ${channel.name}`);
      } else {
        const error = await response.text();
        console.log(`❌ فشل في إضافة القناة ${channel.name}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ خطأ في إضافة القناة ${channel.name}:`, error.message);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('انتهى من إضافة القنوات');
}

addChannels().catch(console.error);