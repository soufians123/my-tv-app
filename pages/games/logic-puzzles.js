import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { 
  ChevronLeft, Brain, Clock, Trophy, Star, Lightbulb, 
  RotateCcw, Play, Pause, CheckCircle, XCircle, Target,
  Zap, Award, TrendingUp, Eye, EyeOff
} from 'lucide-react'

// Puzzle types
const PUZZLE_TYPES = {
  SUDOKU: 'sudoku',
  LOGIC_GRID: 'logic_grid',
  NUMBER_SEQUENCE: 'number_sequence',
  PATTERN_MATCHING: 'pattern_matching',
  MATHEMATICAL: 'mathematical',
  SPATIAL: 'spatial'
}

// Difficulty levels
const DIFFICULTY_LEVELS = {
  BEGINNER: { name: 'مبتدئ', multiplier: 1, timeLimit: 300 },
  INTERMEDIATE: { name: 'متوسط', multiplier: 1.5, timeLimit: 240 },
  ADVANCED: { name: 'متقدم', multiplier: 2, timeLimit: 180 },
  EXPERT: { name: 'خبير', multiplier: 3, timeLimit: 120 },
  MASTER: { name: 'أستاذ', multiplier: 5, timeLimit: 90 }
}

// Sample puzzles data
const SAMPLE_PUZZLES = {
  [PUZZLE_TYPES.SUDOKU]: [
    {
      id: 1,
      difficulty: 'BEGINNER',
      grid: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ],
      solution: [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ]
    }
  ],
  [PUZZLE_TYPES.NUMBER_SEQUENCE]: [
    {
      id: 1,
      difficulty: 'BEGINNER',
      sequence: [2, 4, 6, 8, '?'],
      answer: 10,
      explanation: 'الأرقام الزوجية المتتالية'
    },
    {
      id: 2,
      difficulty: 'INTERMEDIATE',
      sequence: [1, 1, 2, 3, 5, 8, '?'],
      answer: 13,
      explanation: 'متتالية فيبوناتشي'
    },
    {
      id: 3,
      difficulty: 'ADVANCED',
      sequence: [1, 4, 9, 16, 25, '?'],
      answer: 36,
      explanation: 'مربعات الأرقام الطبيعية'
    }
  ],
  [PUZZLE_TYPES.MATHEMATICAL]: [
    {
      id: 1,
      difficulty: 'BEGINNER',
      question: 'إذا كان 2 + 2 = 4، و 3 + 3 = 6، فما هو 4 + 4؟',
      options: [6, 7, 8, 9],
      answer: 8,
      explanation: 'الجمع البسيط'
    },
    {
      id: 2,
      difficulty: 'INTERMEDIATE',
      question: 'إذا كان عمر أحمد ضعف عمر سارة، وعمر سارة 12 سنة، فكم عمر أحمد؟',
      options: [20, 22, 24, 26],
      answer: 24,
      explanation: '12 × 2 = 24'
    },
    {
      id: 3,
      difficulty: 'ADVANCED',
      question: 'في متتالية حسابية، الحد الأول = 3 والفرق المشترك = 4. ما هو الحد العاشر؟',
      options: [35, 37, 39, 41],
      answer: 39,
      explanation: 'الحد العاشر = 3 + (10-1) × 4 = 39'
    }
  ],
  [PUZZLE_TYPES.PATTERN_MATCHING]: [
    {
      id: 1,
      difficulty: 'BEGINNER',
      pattern: ['🔴', '🔵', '🔴', '🔵', '?'],
      options: ['🔴', '🔵', '🟡', '🟢'],
      answer: '🔴',
      explanation: 'نمط متناوب: أحمر، أزرق'
    },
    {
      id: 2,
      difficulty: 'INTERMEDIATE',
      pattern: ['⭐', '⭐⭐', '⭐⭐⭐', '?'],
      options: ['⭐', '⭐⭐⭐⭐', '⭐⭐', '⭐⭐⭐⭐⭐'],
      answer: '⭐⭐⭐⭐',
      explanation: 'زيادة نجمة واحدة في كل مرة'
    }
  ]
}

