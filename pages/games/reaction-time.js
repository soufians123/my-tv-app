import { useEffect, useRef, useState } from 'react'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { gamesService } from '../../lib/gamesService'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ToastSystem'
import { Timer, Target, RefreshCw, ArrowLeft, Trophy, ShieldCheck } from 'lucide-react'

const ReactionTimeGame = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [phase, setPhase] = useState('idle') // idle | waiting | go | false_start | result
  const [times, setTimes] = useState([]) // ms
  const [best, setBest] = useState(null)
  const [average, setAverage] = useState(null)
  const [round, setRound] = useState(0)
  const [targetRounds, setTargetRounds] = useState(5)
  const [leaderboard, setLeaderboard] = useState([])
  const [saving, setSaving] = useState(false)

  const waitTimer = useRef(null)
  const startTime = useRef(0)

  useEffect(() => {
    // تحميل لوحة المتصدرين الخاصة باللعبة
    const load = async () => {
      try {
        const lb = await gamesService.loadLeaderboard('reaction-time')
        setLeaderboard(lb || [])
      } catch (e) {
        console.warn('تعذر تحميل لوحة المتصدرين')
      }
    }
    load()

    return () => {
      if (waitTimer.current) clearTimeout(waitTimer.current)
    }
  }, [])

  useEffect(() => {
    if (times.length > 0) {
      const b = Math.min(...times)
      setBest(b)
      const avg = Math.round(times.reduce((a, v) => a + v, 0) / times.length)
      setAverage(avg)
    } else {
      setBest(null)
      setAverage(null)
    }
  }, [times])

  const startRound = () => {
    if (waitTimer.current) clearTimeout(waitTimer.current)
    setPhase('waiting')
    setRound((r) => r + 1)
    // انتظار عشوائي من 1 إلى 3 ثوانٍ قبل الإشارة
    const wait = 1000 + Math.random() * 2000
    waitTimer.current = setTimeout(() => {
      setPhase('go')
      startTime.current = performance.now()
    }, wait)
  }

  const handleClick = () => {
    if (phase === 'idle') return

    if (phase === 'waiting') {
      // انطلاقة خاطئة
      if (waitTimer.current) clearTimeout(waitTimer.current)
      setPhase('false_start')
      showToast('بداية خاطئة! انتظر حتى تظهر الإشارة الخضراء.', 'error')
      return
    }

    if (phase === 'go') {
      const rt = Math.round(performance.now() - startTime.current)
      setTimes((t) => [...t, rt])
      setPhase('result')
      return
    }

    if (phase === 'result' || phase === 'false_start') {
      if (round < targetRounds) {
        startRound()
      }
    }
  }

  const resetGame = () => {
    if (waitTimer.current) clearTimeout(waitTimer.current)
    setPhase('idle')
    setTimes([])
    setBest(null)
    setAverage(null)
    setRound(0)
  }

  const scoreFromReaction = (ms) => {
    // تحويل زمن الاستجابة لدرجة (الأقل زمنًا = درجة أعلى), max 1000
    const score = Math.max(0, 1000 - ms)
    return Math.round(score)
  }

  const saveBestScore = async () => {
    if (best == null) {
      showToast('لا توجد نتيجة محفوظة بعد.', 'error')
      return
    }
    setSaving(true)
    try {
      const score = scoreFromReaction(best)
      const res = await gamesService.saveUserScore(user?.id || 'guest', 'reaction-time', score)
      if (res?.success) {
        showToast('تم حفظ نتيجتك بنجاح!', 'success')
        // تحديث لوحة المتصدرين
        const lb = await gamesService.loadLeaderboard('reaction-time')
        setLeaderboard(lb || [])
      } else {
        showToast('تعذر حفظ النتيجة حالياً', 'error')
      }
    } catch (e) {
      console.error(e)
      showToast('حدث خطأ أثناء حفظ النتيجة', 'error')
    } finally {
      setSaving(false)
    }
  }

  // دعم لوحة المفاتيح (المسافة/الإدخال)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleClick()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, round])

  return (
    <Layout title="اختبار رد الفعل" description="اضغط عند ظهور اللون الأخضر بأسرع وقت">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/games" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            رجوع إلى قائمة الألعاب
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* منطقة اللعب */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                اختبار رد الفعل
                <Badge className="ml-auto" variant="secondary">الجولة {Math.min(round, targetRounds)} / {targetRounds}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* لوحة الإرشادات */}
                <div className="text-sm text-gray-600 leading-relaxed">
                  - اضغط على المنطقة الكبيرة عند تحول اللون إلى الأخضر.
                  <br />- تجنب الضغط قبل الإشارة (False Start).
                  <br />- ستحصل على 5 محاولات، ويتم حفظ أفضل نتيجة.
                </div>

                {/* منطقة النقر التفاعلية */}
                <div
                  role="button"
                  aria-label="منطقة اللعب"
                  onClick={handleClick}
                  className={`select-none rounded-2xl h-72 sm:h-80 md:h-96 flex items-center justify-center text-center font-semibold text-2xl transition-all duration-200 cursor-pointer border shadow-inner
                    ${phase === 'idle' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : ''}
                    ${phase === 'waiting' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : ''}
                    ${phase === 'go' ? 'bg-green-500 text-white' : ''}
                    ${phase === 'false_start' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    ${phase === 'result' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  `}
                >
                  {phase === 'idle' && (
                    <div className="px-4">
                      اضغط زر البدء لبدء الجولة
                    </div>
                  )}
                  {phase === 'waiting' && (
                    <div className="px-4">
                      انتظر الإشارة الخضراء...
                    </div>
                  )}
                  {phase === 'go' && (
                    <div className="px-4">
                      الآن! اضغط الآن!
                    </div>
                  )}
                  {phase === 'false_start' && (
                    <div className="px-4">
                      بداية خاطئة! انتظر الإشارة الخضراء.
                    </div>
                  )}
                  {phase === 'result' && (
                    <div className="px-4">
                      آخر زمن استجابة: {times[times.length - 1]} مللي ثانية
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => (phase === 'idle' ? startRound() : resetGame())}>
                    {phase === 'idle' ? (
                      <span className="inline-flex items-center gap-2"><Timer className="w-4 h-4" /> بدء</span>
                    ) : (
                      <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> إعادة ضبط</span>
                    )}
                  </Button>
                  {(phase === 'result' || phase === 'false_start' || phase === 'waiting' || phase === 'go') && round < targetRounds && (
                    <Button variant="secondary" onClick={startRound}>
                      محاولة أخرى
                    </Button>
                  )}
                  {best != null && (
                    <Button disabled={saving} onClick={saveBestScore} className="bg-green-600 hover:bg-green-700">
                      {saving ? 'جارٍ الحفظ...' : 'حفظ أفضل نتيجة'}
                    </Button>
                  )}
                </div>

                {/* ملخص النتائج */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border shadow-sm">
                    <div className="text-sm text-gray-500">أفضل زمن</div>
                    <div className="text-2xl font-bold mt-1">{best != null ? `${best} ms` : '—'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border shadow-sm">
                    <div className="text-sm text-gray-500">متوسط الزمن</div>
                    <div className="text-2xl font-bold mt-1">{average != null ? `${average} ms` : '—'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border shadow-sm">
                    <div className="text-sm text-gray-500">الجولات المكتملة</div>
                    <div className="text-2xl font-bold mt-1">{Math.min(times.length, targetRounds)} / {targetRounds}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> اتصال آمن</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 leading-relaxed">
                يتم حفظ النتائج عبر اتصال آمن وموثوق. في حال عدم توفر الخادم، سيتم الحفظ محليًا تلقائيًا وسيتم المزامنة لاحقًا عند توفر الاتصال.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> لوحة المتصدرين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard && leaderboard.length > 0 ? (
                    leaderboard.slice(0, 10).map((u, idx) => (
                      <div key={`${u.user_id}-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 text-center text-xs font-semibold rounded-full bg-white border">{u.rank || idx + 1}</span>
                          <span className="text-sm font-medium">{u.username || 'مستخدم'}</span>
                        </div>
                        <div className="text-sm text-gray-700">{u.total_score} نقطة</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">لا توجد بيانات متاحة بعد.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" /> كيفية اللعب</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>- اضغط على زر "بدء" ثم انتظر حتى تتحول المنطقة إلى اللون الأخضر.</p>
                <p>- اضغط فورًا عند ظهور اللون الأخضر، سيتم قياس زمن استجابتك بالمللي ثانية.</p>
                <p>- كرر ذلك 5 مرات وسيتم احتساب أفضل زمن لك كدرجة.</p>
                <p>- يمكن استخدام لوحة المفاتيح (المسافة/الإدخال) بدل النقر.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReactionTimeGame