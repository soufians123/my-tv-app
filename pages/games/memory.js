import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { 
  ChevronLeft, Brain, Clock, Trophy, Star, Zap, 
  RotateCcw, Play, Pause, CheckCircle, XCircle, Target,
  Eye, EyeOff, Shuffle, Award, TrendingUp, Grid3X3,
  Layers, Palette, Music, Hash, Heart, Diamond
} from 'lucide-react'

// Game modes
const GAME_MODES = {
  CLASSIC: {
    name: 'كلاسيكي',
    description: 'لعبة الذاكرة التقليدية - اعثر على الأزواج المتطابقة',
    icon: Grid3X3
  },
  SEQUENCE: {
    name: 'التسلسل',
    description: 'تذكر وكرر التسلسل المعروض',
    icon: Layers
  },
  COLORS: {
    name: 'الألوان',
    description: 'تحدي الذاكرة البصرية مع الألوان والأشكال',
    icon: Palette
  },
  NUMBERS: {
    name: 'الأرقام',
    description: 'تذكر مواقع الأرقام وترتيبها',
    icon: Hash
  },
  PATTERNS: {
    name: 'الأنماط',
    description: 'تحدي الذاكرة مع الأنماط المعقدة',
    icon: Diamond
  }
}

// Difficulty levels
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'سهل',
    gridSize: 4,
    timeLimit: 120,
    sequenceLength: 3,
    showTime: 2000
  },
  MEDIUM: {
    name: 'متوسط',
    gridSize: 6,
    timeLimit: 180,
    sequenceLength: 5,
    showTime: 1500
  },
  HARD: {
    name: 'صعب',
    gridSize: 8,
    timeLimit: 240,
    sequenceLength: 7,
    showTime: 1000
  },
  EXPERT: {
    name: 'خبير',
    gridSize: 10,
    timeLimit: 300,
    sequenceLength: 10,
    showTime: 800
  }
}

// Card symbols and colors
const CARD_SYMBOLS = [
  '🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎹', '🎺',
  '🏆', '🏅', '🏈', '🏀', '⚽', '🎾', '🏐', '🏓',
  '🌈', '🌙', '⭐', '☀️', '🌸', '🌺', '🌻', '🌷',
  '🦋', '🐝', '🐞', '🦜', '🐠', '🐙', '🦀', '🐢',
  '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑', '🥝',
  '💎', '💍', '👑', '🎁', '🎀', '🎊', '🎉', '🎈'
]

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

