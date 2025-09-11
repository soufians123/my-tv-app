import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Clock, Target, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { gamesService } from '../../lib/gamesService'

const GamePage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState('menu') // menu, playing, paused, finished
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameData, setGameData] = useState(null)
  const timerRef = useRef(null)

  // بيانات تجريبية للألعاب
  const sampleGames = {
    '1': {
      id: 1,
      title: 'لعبة الذاكرة',
      description: 'اختبر قوة ذاكرتك مع هذه اللعبة المثيرة',
      category: 'memory',
      difficulty: 'easy',
      maxScore: 1000,
      playTime: '5-10 دقائق',
      players: 1250,
      image: '/api/placeholder/300/200',
      instructions: [
        'انقر على البطاقات لكشفها',
        'ابحث عن الأزواج المتطابقة',
        'اكمل جميع الأزواج قبل انتهاء الوقت',
        'كلما أنهيت بسرعة، كلما حصلت على نقاط أكثر'
      ],
      gameType: 'memory'
    },
    '2': {
      id: 2,
      title: 'لعبة الرياضيات السريعة',
      description: 'حل المسائل الرياضية بأسرع وقت ممكن',
      category: 'math',
      difficulty: 'medium',
      maxScore: 2000,
      playTime: '3-5 دقائق',
      players: 890,
      image: '/api/placeholder/300/200',
      instructions: [
        'حل المسائل الرياضية المعروضة',
        'اختر الإجابة الصحيحة من الخيارات',
        'كلما حللت بسرعة، كلما حصلت على نقاط أكثر',
        'احذر من الإجابات الخاطئة'
      ],
      gameType: 'math'
    },
    '3': {
      id: 3,
      title: 'لعبة الكلمات المتقاطعة',
      description: 'اكتشف الكلمات المخفية في الشبكة',
      category: 'word',
      difficulty: 'hard',
      maxScore: 1500,
      playTime: '10-15 دقيقة',
      players: 670,
      image: '/api/placeholder/300/200',
      instructions: [
        'ابحث عن الكلمات في الشبكة',
        'يمكن أن تكون الكلمات أفقية أو عمودية أو قطرية',
        'انقر واسحب لتحديد الكلمة',
        'اعثر على جميع الكلمات لإكمال المستوى'
      ],
      gameType: 'word'
    }
  }

  useEffect(() => {
    if (id) {
      loadGame()
    }
  }, [id])

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [gameState, timeLeft])

  const loadGame = async () => {
    setLoading(true)
    try {
      const gameData = await gamesService.loadGame(id)
      if (gameData) {
        setGame(gameData)
        initializeGame(gameData)
      } else {
        toast.error('اللعبة غير موجودة')
        router.push('/games')
      }
    } catch (error) {
      console.error('خطأ في تحميل اللعبة:', error)
      toast.error('حدث خطأ أثناء تحميل اللعبة')
    } finally {
      setLoading(false)
    }
  }

  const initializeGame = (gameInfo) => {
    switch (gameInfo.gameType) {
      case 'memory':
        initializeMemoryGame()
        break
      case 'math':
        initializeMathGame()
        break
      case 'word':
        initializeWordGame()
        break
      default:
        break
    }
  }

  const initializeMemoryGame = () => {
    const cards = []
    const symbols = ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯']
    
    for (let i = 0; i < 8; i++) {
      cards.push(
        { id: i * 2, symbol: symbols[i], flipped: false, matched: false },
        { id: i * 2 + 1, symbol: symbols[i], flipped: false, matched: false }
      )
    }
    
    // خلط البطاقات
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    
    setGameData({
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: 8
    })
  }

  const initializeMathGame = () => {
    setGameData({
      currentQuestion: generateMathQuestion(),
      questionsAnswered: 0,
      correctAnswers: 0
    })
  }

  const initializeWordGame = () => {
    const words = ['برمجة', 'تطوير', 'تصميم', 'إبداع', 'تقنية']
    const grid = generateWordGrid(words)
    
    setGameData({
      grid,
      words,
      foundWords: [],
      selectedCells: []
    })
  }

  const generateMathQuestion = () => {
    const operations = ['+', '-', '*']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    let num1, num2, answer, options
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 + num2
        break
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25
        num2 = Math.floor(Math.random() * 25) + 1
        answer = num1 - num2
        break
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        break
    }
    
    options = [answer]
    while (options.length < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer)
      }
    }
    
    // خلط الخيارات
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
    
    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer,
      options
    }
  }

  const generateWordGrid = (words) => {
    // تبسيط: إنشاء شبكة 10x10 مع كلمات عشوائية
    const grid = Array(10).fill().map(() => Array(10).fill(''))
    
    // ملء الشبكة بأحرف عشوائية
    const letters = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)]
      }
    }
    
    return grid
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(game.gameType === 'math' ? 180 : 300) // 3 دقائق للرياضيات، 5 للباقي
  }

  const pauseGame = () => {
    setGameState('paused')
  }

  const resumeGame = () => {
    setGameState('playing')
  }

  const restartGame = () => {
    setGameState('menu')
    setScore(0)
    setTimeLeft(game.gameType === 'math' ? 180 : 300)
    initializeGame(game)
  }

  const endGame = async () => {
    setGameState('finished')
    
    // حفظ النتيجة (في التطبيق الحقيقي، سيتم حفظها في Supabase)
    try {
      const finalScore = calculateFinalScore()
      setScore(finalScore)
      
      // محاكاة حفظ النتيجة
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(`تم حفظ نتيجتك: ${finalScore} نقطة!`)
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ النتيجة')
    }
  }

  const calculateFinalScore = () => {
    let baseScore = score
    const timeBonus = Math.floor(timeLeft * 2) // مكافأة الوقت
    return baseScore + timeBonus
  }

  const handleMemoryCardClick = (cardId) => {
    if (gameState !== 'playing') return
    
    const newCards = [...gameData.cards]
    const card = newCards.find(c => c.id === cardId)
    
    if (card.flipped || card.matched) return
    
    card.flipped = true
    const flippedCards = [...gameData.flippedCards, card]
    
    if (flippedCards.length === 2) {
      if (flippedCards[0].symbol === flippedCards[1].symbol) {
        // تطابق!
        flippedCards[0].matched = true
        flippedCards[1].matched = true
        const newMatchedPairs = gameData.matchedPairs + 1
        setScore(score + 100)
        
        setGameData({
          ...gameData,
          cards: newCards,
          flippedCards: [],
          matchedPairs: newMatchedPairs
        })
        
        if (newMatchedPairs === gameData.totalPairs) {
          setTimeout(endGame, 1000)
        }
      } else {
        // لا يوجد تطابق
        setTimeout(() => {
          flippedCards[0].flipped = false
          flippedCards[1].flipped = false
          setGameData({
            ...gameData,
            cards: newCards,
            flippedCards: []
          })
        }, 1000)
      }
    } else {
      setGameData({
        ...gameData,
        cards: newCards,
        flippedCards
      })
    }
  }

  const handleMathAnswer = (selectedAnswer) => {
    if (gameState !== 'playing') return
    
    const isCorrect = selectedAnswer === gameData.currentQuestion.answer
    const newQuestionsAnswered = gameData.questionsAnswered + 1
    const newCorrectAnswers = gameData.correctAnswers + (isCorrect ? 1 : 0)
    
    if (isCorrect) {
      setScore(score + 50)
      toast.success('إجابة صحيحة! +50 نقطة')
    } else {
      toast.error('إجابة خاطئة!')
    }
    
    setGameData({
      currentQuestion: generateMathQuestion(),
      questionsAnswered: newQuestionsAnswered,
      correctAnswers: newCorrectAnswers
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600">يجب تسجيل الدخول للعب الألعاب</p>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!game) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">اللعبة غير موجودة</h2>
          <button
            onClick={() => router.push('/games')}
            className="btn-primary"
          >
            العودة للألعاب
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            العودة
          </button>
          
          {gameState === 'playing' && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-white rounded-lg px-4 py-2 shadow">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse bg-white rounded-lg px-4 py-2 shadow">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-bold">{score.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-64 object-cover"
              />
              
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{game.title}</h1>
                <p className="text-gray-600 mb-6">{game.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="font-bold text-gray-900">{game.maxScore}</div>
                    <div className="text-sm text-gray-600">أقصى نقاط</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="font-bold text-gray-900">{game.playTime}</div>
                    <div className="text-sm text-gray-600">وقت اللعب</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">تعليمات اللعب:</h3>
                  <ul className="space-y-2">
                    {game.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2 space-x-reverse">
                        <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={startGame}
                  className="w-full btn-primary text-lg py-3 flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  ابدأ اللعب
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Playing */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="max-w-4xl mx-auto">
            {gameState === 'paused' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">اللعبة متوقفة</h2>
                  <div className="space-y-4">
                    <button onClick={resumeGame} className="btn-primary">
                      متابعة اللعب
                    </button>
                    <button onClick={restartGame} className="btn-secondary">
                      إعادة البدء
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{game.title}</h2>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={pauseGame}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                  </button>
                  <button
                    onClick={restartGame}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Memory Game */}
              {game.gameType === 'memory' && gameData && (
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                  {gameData.cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleMemoryCardClick(card.id)}
                      className={`aspect-square rounded-lg text-2xl font-bold transition-all ${
                        card.flipped || card.matched
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } ${card.matched ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {card.flipped || card.matched ? card.symbol : '?'}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Math Game */}
              {game.gameType === 'math' && gameData && (
                <div className="text-center max-w-md mx-auto">
                  <div className="text-3xl font-bold text-gray-900 mb-8">
                    {gameData.currentQuestion.question}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {gameData.currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleMathAnswer(option)}
                        className="p-4 text-xl font-bold bg-gray-100 hover:bg-primary-100 hover:text-primary-800 rounded-lg transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-600">
                    الأسئلة المجابة: {gameData.questionsAnswered} | الإجابات الصحيحة: {gameData.correctAnswers}
                  </div>
                </div>
              )}
              
              {/* Word Game */}
              {game.gameType === 'word' && gameData && (
                <div className="text-center">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-2">ابحث عن هذه الكلمات:</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {gameData.words.map((word, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            gameData.foundWords.includes(word)
                              ? 'bg-green-100 text-green-800 line-through'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
                    {gameData.grid.map((row, i) =>
                      row.map((letter, j) => (
                        <div
                          key={`${i}-${j}`}
                          className="aspect-square bg-gray-100 rounded flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-gray-200"
                        >
                          {letter}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Finished */}
        {gameState === 'finished' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">انتهت اللعبة!</h2>
                <p className="text-gray-600">أحسنت! لقد أكملت اللعبة بنجاح</p>
              </div>
              
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6 mb-6">
                <div className="text-3xl font-bold mb-2">{score.toLocaleString()}</div>
                <div className="text-primary-100">نقطة إجمالية</div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={restartGame}
                  className="w-full btn-primary"
                >
                  العب مرة أخرى
                </button>
                
                <button
                  onClick={() => router.push('/games')}
                  className="w-full btn-secondary"
                >
                  العودة للألعاب
                </button>
                
                <button
                  onClick={() => router.push('/games/leaderboard')}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  لوحة المتصدرين
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  // Generate paths for sample games
  const paths = ['1', '2', '3', '4', '5'].map((id) => ({
    params: { id }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      gameId: params.id
    },
    revalidate: 60
  }
}

export default GamePage