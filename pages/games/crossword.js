import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { 
  ChevronLeft, Grid3X3, Clock, Trophy, Star, Lightbulb, 
  RotateCcw, Play, Pause, CheckCircle, XCircle, Target,
  Zap, Award, TrendingUp, Eye, EyeOff, Book, Hash
} from 'lucide-react'

// Crossword data structure
const CROSSWORD_PUZZLES = {
  easy: {
    grid: [
      ['ك', 'ت', 'ا', 'ب', '', '', '', '', '', ''],
      ['', '', '', 'ي', '', '', '', '', '', ''],
      ['', '', '', 'ت', '', '', '', '', '', ''],
      ['ش', 'م', 'س', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '']
    ],
    words: [
      {
        id: 1,
        word: 'كتاب',
        clue: 'مجموعة من الأوراق المطبوعة',
        startRow: 0,
        startCol: 0,
        direction: 'horizontal',
        length: 4
      },
      {
        id: 2,
        word: 'بيت',
        clue: 'مكان السكن',
        startRow: 0,
        startCol: 3,
        direction: 'vertical',
        length: 3
      },
      {
        id: 3,
        word: 'شمس',
        clue: 'النجم الذي يضيء النهار',
        startRow: 3,
        startCol: 0,
        direction: 'horizontal',
        length: 3
      }
    ]
  },
  medium: {
    grid: [
      ['م', 'د', 'ر', 'س', 'ة', '', '', '', '', ''],
      ['', '', '', '', 'ل', '', '', '', '', ''],
      ['', '', '', '', 'م', '', '', '', '', ''],
      ['ق', 'ل', 'م', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '']
    ],
    words: [
      {
        id: 1,
        word: 'مدرسة',
        clue: 'مكان التعليم',
        startRow: 0,
        startCol: 0,
        direction: 'horizontal',
        length: 5
      },
      {
        id: 2,
        word: 'علم',
        clue: 'المعرفة والدراسة',
        startRow: 0,
        startCol: 4,
        direction: 'vertical',
        length: 3
      },
      {
        id: 3,
        word: 'قلم',
        clue: 'أداة الكتابة',
        startRow: 3,
        startCol: 0,
        direction: 'horizontal',
        length: 3
      }
    ]
  },
  hard: {
    grid: [
      ['ح', 'ا', 'س', 'و', 'ب', '', '', '', '', ''],
      ['', '', '', '', 'ر', '', '', '', '', ''],
      ['', '', '', '', 'م', '', '', '', '', ''],
      ['', '', '', '', 'ج', '', '', '', '', ''],
      ['', '', '', '', 'ة', '', '', '', '', ''],
      ['ت', 'ك', 'ن', 'و', 'ل', 'و', 'ج', 'ي', 'ا', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '']
    ],
    words: [
      {
        id: 1,
        word: 'حاسوب',
        clue: 'جهاز إلكتروني للحوسبة',
        startRow: 0,
        startCol: 0,
        direction: 'horizontal',
        length: 5
      },
      {
        id: 2,
        word: 'برمجة',
        clue: 'كتابة الأكواد البرمجية',
        startRow: 0,
        startCol: 4,
        direction: 'vertical',
        length: 5
      },
      {
        id: 3,
        word: 'تكنولوجيا',
        clue: 'التقنية الحديثة',
        startRow: 5,
        startCol: 0,
        direction: 'horizontal',
        length: 9
      }
    ]
  }
}

// Additional word banks for dynamic generation
const WORD_BANKS = {
  animals: [
    { word: 'أسد', clue: 'ملك الغابة' },
    { word: 'فيل', clue: 'أكبر الحيوانات البرية' },
    { word: 'نمر', clue: 'حيوان مفترس مخطط' },
    { word: 'غزال', clue: 'حيوان سريع في الصحراء' },
    { word: 'جمل', clue: 'سفينة الصحراء' }
  ],
  nature: [
    { word: 'شجرة', clue: 'نبات كبير له جذع وأوراق' },
    { word: 'زهرة', clue: 'جزء ملون من النبات' },
    { word: 'نهر', clue: 'مجرى مائي طبيعي' },
    { word: 'جبل', clue: 'ارتفاع طبيعي في الأرض' },
    { word: 'بحر', clue: 'مسطح مائي كبير' }
  ],
  food: [
    { word: 'خبز', clue: 'طعام أساسي مصنوع من الدقيق' },
    { word: 'لحم', clue: 'طعام من الحيوانات' },
    { word: 'فاكهة', clue: 'ثمار حلوة المذاق' },
    { word: 'خضار', clue: 'نباتات تؤكل' },
    { word: 'ماء', clue: 'سائل الحياة' }
  ],
  technology: [
    { word: 'هاتف', clue: 'جهاز للاتصال' },
    { word: 'إنترنت', clue: 'شبكة عالمية للمعلومات' },
    { word: 'برنامج', clue: 'تطبيق حاسوبي' },
    { word: 'موقع', clue: 'صفحة على الإنترنت' },
    { word: 'ذكي', clue: 'صفة للتقنية المتطورة' }
  ]
}