const MemoryGame = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('CLASSIC')
  const [difficulty, setDifficulty] = useState('EASY')
  const [gamePhase, setGamePhase] = useState('setup') // setup, showing, playing, completed
  
  // Classic mode state
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [canFlip, setCanFlip] = useState(true)
  
  // Sequence mode state
  const [sequence, setSequence] = useState([])
  const [userSequence, setUserSequence] = useState([])
  const [showingSequence, setShowingSequence] = useState(false)
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0)
  
  // Colors mode state
  const [colorGrid, setColorGrid] = useState([])
  const [targetColors, setTargetColors] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  
  // Numbers mode state
  const [numberGrid, setNumberGrid] = useState([])
  const [targetNumbers, setTargetNumbers] = useState([])
  const [selectedNumbers, setSelectedNumbers] = useState([])
  
  // Patterns mode state
  const [patternGrid, setPatternGrid] = useState([])
  const [targetPattern, setTargetPattern] = useState([])
  const [userPattern, setUserPattern] = useState([])
  
  // Game progress
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  // Statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesCompleted: 0,
    bestScore: 0,
    bestTime: Infinity,
    totalMoves: 0,
    averageScore: 0,
    longestStreak: 0
  })

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isPaused || gameCompleted || gameOver || gamePhase !== 'playing') return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1
        const timeLimit = DIFFICULTY_LEVELS[difficulty].timeLimit
        
        if (newTime >= timeLimit) {
          handleGameOver()
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, isPaused, gameCompleted, gameOver, gamePhase, difficulty])

  // Initialize game based on mode
  const initializeGame = () => {
    setGameStarted(true)
    setGamePhase('setup')
    setTimeElapsed(0)
    setMoves(0)
    setScore(0)
    setLevel(1)
    setStreak(0)
    setGameCompleted(false)
    setGameOver(false)
    
    switch (gameMode) {
      case 'CLASSIC':
        initializeClassicMode()
        break
      case 'SEQUENCE':
        initializeSequenceMode()
        break
      case 'COLORS':
        initializeColorsMode()
        break
      case 'NUMBERS':
        initializeNumbersMode()
        break
      case 'PATTERNS':
        initializePatternsMode()
        break
    }
    
    showToast(`بدأت لعبة ${GAME_MODES[gameMode].name}!`, 'success')
  }

  // Initialize classic memory game
  const initializeClassicMode = () => {
    const gridSize = DIFFICULTY_LEVELS[difficulty].gridSize
    const totalCards = gridSize * gridSize
    const pairCount = totalCards / 2
    
    // Create pairs of cards
    const cardPairs = []
    for (let i = 0; i < pairCount; i++) {
      const symbol = CARD_SYMBOLS[i % CARD_SYMBOLS.length]
      cardPairs.push({ id: i * 2, symbol, matched: false })
      cardPairs.push({ id: i * 2 + 1, symbol, matched: false })
    }
    
    // Shuffle cards
    const shuffledCards = shuffleArray(cardPairs)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedCards([])
    setCanFlip(true)
    setGamePhase('playing')
  }

  // Initialize sequence memory game
  const initializeSequenceMode = () => {
    const sequenceLength = DIFFICULTY_LEVELS[difficulty].sequenceLength
    const gridSize = DIFFICULTY_LEVELS[difficulty].gridSize
    
    // Generate random sequence
    const newSequence = []
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * (gridSize * gridSize)))
    }
    
    setSequence(newSequence)
    setUserSequence([])
    setCurrentSequenceIndex(0)
    
    // Show sequence
    showSequence(newSequence)
  }

  // Initialize colors memory game
  const initializeColorsMode = () => {
    const gridSize = DIFFICULTY_LEVELS[difficulty].gridSize
    const showTime = DIFFICULTY_LEVELS[difficulty].showTime
    
    // Generate color grid
    const grid = []
    const targets = []
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      grid.push({ id: i, color, isTarget: false })
    }
    
    // Select random targets
    const targetCount = Math.max(3, Math.floor((gridSize * gridSize) / 8))
    const targetIndices = shuffleArray([...Array(gridSize * gridSize).keys()]).slice(0, targetCount)
    
    targetIndices.forEach(index => {
      grid[index].isTarget = true
      targets.push(index)
    })
    
    setColorGrid(grid)
    setTargetColors(targets)
    setSelectedColors([])
    
    // Show targets briefly
    setGamePhase('showing')
    setTimeout(() => {
      setGamePhase('playing')
    }, showTime)
  }

  // Initialize numbers memory game
  const initializeNumbersMode = () => {
    const gridSize = DIFFICULTY_LEVELS[difficulty].gridSize
    const showTime = DIFFICULTY_LEVELS[difficulty].showTime
    
    // Generate number grid
    const grid = []
    const targets = []
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const number = Math.floor(Math.random() * 99) + 1
      grid.push({ id: i, number, isTarget: false })
    }
    
    // Select random targets
    const targetCount = Math.max(3, Math.floor((gridSize * gridSize) / 6))
    const targetIndices = shuffleArray([...Array(gridSize * gridSize).keys()]).slice(0, targetCount)
    
    targetIndices.forEach(index => {
      grid[index].isTarget = true
      targets.push(index)
    })
    
    setNumberGrid(grid)
    setTargetNumbers(targets)
    setSelectedNumbers([])
    
    // Show targets briefly
    setGamePhase('showing')
    setTimeout(() => {
      setGamePhase('playing')
    }, showTime)
  }

  // Initialize patterns memory game
  const initializePatternsMode = () => {
    const gridSize = DIFFICULTY_LEVELS[difficulty].gridSize
    const showTime = DIFFICULTY_LEVELS[difficulty].showTime
    
    // Generate pattern grid
    const grid = []
    const pattern = []
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      grid.push({ id: i, active: false })
    }
    
    // Create random pattern
    const patternSize = Math.max(4, Math.floor((gridSize * gridSize) / 4))
    const patternIndices = shuffleArray([...Array(gridSize * gridSize).keys()]).slice(0, patternSize)
    
    patternIndices.forEach(index => {
      grid[index].active = true
      pattern.push(index)
    })
    
    setPatternGrid(grid)
    setTargetPattern(pattern)
    setUserPattern([])
    
    // Show pattern briefly
    setGamePhase('showing')
    setTimeout(() => {
      // Hide pattern
      const hiddenGrid = grid.map(cell => ({ ...cell, active: false }))
      setPatternGrid(hiddenGrid)
      setGamePhase('playing')
    }, showTime)
  }

  // Show sequence for sequence mode
  const showSequence = (seq) => {
    setShowingSequence(true)
    setGamePhase('showing')
    
    let index = 0
    const showNext = () => {
      if (index < seq.length) {
        setCurrentSequenceIndex(seq[index])
        setTimeout(() => {
          setCurrentSequenceIndex(-1)
          index++
          setTimeout(showNext, 300)
        }, 800)
      } else {
        setShowingSequence(false)
        setGamePhase('playing')
      }
    }
    
    setTimeout(showNext, 1000)
  }

  // Handle card flip in classic mode
  const handleCardFlip = (cardIndex) => {
    if (!canFlip || flippedCards.length >= 2 || flippedCards.includes(cardIndex) || matchedCards.includes(cardIndex)) {
      return
    }
    
    const newFlippedCards = [...flippedCards, cardIndex]
    setFlippedCards(newFlippedCards)
    setMoves(prev => prev + 1)
    
    if (newFlippedCards.length === 2) {
      setCanFlip(false)
      
      // Check for match
      const card1 = cards[newFlippedCards[0]]
      const card2 = cards[newFlippedCards[1]]
      
      if (card1.symbol === card2.symbol) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => [...prev, ...newFlippedCards])
          setFlippedCards([])
          setCanFlip(true)
          setStreak(prev => prev + 1)
          
          const newScore = score + (100 * (streak + 1))
          setScore(newScore)
          
          // Check if game completed
          if (matchedCards.length + 2 === cards.length) {
            handleGameComplete()
          }
          
          showToast('تطابق رائع! +' + (100 * (streak + 1)) + ' نقطة', 'success')
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([])
          setCanFlip(true)
          setStreak(0)
        }, 1500)
      }
    }
  }

  // Handle sequence input
  const handleSequenceInput = (index) => {
    if (showingSequence || gamePhase !== 'playing') return
    
    const newUserSequence = [...userSequence, index]
    setUserSequence(newUserSequence)
    
    // Check if correct
    if (sequence[newUserSequence.length - 1] !== index) {
      // Wrong sequence
      setStreak(0)
      showToast('تسلسل خاطئ! حاول مرة أخرى', 'error')
      
      setTimeout(() => {
        setUserSequence([])
        showSequence(sequence)
      }, 1000)
    } else if (newUserSequence.length === sequence.length) {
      // Sequence completed correctly
      setStreak(prev => prev + 1)
      const newScore = score + (200 * level * (streak + 1))
      setScore(newScore)
      
      showToast('تسلسل صحيح! +' + (200 * level * (streak + 1)) + ' نقطة', 'success')
      
      // Next level
      setTimeout(() => {
        nextLevel()
      }, 1000)
    }
  }

  // Handle color selection
  const handleColorSelection = (index) => {
    if (gamePhase !== 'playing') return
    
    const newSelectedColors = [...selectedColors]
    const existingIndex = newSelectedColors.indexOf(index)
    
    if (existingIndex > -1) {
      newSelectedColors.splice(existingIndex, 1)
    } else {
      newSelectedColors.push(index)
    }
    
    setSelectedColors(newSelectedColors)
  }

  // Handle number selection
  const handleNumberSelection = (index) => {
    if (gamePhase !== 'playing') return
    
    const newSelectedNumbers = [...selectedNumbers]
    const existingIndex = newSelectedNumbers.indexOf(index)
    
    if (existingIndex > -1) {
      newSelectedNumbers.splice(existingIndex, 1)
    } else {
      newSelectedNumbers.push(index)
    }
    
    setSelectedNumbers(newSelectedNumbers)
  }

  // Handle pattern selection
  const handlePatternSelection = (index) => {
    if (gamePhase !== 'playing') return
    
    const newUserPattern = [...userPattern]
    const existingIndex = newUserPattern.indexOf(index)
    
    if (existingIndex > -1) {
      newUserPattern.splice(existingIndex, 1)
    } else {
      newUserPattern.push(index)
    }
    
    setUserPattern(newUserPattern)
  }

  // Check answers for visual memory games
  const checkAnswer = () => {
    let correct = false
    let points = 0
    
    switch (gameMode) {
      case 'COLORS':
        correct = arraysEqual(selectedColors.sort(), targetColors.sort())
        points = correct ? 150 * level * (streak + 1) : 0
        break
      case 'NUMBERS':
        correct = arraysEqual(selectedNumbers.sort(), targetNumbers.sort())
        points = correct ? 200 * level * (streak + 1) : 0
        break
      case 'PATTERNS':
        correct = arraysEqual(userPattern.sort(), targetPattern.sort())
        points = correct ? 250 * level * (streak + 1) : 0
        break
    }
    
    if (correct) {
      setStreak(prev => prev + 1)
      setScore(prev => prev + points)
      showToast(`إجابة صحيحة! +${points} نقطة`, 'success')
      
      setTimeout(() => {
        nextLevel()
      }, 1000)
    } else {
      setStreak(0)
      showToast('إجابة خاطئة! حاول مرة أخرى', 'error')
      
      // Reset selections
      setSelectedColors([])
      setSelectedNumbers([])
      setUserPattern([])
      
      // Show correct answer briefly
      setTimeout(() => {
        if (gameMode === 'COLORS') {
          const newGrid = colorGrid.map((cell, index) => ({
            ...cell,
            isTarget: targetColors.includes(index)
          }))
          setColorGrid(newGrid)
          setGamePhase('showing')
          
          setTimeout(() => {
            setGamePhase('playing')
          }, 2000)
        }
        // Similar logic for other modes...
      }, 1000)
    }
  }

  // Next level
  const nextLevel = () => {
    setLevel(prev => prev + 1)
    
    // Check if reached max level
    if (level >= 10) {
      handleGameComplete()
      return
    }
    
    // Initialize next level based on mode
    switch (gameMode) {
      case 'SEQUENCE':
        const newSequence = [...sequence, Math.floor(Math.random() * (DIFFICULTY_LEVELS[difficulty].gridSize ** 2))]
        setSequence(newSequence)
        setUserSequence([])
        showSequence(newSequence)
        break
      case 'COLORS':
        initializeColorsMode()
        break
      case 'NUMBERS':
        initializeNumbersMode()
        break
      case 'PATTERNS':
        initializePatternsMode()
        break
    }
  }

  // Handle game completion
  const handleGameComplete = () => {
    setGameCompleted(true)
    
    // Calculate final score with time bonus
    const timeLimit = DIFFICULTY_LEVELS[difficulty].timeLimit
    const timeBonus = Math.max(0, timeLimit - timeElapsed) * 10
    const finalScore = score + timeBonus
    setScore(finalScore)
    
    // Update statistics
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesCompleted: prev.gamesCompleted + 1,
      bestScore: Math.max(prev.bestScore, finalScore),
      bestTime: Math.min(prev.bestTime, timeElapsed),
      totalMoves: prev.totalMoves + moves,
      averageScore: (prev.averageScore * prev.gamesCompleted + finalScore) / (prev.gamesCompleted + 1),
      longestStreak: Math.max(prev.longestStreak, streak)
    }))
    
    showToast(`تهانينا! أكملت اللعبة! النتيجة النهائية: ${finalScore}`, 'success')
  }

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true)
    
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalMoves: prev.totalMoves + moves
    }))
    
    showToast('انتهى الوقت! حاول مرة أخرى', 'error')
  }

  // Utility functions
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const arraysEqual = (a, b) => {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getGridSize = () => {
    return DIFFICULTY_LEVELS[difficulty].gridSize
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب ألعاب الذاكرة</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ألعاب الذاكرة والتركيز</h1>
            <p className="text-gray-600">تحدى ذاكرتك وقوة تركيزك</p>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setGameStarted(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!gameStarted ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر نوع اللعبة</h2>
                <p className="text-gray-600">اختر نمط اللعبة ومستوى الصعوبة</p>
              </div>
              
              <div className="space-y-8">
                {/* Game Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    نمط اللعبة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(GAME_MODES).map(([key, mode]) => {
                      const IconComponent = mode.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setGameMode(key)}
                          className={`p-6 rounded-xl border-2 transition-all text-center ${
                            gameMode === key
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <IconComponent className="h-8 w-8 mx-auto mb-3" />
                          <div className="font-semibold text-lg mb-2">{mode.name}</div>
                          <div className="text-sm text-gray-600">{mode.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    مستوى الصعوبة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          difficulty === key
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-semibold text-lg">{level.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          شبكة {level.gridSize}×{level.gridSize}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.floor(level.timeLimit / 60)} دقيقة
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={initializeGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Trophy className="h-6 w-6" />
                  <span className="text-xl font-bold">{score}</span>
                </div>
                <p className="text-purple-100 text-sm">النقاط</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Clock className="h-6 w-6" />
                  <span className="text-xl font-bold">{formatTime(timeElapsed)}</span>
                </div>
                <p className="text-blue-100 text-sm">الوقت</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Target className="h-6 w-6" />
                  <span className="text-xl font-bold">{level}</span>
                </div>
                <p className="text-green-100 text-sm">المستوى</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Zap className="h-6 w-6" />
                  <span className="text-xl font-bold">{streak}</span>
                </div>
                <p className="text-yellow-100 text-sm">التتالي</p>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Shuffle className="h-6 w-6" />
                  <span className="text-xl font-bold">{moves}</span>
                </div>
                <p className="text-red-100 text-sm">الحركات</p>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Star className="h-6 w-6" />
                  <span className="text-xl font-bold">{DIFFICULTY_LEVELS[difficulty].name}</span>
                </div>
                <p className="text-indigo-100 text-sm">الصعوبة</p>
              </div>
              
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Brain className="h-6 w-6" />
                  <span className="text-xl font-bold">{GAME_MODES[gameMode].name}</span>
                </div>
                <p className="text-pink-100 text-sm">النمط</p>
              </div>
            </div>

            {/* Game Area */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {GAME_MODES[gameMode].name}
                </h3>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                    {isPaused ? 'استئناف' : 'إيقاف'}
                  </button>
                  
                  {(gameMode === 'COLORS' || gameMode === 'NUMBERS' || gameMode === 'PATTERNS') && gamePhase === 'playing' && (
                    <button
                      onClick={checkAnswer}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      تحقق
                    </button>
                  )}
                </div>
              </div>
              
              {/* Game Phase Indicator */}
              {gamePhase === 'showing' && (
                <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-800 font-semibold">انتبه جيداً! تذكر ما تراه...</p>
                </div>
              )}
              
              {gamePhase === 'playing' && gameMode !== 'CLASSIC' && (
                <div className="text-center mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">
                    {gameMode === 'SEQUENCE' && 'كرر التسلسل الذي رأيته'}
                    {gameMode === 'COLORS' && 'اختر الألوان التي رأيتها مضيئة'}
                    {gameMode === 'NUMBERS' && 'اختر الأرقام التي رأيتها مضيئة'}
                    {gameMode === 'PATTERNS' && 'اختر النمط الذي رأيته'}
                  </p>
                </div>
              )}
              
              {/* Classic Memory Game */}
              {gameMode === 'CLASSIC' && cards.length > 0 && (
                <div 
                  className="grid gap-2 max-w-2xl mx-auto"
                  style={{ gridTemplateColumns: `repeat(${getGridSize()}, minmax(0, 1fr))` }}
                >
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardFlip(index)}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-300 ${
                        flippedCards.includes(index) || matchedCards.includes(index)
                          ? 'bg-white border-blue-500 text-gray-800'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white hover:from-blue-600 hover:to-purple-700'
                      } ${
                        matchedCards.includes(index) ? 'opacity-75 cursor-default' : ''
                      }`}
                    >
                      {flippedCards.includes(index) || matchedCards.includes(index) ? card.symbol : '?'}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Sequence Memory Game */}
              {gameMode === 'SEQUENCE' && (
                <div 
                  className="grid gap-2 max-w-2xl mx-auto"
                  style={{ gridTemplateColumns: `repeat(${getGridSize()}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: getGridSize() * getGridSize() }).map((_, index) => (
                    <div
                      key={index}
                      onClick={() => handleSequenceInput(index)}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 ${
                        currentSequenceIndex === index
                          ? 'bg-yellow-400 border-yellow-500 text-yellow-900 scale-110'
                          : userSequence.includes(index)
                          ? 'bg-green-400 border-green-500 text-green-900'
                          : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Colors Memory Game */}
              {gameMode === 'COLORS' && colorGrid.length > 0 && (
                <div 
                  className="grid gap-2 max-w-2xl mx-auto"
                  style={{ gridTemplateColumns: `repeat(${getGridSize()}, minmax(0, 1fr))` }}
                >
                  {colorGrid.map((cell, index) => (
                    <div
                      key={cell.id}
                      onClick={() => handleColorSelection(index)}
                      className={`aspect-square rounded-lg border-4 cursor-pointer transition-all duration-300 ${
                        gamePhase === 'showing' && cell.isTarget
                          ? 'border-white shadow-lg scale-110'
                          : selectedColors.includes(index)
                          ? 'border-yellow-400 shadow-lg scale-105'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: cell.color }}
                    />
                  ))}
                </div>
              )}
              
              {/* Numbers Memory Game */}
              {gameMode === 'NUMBERS' && numberGrid.length > 0 && (
                <div 
                  className="grid gap-2 max-w-2xl mx-auto"
                  style={{ gridTemplateColumns: `repeat(${getGridSize()}, minmax(0, 1fr))` }}
                >
                  {numberGrid.map((cell, index) => (
                    <div
                      key={cell.id}
                      onClick={() => handleNumberSelection(index)}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-300 ${
                        gamePhase === 'showing' && cell.isTarget
                          ? 'bg-yellow-400 border-yellow-500 text-yellow-900 scale-110'
                          : selectedNumbers.includes(index)
                          ? 'bg-green-400 border-green-500 text-green-900'
                          : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {gamePhase === 'showing' || selectedNumbers.includes(index) ? cell.number : '?'}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Patterns Memory Game */}
              {gameMode === 'PATTERNS' && patternGrid.length > 0 && (
                <div 
                  className="grid gap-2 max-w-2xl mx-auto"
                  style={{ gridTemplateColumns: `repeat(${getGridSize()}, minmax(0, 1fr))` }}
                >
                  {patternGrid.map((cell, index) => (
                    <div
                      key={cell.id}
                      onClick={() => handlePatternSelection(index)}
                      className={`aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        cell.active
                          ? 'bg-purple-500 border-purple-600 scale-110'
                          : userPattern.includes(index)
                          ? 'bg-blue-400 border-blue-500'
                          : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Completed Modal */}
        {gameCompleted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تهانينا!</h2>
              <p className="text-gray-600 mb-6">لقد أكملت لعبة {GAME_MODES[gameMode].name} بنجاح</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">النقاط النهائية:</span>
                  <span className="font-bold text-purple-600">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المستوى المكتمل:</span>
                  <span className="font-bold text-green-600">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت المستغرق:</span>
                  <span className="font-bold text-blue-600">{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">أطول تتالي:</span>
                  <span className="font-bold text-yellow-600">{streak}</span>
                </div>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setGameStarted(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">انتهى الوقت!</h2>
              <p className="text-gray-600 mb-6">لم تتمكن من إكمال التحدي في الوقت المحدد</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">النقاط المحققة:</span>
                  <span className="font-bold text-purple-600">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المستوى المكتمل:</span>
                  <span className="font-bold text-green-600">{level - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحركات:</span>
                  <span className="font-bold text-blue-600">{moves}</span>
                </div>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setGameStarted(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  محاولة جديدة
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

export default MemoryGame