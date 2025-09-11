import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdvancedChart from '../../components/admin/AdvancedChart'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet,
  ArrowLeft,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Target,
  Activity,
  Zap,
  DollarSign,
  Percent,
  Share2,
  Heart,
  MessageCircle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Maximize2,
  Settings,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdvancedAnalytics = () => {
  // removed unused: const { user, loading, isAdmin } = useAuth()
  // removed unused: const router = useRouter()
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  const [activeMetric, setActiveMetric] = useState('overview')
  
  // Sample data - في التطبيق الحقيقي، ستأتي من API
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 15420,
      activeUsers: 8934,
      pageViews: 125430,
      sessions: 45230,
      bounceRate: 32.5,
      avgSessionDuration: 485,
      conversionRate: 3.2,
      revenue: 15420
    },
    traffic: {
      sources: [
        { name: 'البحث المباشر', value: 40, color: 'blue' },
        { name: 'وسائل التواصل', value: 25, color: 'green' },
        { name: 'الإحالات', value: 20, color: 'purple' },
        { name: 'الزيارات المباشرة', value: 15, color: 'yellow' }
      ],
      trends: [
        { label: 'الإثنين', value: 1200 },
        { label: 'الثلاثاء', value: 1450 },
        { label: 'الأربعاء', value: 1380 },
        { label: 'الخميس', value: 1620 },
        { label: 'الجمعة', value: 1890 },
        { label: 'السبت', value: 2100 },
        { label: 'الأحد', value: 1750 }
      ]
    },
    content: {
      topArticles: [
        { title: 'دليل تطوير الويب الحديث', views: 5420, likes: 234, shares: 89 },
        { title: 'أساسيات الذكاء الاصطناعي', views: 4890, likes: 198, shares: 76 },
        { title: 'تصميم واجهات المستخدم', views: 4320, likes: 167, shares: 54 },
        { title: 'أمان التطبيقات الويب', views: 3980, likes: 145, shares: 43 },
        { title: 'قواعد البيانات المتقدمة', views: 3650, likes: 132, shares: 38 }
      ],
      engagement: [
        { label: 'يناير', value: 2400 },
        { label: 'فبراير', value: 2800 },
        { label: 'مارس', value: 3200 },
        { label: 'أبريل', value: 2900 },
        { label: 'مايو', value: 3400 },
        { label: 'يونيو', value: 3800 }
      ]
    },
    channels: {
      viewership: [
        { label: 'الساعة 6', value: 1200 },
        { label: 'الساعة 9', value: 2400 },
        { label: 'الساعة 12', value: 3200 },
        { label: 'الساعة 15', value: 2800 },
        { label: 'الساعة 18', value: 4200 },
        { label: 'الساعة 21', value: 5600 },
        { label: 'الساعة 24', value: 3400 }
      ],
      topChannels: [
        { name: 'القناة الإخبارية', viewers: 12450, rating: 4.8 },
        { name: 'القناة الرياضية', viewers: 9870, rating: 4.6 },
        { name: 'قناة الأطفال', viewers: 8320, rating: 4.9 },
        { name: 'القناة الثقافية', viewers: 6540, rating: 4.4 },
        { name: 'القناة الترفيهية', viewers: 5890, rating: 4.2 }
      ]
    },
    devices: {
      distribution: [
        { name: 'الهاتف المحمول', value: 65, icon: Smartphone },
        { name: 'سطح المكتب', value: 28, icon: Monitor },
        { name: 'الجهاز اللوحي', value: 7, icon: Tablet }
      ],
      performance: [
        { label: 'الهاتف', loadTime: 2.3, bounceRate: 28 },
        { label: 'سطح المكتب', loadTime: 1.8, bounceRate: 22 },
        { label: 'الجهاز اللوحي', loadTime: 2.1, bounceRate: 25 }
      ]
    },
    realTime: {
      activeUsers: 1247,
      currentSessions: 892,
      pageViewsPerMinute: 45,
      topPages: [
        { page: '/articles/web-development', users: 156 },
        { page: '/channels/news', users: 134 },
        { page: '/games/puzzle', users: 98 },
        { page: '/admin/dashboard', users: 67 },
        { page: '/favorites', users: 54 }
      ]
    }
  })

  useEffect(() => {
    // الاعتماد على AdminLayout للتحقق من الصلاحيات وإعادة التوجيه عند الحاجة
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      // هنا يمكن إضافة استدعاءات API حقيقية
      // const data = await fetchAnalytics(timeRange)
      // setAnalyticsData(data)
      
      // محاكاة تحديث البيانات
      console.log('تحميل بيانات التحليلات للفترة:', timeRange)
    } catch (error) {
      console.error('خطأ في تحميل بيانات التحليلات:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setTimeout(() => setRefreshing(false), 1000)
    toast.success('تم تحديث البيانات بنجاح')
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendDirection, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trendDirection === 'up' ? 'text-green-600' : 
            trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trendDirection === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
             trendDirection === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
            {trend}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-primary-600 text-white shadow-lg' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  )

  // تمت إزالة بوابة التحميل القديمة: AdminLayout يتكفل بالحماية وإدارة الحالة العامة

  return (
    <AdminLayout title="التحليلات المتقدمة" description="تحليل شامل لأداء النظام والمستخدمين">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin/advanced-dashboard" legacyBehavior>
              <a className="text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="w-6 h-6" />
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Time Range Selector */}
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="1h">آخر ساعة</option>
              <option value="24h">آخر 24 ساعة</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 3 أشهر</option>
            </select>
            
            {/* Export Button */}
            <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
        </div>
          {/* Real-time Stats Bar */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.realTime.activeUsers}</div>
                <div className="text-primary-100">مستخدم نشط الآن</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.realTime.currentSessions}</div>
                <div className="text-primary-100">جلسة حالية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.realTime.pageViewsPerMinute}</div>
                <div className="text-primary-100">مشاهدة/دقيقة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
                <div className="text-primary-100">معدل التحويل</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <TabButton 
              id="overview" 
              label="نظرة عامة" 
              icon={BarChart3} 
              active={activeMetric === 'overview'} 
              onClick={setActiveMetric} 
            />
            <TabButton 
              id="traffic" 
              label="حركة المرور" 
              icon={Globe} 
              active={activeMetric === 'traffic'} 
              onClick={setActiveMetric} 
            />
            <TabButton 
              id="content" 
              label="المحتوى" 
              icon={Eye} 
              active={activeMetric === 'content'} 
              onClick={setActiveMetric} 
            />
            <TabButton 
              id="channels" 
              label="القنوات" 
              icon={Play} 
              active={activeMetric === 'channels'} 
              onClick={setActiveMetric} 
            />
            <TabButton 
              id="devices" 
              label="الأجهزة" 
              icon={Smartphone} 
              active={activeMetric === 'devices'} 
              onClick={setActiveMetric} 
            />
          </div>

          {/* Overview Tab */}
          {activeMetric === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="إجمالي المستخدمين"
                  value={analyticsData.overview.totalUsers}
                  subtitle="مستخدم مسجل"
                  icon={Users}
                  trend={12.5}
                  trendDirection="up"
                  color="blue"
                />
                <MetricCard
                  title="مشاهدات الصفحة"
                  value={analyticsData.overview.pageViews}
                  subtitle="هذا الشهر"
                  icon={Eye}
                  trend={8.3}
                  trendDirection="up"
                  color="green"
                />
                <MetricCard
                  title="معدل الارتداد"
                  value={`${analyticsData.overview.bounceRate}%`}
                  subtitle="متوسط الجلسة"
                  icon={MousePointer}
                  trend={2.1}
                  trendDirection="down"
                  color="yellow"
                />
                <MetricCard
                  title="الإيرادات"
                  value={`$${analyticsData.overview.revenue.toLocaleString()}`}
                  subtitle="هذا الشهر"
                  icon={DollarSign}
                  trend={15.7}
                  trendDirection="up"
                  color="purple"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdvancedChart
                  title="حركة المرور اليومية"
                  data={analyticsData.traffic.trends}
                  type="line"
                  color="blue"
                  height={300}
                />
                <AdvancedChart
                  title="المشاركة الشهرية"
                  data={analyticsData.content.engagement}
                  type="bar"
                  color="green"
                  height={300}
                />
              </div>
            </div>
          )}

          {/* Traffic Tab */}
          {activeMetric === 'traffic' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Sources */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">مصادر الزيارات</h3>
                  <div className="space-y-4">
                    {analyticsData.traffic.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-${source.color}-500 mr-3`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {source.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {source.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Trends */}
                <div className="lg:col-span-2">
                  <AdvancedChart
                    title="اتجاهات حركة المرور الأسبوعية"
                    data={analyticsData.traffic.trends}
                    type="line"
                    color="blue"
                    height={350}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeMetric === 'content' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Articles */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">أفضل المقالات</h3>
                  <div className="space-y-4">
                    {analyticsData.content.topArticles.map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {article.views.toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {article.likes}
                            </div>
                            <div className="flex items-center">
                              <Share2 className="w-3 h-3 mr-1" />
                              {article.shares}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Engagement */}
                <AdvancedChart
                  title="مشاركة المحتوى الشهرية"
                  data={analyticsData.content.engagement}
                  type="bar"
                  color="green"
                  height={400}
                />
              </div>
            </div>
          )}

          {/* Channels Tab */}
          {activeMetric === 'channels' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Channels */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">أفضل القنوات</h3>
                  <div className="space-y-4">
                    {analyticsData.channels.topChannels.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {channel.name}
                          </h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {channel.viewers.toLocaleString()} مشاهد
                            </div>
                            <div className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {channel.rating} تقييم
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Viewership Trends */}
                <AdvancedChart
                  title="اتجاهات المشاهدة اليومية"
                  data={analyticsData.channels.viewership}
                  type="line"
                  color="purple"
                  height={400}
                />
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeMetric === 'devices' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Device Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">توزيع الأجهزة</h3>
                  <div className="space-y-6">
                    {analyticsData.devices.distribution.map((device, index) => {
                      const Icon = device.icon
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 text-primary-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {device.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${device.value}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white w-12">
                              {device.value}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Device Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">أداء الأجهزة</h3>
                  <div className="space-y-4">
                    {analyticsData.devices.performance.map((device, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">زمن التحميل</span>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {device.loadTime}s
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">معدل الارتداد</span>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {device.bounceRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </AdminLayout>
  )
}

export default AdvancedAnalytics