const CrosswordGame = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState('easy')
  const [currentPuzzle, setCurrentPuzzle] = useState(null)
  const [userGrid, setUserGrid] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)
  const [completedWords, setCompletedWords] = useState(new Set())
  
  // Timer and scoring
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [maxHints] = useState(3)
  
  // UI state
  const [showClues, setShowClues] = useState(true)
  const [showNumbers, setShowNumbers] = useState(true)
  const [currentDirection, setCurrentDirection] = useState('horizontal')
  const [gameCompleted, setGameCompleted] = useState(false)
  
  // Statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesCompleted: 0,
    bestTime: Infinity,
    averageTime: 0,
    totalHints: 0
  })

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isPaused || gameCompleted) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, isPaused, gameCompleted])

  // Initialize game
  const initializeGame = useCallback(() => {
    const puzzle = CROSSWORD_PUZZLES[difficulty]
    setCurrentPuzzle(puzzle)
    
    // Create empty user grid
    const emptyGrid = puzzle.grid.map(row => 
      row.map(cell => cell === '' ? '' : '')
    )
    setUserGrid(emptyGrid)
    
    setTimeElapsed(0)
    setScore(0)
    setHintsUsed(0)
    setCompletedWords(new Set())
    setSelectedCell(null)
    setSelectedWord(null)
    setGameCompleted(false)
    setGameStarted(true)
  }, [difficulty])

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (!currentPuzzle || currentPuzzle.grid[row][col] === '') return
    
    setSelectedCell({ row, col })
    
    // Find word that contains this cell
    const word = currentPuzzle.words.find(w => {
      if (w.direction === 'horizontal') {
        return row === w.startRow && col >= w.startCol && col < w.startCol + w.length
      } else {
        return col === w.startCol && row >= w.startRow && row < w.startRow + w.length
      }
    })
    
    if (word) {
      setSelectedWord(word)
    }
  }

  // Handle input
  const handleInput = (value) => {
    if (!selectedCell || !currentPuzzle) return
    
    const { row, col } = selectedCell
    const newGrid = [...userGrid]
    newGrid[row][col] = value.toUpperCase()
    setUserGrid(newGrid)
    
    // Check if word is completed
    if (selectedWord) {
      checkWordCompletion(selectedWord, newGrid)
    }
    
    // Move to next cell
    moveToNextCell()
  }

  // Move to next cell
  const moveToNextCell = () => {
    if (!selectedCell || !selectedWord) return
    
    const { row, col } = selectedCell
    let nextRow = row
    let nextCol = col
    
    if (selectedWord.direction === 'horizontal') {
      nextCol = col + 1
      if (nextCol >= selectedWord.startCol + selectedWord.length) {
        return // End of word
      }
    } else {
      nextRow = row + 1
      if (nextRow >= selectedWord.startRow + selectedWord.length) {
        return // End of word
      }
    }
    
    setSelectedCell({ row: nextRow, col: nextCol })
  }

  // Check word completion
  const checkWordCompletion = (word, grid) => {
    let isComplete = true
    let userWord = ''
    
    for (let i = 0; i < word.length; i++) {
      let row, col
      if (word.direction === 'horizontal') {
        row = word.startRow
        col = word.startCol + i
      } else {
        row = word.startRow + i
        col = word.startCol
      }
      
      const userChar = grid[row][col]
      const correctChar = currentPuzzle.grid[row][col]
      
      userWord += userChar
      
      if (userChar !== correctChar) {
        isComplete = false
      }
    }
    
    if (isComplete && !completedWords.has(word.id)) {
      setCompletedWords(prev => new Set([...prev, word.id]))
      
      // Calculate score
      const wordScore = word.length * 10 * getDifficultyMultiplier()
      setScore(prev => prev + wordScore)
      
      showToast(`أحسنت! كلمة "${word.word}" صحيحة! +${wordScore} نقطة`, 'success')
      
      // Check if game is completed
      if (completedWords.size + 1 === currentPuzzle.words.length) {
        completeGame()
      }
    }
  }

  // Complete game
  const completeGame = () => {
    setGameCompleted(true)
    
    const finalScore = score + getTimeBonus()
    setScore(finalScore)
    
    // Update statistics
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesCompleted: prev.gamesCompleted + 1,
      bestTime: Math.min(prev.bestTime, timeElapsed),
      averageTime: (prev.averageTime * prev.gamesCompleted + timeElapsed) / (prev.gamesCompleted + 1),
      totalHints: prev.totalHints + hintsUsed
    }))
    
    showToast(`تهانينا! أكملت الكلمات المتقاطعة! النتيجة النهائية: ${finalScore}`, 'success')
  }

  // Get difficulty multiplier
  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 1.5
      case 'hard': return 2
      default: return 1
    }
  }

  // Get time bonus
  const getTimeBonus = () => {
    const maxTime = difficulty === 'easy' ? 600 : difficulty === 'medium' ? 900 : 1200
    const remainingTime = Math.max(0, maxTime - timeElapsed)
    return Math.floor(remainingTime / 10)
  }

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || !selectedWord || !selectedCell) return
    
    const { row, col } = selectedCell
    const correctChar = currentPuzzle.grid[row][col]
    
    const newGrid = [...userGrid]
    newGrid[row][col] = correctChar
    setUserGrid(newGrid)
    
    setHintsUsed(prev => prev + 1)
    setScore(prev => Math.max(0, prev - 20))
    
    checkWordCompletion(selectedWord, newGrid)
    
    showToast('استخدمت تلميحاً! -20 نقطة', 'info')
  }

  // Clear word
  const clearWord = () => {
    if (!selectedWord) return
    
    const newGrid = [...userGrid]
    
    for (let i = 0; i < selectedWord.length; i++) {
      let row, col
      if (selectedWord.direction === 'horizontal') {
        row = selectedWord.startRow
        col = selectedWord.startCol + i
      } else {
        row = selectedWord.startRow + i
        col = selectedWord.startCol
      }
      
      newGrid[row][col] = ''
    }
    
    setUserGrid(newGrid)
    setCompletedWords(prev => {
      const newSet = new Set(prev)
      newSet.delete(selectedWord.id)
      return newSet
    })
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get cell class
  const getCellClass = (row, col) => {
    const isBlocked = !currentPuzzle || currentPuzzle.grid[row][col] === ''
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col
    const isInSelectedWord = selectedWord && isInWord(selectedWord, row, col)
    const isCompleted = selectedWord && completedWords.has(selectedWord.id) && isInWord(selectedWord, row, col)
    
    let classes = 'w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold '
    
    if (isBlocked) {
      classes += 'bg-gray-800 '
    } else if (isCompleted) {
      classes += 'bg-green-200 text-green-800 '
    } else if (isSelected) {
      classes += 'bg-blue-200 text-blue-800 '
    } else if (isInSelectedWord) {
      classes += 'bg-blue-100 text-blue-700 '
    } else {
      classes += 'bg-white hover:bg-gray-50 cursor-pointer '
    }
    
    return classes
  }

  // Check if cell is in word
  const isInWord = (word, row, col) => {
    if (word.direction === 'horizontal') {
      return row === word.startRow && col >= word.startCol && col < word.startCol + word.length
    } else {
      return col === word.startCol && row >= word.startRow && row < word.startRow + word.length
    }
  }

  // Get word number for cell
  const getWordNumber = (row, col) => {
    if (!currentPuzzle) return null
    
    const word = currentPuzzle.words.find(w => 
      w.startRow === row && w.startCol === col
    )
    
    return word ? word.id : null
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid3X3 className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب الكلمات المتقاطعة</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            تسجيل الدخول
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الكلمات المتقاطعة العربية</h1>
            <p className="text-gray-600">اختبر معرفتك باللغة العربية</p>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setShowClues(!showClues)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {showClues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setGameStarted(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!gameStarted ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <Grid3X3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر مستوى الصعوبة</h2>
                <p className="text-gray-600">حدد مستوى التحدي المناسب لك</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { level: 'easy', name: 'سهل', description: '3 كلمات - مناسب للمبتدئين', color: 'green' },
                  { level: 'medium', name: 'متوسط', description: '5 كلمات - تحدي معتدل', color: 'yellow' },
                  { level: 'hard', name: 'صعب', description: '8 كلمات - للخبراء', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.level}
                    onClick={() => setDifficulty(option.level)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      difficulty === option.level
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{option.name}</h3>
                        <p className="text-gray-600">{option.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        difficulty === option.level
                          ? `border-${option.color}-500 bg-${option.color}-500`
                          : 'border-gray-300'
                      }`}>
                        {difficulty === option.level && (
                          <CheckCircle className="w-full h-full text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={initializeGame}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <Play className="h-5 w-5 mr-2" />
                ابدأ اللعب
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Stats */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Trophy className="h-6 w-6" />
                    <span className="text-xl font-bold">{score}</span>
                  </div>
                  <p className="text-blue-100 text-sm">النقاط</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-xl font-bold">{completedWords.size}/{currentPuzzle?.words.length || 0}</span>
                  </div>
                  <p className="text-green-100 text-sm">الكلمات</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Clock className="h-6 w-6" />
                    <span className="text-xl font-bold">{formatTime(timeElapsed)}</span>
                  </div>
                  <p className="text-purple-100 text-sm">الوقت</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Lightbulb className="h-6 w-6" />
                    <span className="text-xl font-bold">{maxHints - hintsUsed}</span>
                  </div>
                  <p className="text-yellow-100 text-sm">تلميحات</p>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Target className="h-6 w-6" />
                    <span className="text-xl font-bold">{Math.round((completedWords.size / (currentPuzzle?.words.length || 1)) * 100)}%</span>
                  </div>
                  <p className="text-red-100 text-sm">التقدم</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Star className="h-6 w-6" />
                    <span className="text-xl font-bold">{difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}</span>
                  </div>
                  <p className="text-gray-100 text-sm">المستوى</p>
                </div>
              </div>
            </div>

            {/* Crossword Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">الشبكة</h3>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                      {isPaused ? 'استئناف' : 'إيقاف'}
                    </button>
                    
                    {selectedWord && (
                      <button
                        onClick={useHint}
                        disabled={hintsUsed >= maxHints}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        تلميح
                      </button>
                    )}
                    
                    {selectedWord && (
                      <button
                        onClick={clearWord}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        مسح
                      </button>
                    )}
                  </div>
                </div>
                
                {currentPuzzle && (
                  <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
                    {currentPuzzle.grid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const wordNumber = getWordNumber(rowIndex, colIndex)
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={getCellClass(rowIndex, colIndex)}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                          >
                            {showNumbers && wordNumber && (
                              <span className="absolute text-xs text-gray-500 -mt-2 -ml-2">
                                {wordNumber}
                              </span>
                            )}
                            {cell !== '' && (
                              <input
                                type="text"
                                value={userGrid[rowIndex]?.[colIndex] || ''}
                                onChange={(e) => handleInput(e.target.value.slice(-1))}
                                className="w-full h-full text-center bg-transparent border-none outline-none"
                                maxLength={1}
                                style={{ fontSize: '12px' }}
                              />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
                
                {selectedWord && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-800">
                        {selectedWord.id}. {selectedWord.direction === 'horizontal' ? 'أفقي' : 'عمودي'}
                      </span>
                      <span className="text-blue-600">
                        {selectedWord.length} أحرف
                      </span>
                    </div>
                    <p className="text-blue-700">{selectedWord.clue}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clues Panel */}
            {showClues && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  الأدلة
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      أفقي
                    </h4>
                    <div className="space-y-2">
                      {currentPuzzle?.words
                        .filter(word => word.direction === 'horizontal')
                        .map(word => (
                          <div
                            key={word.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              selectedWord?.id === word.id
                                ? 'bg-blue-100 border border-blue-300'
                                : completedWords.has(word.id)
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => setSelectedWord(word)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {word.id}.
                              </span>
                              {completedWords.has(word.id) && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{word.clue}</p>
                            <p className="text-gray-500 text-xs mt-1">{word.length} أحرف</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      عمودي
                    </h4>
                    <div className="space-y-2">
                      {currentPuzzle?.words
                        .filter(word => word.direction === 'vertical')
                        .map(word => (
                          <div
                            key={word.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              selectedWord?.id === word.id
                                ? 'bg-blue-100 border border-blue-300'
                                : completedWords.has(word.id)
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => setSelectedWord(word)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {word.id}.
                              </span>
                              {completedWords.has(word.id) && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{word.clue}</p>
                            <p className="text-gray-500 text-xs mt-1">{word.length} أحرف</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Completed Modal */}
        {gameCompleted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تهانينا!</h2>
              <p className="text-gray-600 mb-6">لقد أكملت الكلمات المتقاطعة بنجاح</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">النقاط النهائية:</span>
                  <span className="font-bold text-blue-600">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت المستغرق:</span>
                  <span className="font-bold text-purple-600">{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التلميحات المستخدمة:</span>
                  <span className="font-bold text-yellow-600">{hintsUsed}</span>
                </div>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setGameStarted(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  لعب مرة أخرى
                </button>
                
                <button
                  onClick={() => router.push('/games')}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  العودة للألعاب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CrosswordGame