const LogicPuzzles = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPuzzle, setCurrentPuzzle] = useState(null)
  const [puzzleType, setPuzzleType] = useState(PUZZLE_TYPES.NUMBER_SEQUENCE)
  const [difficulty, setDifficulty] = useState('BEGINNER')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  
  // UI state
  const [showHint, setShowHint] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [showSolution, setShowSolution] = useState(false)
  const [puzzleCompleted, setPuzzleCompleted] = useState(false)
  
  // Sudoku specific state
  const [sudokuGrid, setSudokuGrid] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [maxMistakes] = useState(3)
  
  // Statistics
  const [stats, setStats] = useState({
    totalPuzzles: 0,
    correctAnswers: 0,
    averageTime: 0,
    bestTime: Infinity,
    totalHints: 0
  })

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isPaused || timeLeft <= 0 || puzzleCompleted) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, isPaused, timeLeft, puzzleCompleted])

  const generatePuzzle = useCallback(() => {
    const puzzles = SAMPLE_PUZZLES[puzzleType] || []
    const difficultyPuzzles = puzzles.filter(p => p.difficulty === difficulty)
    
    if (difficultyPuzzles.length === 0) {
      // Generate random puzzle based on type
      return generateRandomPuzzle(puzzleType, difficulty)
    }
    
    const randomPuzzle = difficultyPuzzles[Math.floor(Math.random() * difficultyPuzzles.length)]
    return { ...randomPuzzle }
  }, [puzzleType, difficulty])

  const generateRandomPuzzle = (type, diff) => {
    switch (type) {
      case PUZZLE_TYPES.NUMBER_SEQUENCE:
        return generateNumberSequence(diff)
      case PUZZLE_TYPES.MATHEMATICAL:
        return generateMathPuzzle(diff)
      case PUZZLE_TYPES.PATTERN_MATCHING:
        return generatePatternPuzzle(diff)
      default:
        return SAMPLE_PUZZLES[type]?.[0] || null
    }
  }

  const generateNumberSequence = (diff) => {
    const sequences = {
      BEGINNER: [
        { sequence: [2, 4, 6, 8, '?'], answer: 10, explanation: 'الأرقام الزوجية' },
        { sequence: [1, 3, 5, 7, '?'], answer: 9, explanation: 'الأرقام الفردية' },
        { sequence: [5, 10, 15, 20, '?'], answer: 25, explanation: 'مضاعفات الخمسة' }
      ],
      INTERMEDIATE: [
        { sequence: [1, 1, 2, 3, 5, '?'], answer: 8, explanation: 'فيبوناتشي' },
        { sequence: [2, 6, 12, 20, '?'], answer: 30, explanation: 'n(n+1)' },
        { sequence: [1, 4, 9, 16, '?'], answer: 25, explanation: 'مربعات' }
      ],
      ADVANCED: [
        { sequence: [1, 8, 27, 64, '?'], answer: 125, explanation: 'مكعبات' },
        { sequence: [2, 3, 5, 8, 13, '?'], answer: 21, explanation: 'فيبوناتشي معدل' },
        { sequence: [1, 2, 6, 24, '?'], answer: 120, explanation: 'مضروب' }
      ]
    }
    
    const options = sequences[diff] || sequences.BEGINNER
    return { ...options[Math.floor(Math.random() * options.length)], id: Date.now(), difficulty: diff }
  }

  const generateMathPuzzle = (diff) => {
    const puzzles = {
      BEGINNER: [
        {
          question: `ما هو ${Math.floor(Math.random() * 10) + 1} + ${Math.floor(Math.random() * 10) + 1}؟`,
          answer: null, // Will be calculated
          explanation: 'جمع بسيط'
        }
      ],
      INTERMEDIATE: [
        {
          question: 'إذا كان لديك 24 تفاحة وأعطيت ثلث العدد لصديقك، كم تفاحة تبقى معك؟',
          answer: 16,
          explanation: '24 - (24/3) = 24 - 8 = 16'
        }
      ]
    }
    
    // Generate simple math for beginners
    if (diff === 'BEGINNER') {
      const a = Math.floor(Math.random() * 20) + 1
      const b = Math.floor(Math.random() * 20) + 1
      const operations = ['+', '-', '×']
      const op = operations[Math.floor(Math.random() * operations.length)]
      
      let answer
      switch (op) {
        case '+':
          answer = a + b
          break
        case '-':
          answer = Math.abs(a - b)
          break
        case '×':
          answer = a * b
          break
      }
      
      return {
        id: Date.now(),
        difficulty: diff,
        question: `ما هو ${a} ${op} ${b}؟`,
        answer,
        explanation: `${a} ${op} ${b} = ${answer}`,
        options: [answer, answer + 1, answer - 1, answer + 2].sort(() => Math.random() - 0.5)
      }
    }
    
    const options = puzzles[diff] || puzzles.BEGINNER
    return { ...options[Math.floor(Math.random() * options.length)], id: Date.now(), difficulty: diff }
  }

  const generatePatternPuzzle = (diff) => {
    const patterns = {
      BEGINNER: [
        {
          pattern: ['🔴', '🔵', '🔴', '🔵', '?'],
          options: ['🔴', '🔵', '🟡', '🟢'],
          answer: '🔴',
          explanation: 'نمط متناوب'
        }
      ]
    }
    
    const options = patterns[diff] || patterns.BEGINNER
    return { ...options[Math.floor(Math.random() * options.length)], id: Date.now(), difficulty: diff }
  }

  const startNewPuzzle = () => {
    const puzzle = generatePuzzle()
    setCurrentPuzzle(puzzle)
    setTimeLeft(DIFFICULTY_LEVELS[difficulty].timeLimit)
    setTotalTime(DIFFICULTY_LEVELS[difficulty].timeLimit)
    setUserAnswer('')
    setSelectedOption(null)
    setShowHint(false)
    setShowSolution(false)
    setPuzzleCompleted(false)
    setMistakes(0)
    
    if (puzzleType === PUZZLE_TYPES.SUDOKU && puzzle?.grid) {
      setSudokuGrid(puzzle.grid.map(row => [...row]))
    }
    
    setGameStarted(true)
  }

  const handleAnswer = (answer) => {
    if (puzzleCompleted) return
    
    const isCorrect = answer == currentPuzzle.answer
    const timeTaken = totalTime - timeLeft
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier
    
    setPuzzleCompleted(true)
    
    if (isCorrect) {
      const baseScore = 100
      const timeBonus = Math.max(0, timeLeft * 2)
      const difficultyBonus = baseScore * (difficultyMultiplier - 1)
      const hintPenalty = hintsUsed * 10
      const totalScore = Math.floor(baseScore + timeBonus + difficultyBonus - hintPenalty)
      
      setScore(prev => prev + totalScore)
      setStreak(prev => {
        const newStreak = prev + 1
        setBestStreak(current => Math.max(current, newStreak))
        return newStreak
      })
      setLevel(prev => prev + 1)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPuzzles: prev.totalPuzzles + 1,
        correctAnswers: prev.correctAnswers + 1,
        averageTime: (prev.averageTime * prev.totalPuzzles + timeTaken) / (prev.totalPuzzles + 1),
        bestTime: Math.min(prev.bestTime, timeTaken),
        totalHints: prev.totalHints + hintsUsed
      }))
      
      showToast(`إجابة صحيحة! +${totalScore} نقطة`, 'success')
    } else {
      setStreak(0)
      setStats(prev => ({
        ...prev,
        totalPuzzles: prev.totalPuzzles + 1
      }))
      
      showToast('إجابة خاطئة! حاول مرة أخرى', 'error')
    }
    
    setShowSolution(true)
  }

  const handleTimeUp = () => {
    setPuzzleCompleted(true)
    setStreak(0)
    setShowSolution(true)
    showToast('انتهى الوقت!', 'error')
  }

  const useHint = () => {
    if (hintsUsed >= 2 || !currentPuzzle) return
    
    setHintsUsed(prev => prev + 1)
    setShowHint(true)
    setScore(prev => Math.max(0, prev - 25))
    showToast('استخدمت تلميحاً! -25 نقطة', 'info')
  }

  const nextPuzzle = () => {
    setHintsUsed(0)
    startNewPuzzle()
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentPuzzle(null)
    setScore(0)
    setLevel(1)
    setStreak(0)
    setHintsUsed(0)
    setTimeLeft(0)
    setPuzzleCompleted(false)
    setShowSolution(false)
    setMistakes(0)
    showToast('تم إعادة تعيين اللعبة', 'info')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب الألغاز المنطقية</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            تسجيل الدخول
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/games')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            العودة للألعاب
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الألغاز المنطقية</h1>
            <p className="text-gray-600">تحدى عقلك مع ألغاز منطقية متنوعة</p>
          </div>
          
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            إعادة تعيين
          </button>
        </div>

        {!gameStarted ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر نوع اللغز</h2>
                <p className="text-gray-600">حدد نوع الألغاز ومستوى الصعوبة</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    نوع اللغز
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { type: PUZZLE_TYPES.NUMBER_SEQUENCE, name: 'متتاليات الأرقام', icon: '🔢' },
                      { type: PUZZLE_TYPES.MATHEMATICAL, name: 'ألغاز رياضية', icon: '➕' },
                      { type: PUZZLE_TYPES.PATTERN_MATCHING, name: 'مطابقة الأنماط', icon: '🎨' },
                      { type: PUZZLE_TYPES.SUDOKU, name: 'سودوكو', icon: '🧩' }
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setPuzzleType(option.type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          puzzleType === option.type
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-medium">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                      <option key={key} value={key}>
                        {level.name} - {level.timeLimit} ثانية
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={startNewPuzzle}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  ابدأ اللعب
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Trophy className="h-6 w-6" />
                  <span className="text-xl font-bold">{score}</span>
                </div>
                <p className="text-purple-100 text-sm">النقاط</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Target className="h-6 w-6" />
                  <span className="text-xl font-bold">{level}</span>
                </div>
                <p className="text-blue-100 text-sm">المستوى</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Zap className="h-6 w-6" />
                  <span className="text-xl font-bold">{streak}</span>
                </div>
                <p className="text-green-100 text-sm">متتالية</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Clock className="h-6 w-6" />
                  <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-yellow-100 text-sm">الوقت المتبقي</p>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Award className="h-6 w-6" />
                  <span className="text-xl font-bold">{bestStreak}</span>
                </div>
                <p className="text-red-100 text-sm">أفضل متتالية</p>
              </div>
              
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Lightbulb className="h-6 w-6" />
                  <span className="text-xl font-bold">{2 - hintsUsed}</span>
                </div>
                <p className="text-gray-100 text-sm">تلميحات متبقية</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">تقدم الوقت</span>
                <span className="text-sm text-gray-500">{formatTime(timeLeft)} متبقي</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Puzzle Content */}
            {currentPuzzle && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {puzzleType === PUZZLE_TYPES.NUMBER_SEQUENCE && 'متتالية الأرقام'}
                    {puzzleType === PUZZLE_TYPES.MATHEMATICAL && 'لغز رياضي'}
                    {puzzleType === PUZZLE_TYPES.PATTERN_MATCHING && 'مطابقة النمط'}
                    {puzzleType === PUZZLE_TYPES.SUDOKU && 'سودوكو'}
                  </h2>
                  <p className="text-gray-600">
                    المستوى: {DIFFICULTY_LEVELS[difficulty].name}
                  </p>
                </div>

                {/* Number Sequence Puzzle */}
                {puzzleType === PUZZLE_TYPES.NUMBER_SEQUENCE && currentPuzzle.sequence && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-lg text-gray-700 mb-4">أكمل المتتالية:</p>
                      <div className="flex items-center justify-center space-x-4 space-x-reverse text-3xl font-bold">
                        {currentPuzzle.sequence.map((item, index) => (
                          <div key={index} className={`
                            w-16 h-16 flex items-center justify-center rounded-xl border-2
                            ${item === '?' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'}
                          `}>
                            {item === '?' ? '?' : item}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="أدخل الرقم المفقود"
                        className="w-full p-4 text-center text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={puzzleCompleted}
                      />
                    </div>
                  </div>
                )}

                {/* Mathematical Puzzle */}
                {puzzleType === PUZZLE_TYPES.MATHEMATICAL && currentPuzzle.question && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-xl text-gray-800 mb-6">{currentPuzzle.question}</p>
                      
                      {currentPuzzle.options ? (
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                          {currentPuzzle.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedOption(option)}
                              className={`p-4 text-xl font-semibold rounded-xl border-2 transition-all ${
                                selectedOption === option
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                              disabled={puzzleCompleted}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="أدخل الإجابة"
                          className="w-full max-w-md mx-auto p-4 text-center text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={puzzleCompleted}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Pattern Matching Puzzle */}
                {puzzleType === PUZZLE_TYPES.PATTERN_MATCHING && currentPuzzle.pattern && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-lg text-gray-700 mb-4">أكمل النمط:</p>
                      <div className="flex items-center justify-center space-x-4 space-x-reverse text-4xl mb-6">
                        {currentPuzzle.pattern.map((item, index) => (
                          <div key={index} className={`
                            w-20 h-20 flex items-center justify-center rounded-xl border-2
                            ${item === '?' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'}
                          `}>
                            {item === '?' ? '?' : item}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        {currentPuzzle.options?.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedOption(option)}
                            className={`p-4 text-3xl rounded-xl border-2 transition-all ${
                              selectedOption === option
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                            disabled={puzzleCompleted}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-4 space-x-reverse mt-8">
                  {!puzzleCompleted && (
                    <>
                      <button
                        onClick={() => handleAnswer(selectedOption || userAnswer)}
                        disabled={!selectedOption && !userAnswer}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        تأكيد الإجابة
                      </button>
                      
                      <button
                        onClick={useHint}
                        disabled={hintsUsed >= 2}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Lightbulb className="h-5 w-5 mr-2" />
                        تلميح ({2 - hintsUsed})
                      </button>
                      
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                      >
                        {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                        {isPaused ? 'استئناف' : 'إيقاف مؤقت'}
                      </button>
                    </>
                  )}
                  
                  {puzzleCompleted && (
                    <button
                      onClick={nextPuzzle}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      اللغز التالي
                    </button>
                  )}
                </div>

                {/* Hint Display */}
                {showHint && currentPuzzle.explanation && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-800">تلميح:</span>
                    </div>
                    <p className="text-yellow-700">{currentPuzzle.explanation}</p>
                  </div>
                )}

                {/* Solution Display */}
                {showSolution && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Eye className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-800">الحل:</span>
                    </div>
                    <p className="text-blue-700 mb-2">
                      الإجابة الصحيحة: <span className="font-bold">{currentPuzzle.answer}</span>
                    </p>
                    <p className="text-blue-600">{currentPuzzle.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalPuzzles}</div>
                  <div className="text-sm text-gray-600">إجمالي الألغاز</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                  <div className="text-sm text-gray-600">إجابات صحيحة</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalPuzzles > 0 ? Math.round((stats.correctAnswers / stats.totalPuzzles) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">معدل النجاح</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.bestTime === Infinity ? '--' : formatTime(Math.floor(stats.bestTime))}
                  </div>
                  <div className="text-sm text-gray-600">أفضل وقت</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default LogicPuzzles