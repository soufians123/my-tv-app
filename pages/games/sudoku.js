import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { 
  ChevronLeft, Grid3X3, Clock, Trophy, Star, Lightbulb, 
  RotateCcw, Play, Pause, CheckCircle, XCircle, Target,
  Zap, Award, TrendingUp, Eye, EyeOff, Eraser, Hash
} from 'lucide-react'

// Sudoku difficulty levels
const DIFFICULTY_LEVELS = {
  EASY: { name: 'سهل', clues: 45, timeLimit: 1800 },
  MEDIUM: { name: 'متوسط', clues: 35, timeLimit: 1200 },
  HARD: { name: 'صعب', clues: 25, timeLimit: 900 },
  EXPERT: { name: 'خبير', clues: 20, timeLimit: 600 },
  MASTER: { name: 'أستاذ', clues: 17, timeLimit: 450 }
}

// Sudoku variants
const SUDOKU_VARIANTS = {
  CLASSIC: { name: 'كلاسيكي', description: 'السودوكو التقليدي 9×9' },
  MINI: { name: 'مصغر', description: 'سودوكو 6×6 للمبتدئين' },
  DIAGONAL: { name: 'قطري', description: 'مع قيود إضافية على الأقطار' },
  IRREGULAR: { name: 'غير منتظم', description: 'مناطق بأشكال غير منتظمة' },
  KILLER: { name: 'القاتل', description: 'مع مجاميع رياضية' }
}

// Sample Sudoku puzzles
const SAMPLE_PUZZLES = {
  EASY: [
    [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
  ],
  MEDIUM: [
    [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ]
  ],
  HARD: [
    [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ]
  ]
}

// Solutions for the sample puzzles
const PUZZLE_SOLUTIONS = {
  EASY: [
    [
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
  ]
}

const SudokuGame = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState('EASY')
  const [variant, setVariant] = useState('CLASSIC')
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [userGrid, setUserGrid] = useState([])
  const [originalGrid, setOriginalGrid] = useState([])
  
  // UI state
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState({})
  const [highlightNumber, setHighlightNumber] = useState(null)
  const [showErrors, setShowErrors] = useState(true)
  const [autoCheckErrors, setAutoCheckErrors] = useState(true)
  
  // Game progress
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [maxMistakes] = useState(3)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [maxHints] = useState(3)
  const [score, setScore] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  // Statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesCompleted: 0,
    bestTime: Infinity,
    averageTime: 0,
    totalHints: 0,
    totalMistakes: 0
  })

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isPaused || gameCompleted || gameOver) return
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, isPaused, gameCompleted, gameOver])

  // Generate Sudoku puzzle
  const generatePuzzle = useCallback(() => {
    // For now, use sample puzzles
    const puzzles = SAMPLE_PUZZLES[difficulty] || SAMPLE_PUZZLES.EASY
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)]
    
    // Create deep copy
    const newPuzzle = randomPuzzle.map(row => [...row])
    const newSolution = PUZZLE_SOLUTIONS[difficulty]?.[0] || generateSolution(newPuzzle)
    
    return { puzzle: newPuzzle, solution: newSolution }
  }, [difficulty])

  // Generate solution (simplified solver)
  const generateSolution = (grid) => {
    // This is a simplified version - in a real implementation,
    // you'd use a proper Sudoku solver algorithm
    return grid.map(row => [...row])
  }

  // Initialize game
  const initializeGame = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle()
    
    setPuzzle(newPuzzle)
    setSolution(newSolution)
    setUserGrid(newPuzzle.map(row => [...row]))
    setOriginalGrid(newPuzzle.map(row => [...row]))
    
    // Reset game state
    setTimeElapsed(0)
    setMistakes(0)
    setHintsUsed(0)
    setScore(0)
    setSelectedCell(null)
    setSelectedNumber(null)
    setNotes({})
    setGameCompleted(false)
    setGameOver(false)
    setGameStarted(true)
    
    showToast('بدأت لعبة سودوكو جديدة!', 'success')
  }

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameCompleted || gameOver) return
    
    setSelectedCell({ row, col })
    
    // Highlight same numbers
    const cellValue = userGrid[row][col]
    if (cellValue !== 0) {
      setHighlightNumber(cellValue)
    } else {
      setHighlightNumber(null)
    }
  }

  // Handle number input
  const handleNumberInput = (number) => {
    if (!selectedCell || gameCompleted || gameOver) return
    
    const { row, col } = selectedCell
    
    // Don't allow changing original clues
    if (originalGrid[row][col] !== 0) return
    
    if (showNotes && number !== 0) {
      // Toggle note
      const noteKey = `${row}-${col}`
      const currentNotes = notes[noteKey] || new Set()
      const newNotes = new Set(currentNotes)
      
      if (newNotes.has(number)) {
        newNotes.delete(number)
      } else {
        newNotes.add(number)
      }
      
      setNotes(prev => ({
        ...prev,
        [noteKey]: newNotes
      }))
    } else {
      // Place number
      const newGrid = [...userGrid]
      newGrid[row][col] = number
      setUserGrid(newGrid)
      
      // Clear notes for this cell
      const noteKey = `${row}-${col}`
      setNotes(prev => {
        const newNotes = { ...prev }
        delete newNotes[noteKey]
        return newNotes
      })
      
      // Check for errors
      if (autoCheckErrors && number !== 0) {
        const isValid = isValidMove(row, col, number, newGrid)
        if (!isValid) {
          setMistakes(prev => {
            const newMistakes = prev + 1
            if (newMistakes >= maxMistakes) {
              handleGameOver()
            }
            return newMistakes
          })
          showToast('خطأ! هذا الرقم غير صحيح في هذا المكان', 'error')
        }
      }
      
      // Check if puzzle is completed
      if (isPuzzleComplete(newGrid)) {
        handleGameComplete()
      }
      
      setHighlightNumber(number)
    }
  }

  // Check if move is valid
  const isValidMove = (row, col, number, grid) => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === number) {
        return false
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === number) {
        return false
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === number) {
          return false
        }
      }
    }
    
    return true
  }

  // Check if puzzle is complete
  const isPuzzleComplete = (grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          return false
        }
      }
    }
    return true
  }

  // Handle game completion
  const handleGameComplete = () => {
    setGameCompleted(true)
    
    // Calculate final score
    const timeBonus = Math.max(0, DIFFICULTY_LEVELS[difficulty].timeLimit - timeElapsed)
    const difficultyMultiplier = getDifficultyMultiplier()
    const mistakePenalty = mistakes * 50
    const hintPenalty = hintsUsed * 25
    
    const finalScore = Math.floor(
      (1000 * difficultyMultiplier) + 
      (timeBonus * 2) - 
      mistakePenalty - 
      hintPenalty
    )
    
    setScore(Math.max(0, finalScore))
    
    // Update statistics
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesCompleted: prev.gamesCompleted + 1,
      bestTime: Math.min(prev.bestTime, timeElapsed),
      averageTime: (prev.averageTime * prev.gamesCompleted + timeElapsed) / (prev.gamesCompleted + 1),
      totalHints: prev.totalHints + hintsUsed,
      totalMistakes: prev.totalMistakes + mistakes
    }))
    
    showToast(`تهانينا! أكملت السودوكو! النتيجة: ${finalScore}`, 'success')
  }

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true)
    
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalMistakes: prev.totalMistakes + mistakes
    }))
    
    showToast('انتهت اللعبة! تجاوزت الحد الأقصى للأخطاء', 'error')
  }

  // Get difficulty multiplier
  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'EASY': return 1
      case 'MEDIUM': return 1.5
      case 'HARD': return 2
      case 'EXPERT': return 3
      case 'MASTER': return 5
      default: return 1
    }
  }

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || !selectedCell || !solution) return
    
    const { row, col } = selectedCell
    
    // Don't give hint for original clues
    if (originalGrid[row][col] !== 0) return
    
    const correctNumber = solution[row][col]
    
    const newGrid = [...userGrid]
    newGrid[row][col] = correctNumber
    setUserGrid(newGrid)
    
    setHintsUsed(prev => prev + 1)
    setScore(prev => Math.max(0, prev - 50))
    
    // Clear notes for this cell
    const noteKey = `${row}-${col}`
    setNotes(prev => {
      const newNotes = { ...prev }
      delete newNotes[noteKey]
      return newNotes
    })
    
    showToast('استخدمت تلميحاً! -50 نقطة', 'info')
    
    // Check if puzzle is completed
    if (isPuzzleComplete(newGrid)) {
      handleGameComplete()
    }
  }

  // Clear cell
  const clearCell = () => {
    if (!selectedCell || gameCompleted || gameOver) return
    
    const { row, col } = selectedCell
    
    // Don't allow clearing original clues
    if (originalGrid[row][col] !== 0) return
    
    const newGrid = [...userGrid]
    newGrid[row][col] = 0
    setUserGrid(newGrid)
    
    setHighlightNumber(null)
  }

  // Check errors
  const checkAllErrors = () => {
    let errorCount = 0
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = userGrid[row][col]
        if (value !== 0 && !isValidMove(row, col, value, userGrid)) {
          errorCount++
        }
      }
    }
    
    if (errorCount > 0) {
      showToast(`تم العثور على ${errorCount} خطأ`, 'error')
    } else {
      showToast(`تم العثور على ${errorCount} خطأ`, 'success')
    }
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get cell class
  const getCellClass = (row, col) => {
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col
    const isOriginal = originalGrid[row][col] !== 0
    const isHighlighted = highlightNumber && userGrid[row][col] === highlightNumber
    const isInSameRow = selectedCell && selectedCell.row === row
    const isInSameCol = selectedCell && selectedCell.col === col
    const isInSameBox = selectedCell && 
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3)
    
    let classes = 'w-12 h-12 border border-gray-400 flex items-center justify-center text-lg font-bold cursor-pointer transition-all '
    
    // Box borders
    if (row % 3 === 0) classes += 'border-t-2 border-t-gray-800 '
    if (col % 3 === 0) classes += 'border-l-2 border-l-gray-800 '
    if (row === 8) classes += 'border-b-2 border-b-gray-800 '
    if (col === 8) classes += 'border-r-2 border-r-gray-800 '
    
    if (isSelected) {
      classes += 'bg-blue-200 text-blue-900 '
    } else if (isHighlighted) {
      classes += 'bg-blue-100 text-blue-800 '
    } else if (isInSameRow || isInSameCol || isInSameBox) {
      classes += 'bg-gray-100 '
    } else {
      classes += 'bg-white hover:bg-gray-50 '
    }
    
    if (isOriginal) {
      classes += 'text-gray-900 font-black '
    } else {
      classes += 'text-blue-600 '
    }
    
    // Error highlighting
    if (showErrors && userGrid[row][col] !== 0 && !isValidMove(row, col, userGrid[row][col], userGrid)) {
      classes += 'bg-red-100 text-red-800 '
    }
    
    return classes
  }

  // Get cell notes
  const getCellNotes = (row, col) => {
    const noteKey = `${row}-${col}`
    return notes[noteKey] || new Set()
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid3X3 className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب السودوكو</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سودوكو متقدم</h1>
            <p className="text-gray-600">تحدى عقلك مع ألغاز الأرقام</p>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {showErrors ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setGameStarted(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">إعدادات اللعبة</h2>
                <p className="text-gray-600">اختر مستوى الصعوبة ونوع السودوكو</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    مستوى الصعوبة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          difficulty === key
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-semibold">{level.name}</div>
                        <div className="text-sm text-gray-600">
                          {level.clues} أدلة - {Math.floor(level.timeLimit / 60)} دقيقة
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    نوع السودوكو
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(SUDOKU_VARIANTS).map(([key, variant]) => (
                      <option key={key} value={key}>
                        {variant.name} - {variant.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoCheckErrors}
                      onChange={(e) => setAutoCheckErrors(e.target.checked)}
                      className="mr-2"
                    />
                    فحص الأخطاء تلقائياً
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showErrors}
                      onChange={(e) => setShowErrors(e.target.checked)}
                      className="mr-2"
                    />
                    إظهار الأخطاء
                  </label>
                </div>
                
                <button
                  onClick={initializeGame}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  ابدأ اللعب
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Game Stats */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Trophy className="h-6 w-6" />
                    <span className="text-xl font-bold">{score}</span>
                  </div>
                  <p className="text-blue-100 text-sm">النقاط</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Clock className="h-6 w-6" />
                    <span className="text-xl font-bold">{formatTime(timeElapsed)}</span>
                  </div>
                  <p className="text-green-100 text-sm">الوقت</p>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <XCircle className="h-6 w-6" />
                    <span className="text-xl font-bold">{mistakes}/{maxMistakes}</span>
                  </div>
                  <p className="text-red-100 text-sm">الأخطاء</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Lightbulb className="h-6 w-6" />
                    <span className="text-xl font-bold">{maxHints - hintsUsed}</span>
                  </div>
                  <p className="text-yellow-100 text-sm">تلميحات</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Star className="h-6 w-6" />
                    <span className="text-xl font-bold">{DIFFICULTY_LEVELS[difficulty].name}</span>
                  </div>
                  <p className="text-purple-100 text-sm">الصعوبة</p>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Target className="h-6 w-6" />
                    <span className="text-xl font-bold">
                      {Math.round(((81 - userGrid.flat().filter(cell => cell === 0).length) / 81) * 100)}%
                    </span>
                  </div>
                  <p className="text-indigo-100 text-sm">التقدم</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Grid3X3 className="h-6 w-6" />
                    <span className="text-xl font-bold">{SUDOKU_VARIANTS[variant].name}</span>
                  </div>
                  <p className="text-gray-100 text-sm">النوع</p>
                </div>
              </div>
            </div>

            {/* Sudoku Grid */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">شبكة السودوكو</h3>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                      {isPaused ? 'استئناف' : 'إيقاف'}
                    </button>
                    
                    <button
                      onClick={useHint}
                      disabled={hintsUsed >= maxHints || !selectedCell}
                      className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      تلميح
                    </button>
                    
                    <button
                      onClick={clearCell}
                      disabled={!selectedCell}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Eraser className="h-4 w-4 mr-1" />
                      مسح
                    </button>
                  </div>
                </div>
                
                {userGrid.length > 0 && (
                  <div className="grid grid-cols-9 gap-0 max-w-md mx-auto border-2 border-gray-800">
                    {userGrid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const cellNotes = getCellNotes(rowIndex, colIndex)
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={getCellClass(rowIndex, colIndex)}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                          >
                            {cell !== 0 ? (
                              cell
                            ) : cellNotes.size > 0 ? (
                              <div className="grid grid-cols-3 gap-0 text-xs text-gray-500 w-full h-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                  <div key={num} className="flex items-center justify-center">
                                    {cellNotes.has(num) ? num : ''}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
                
                {selectedCell && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-center">
                      <p className="text-blue-800 font-semibold mb-2">
                        الخلية المحددة: صف {selectedCell.row + 1}, عمود {selectedCell.col + 1}
                      </p>
                      <p className="text-blue-600 text-sm">
                        {originalGrid[selectedCell.row][selectedCell.col] !== 0 
                          ? 'هذه خلية أصلية لا يمكن تغييرها'
                          : showNotes 
                          ? 'وضع الملاحظات مفعل - انقر على رقم لإضافة/إزالة ملاحظة'
                          : 'انقر على رقم لوضعه في هذه الخلية'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Number Pad & Controls */}
            <div className="space-y-6">
              {/* Number Pad */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  لوحة الأرقام
                </h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                    <button
                      key={number}
                      onClick={() => handleNumberInput(number)}
                      className={`w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all ${
                        selectedNumber === number
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleNumberInput(0)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    مسح
                  </button>
                  
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                      showNotes
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showNotes ? 'إيقاف الملاحظات' : 'تفعيل الملاحظات'}
                  </button>
                </div>
              </div>
              
              {/* Game Controls */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">أدوات اللعبة</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={checkAllErrors}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    فحص الأخطاء
                  </button>
                  
                  <button
                    onClick={() => setAutoCheckErrors(!autoCheckErrors)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                      autoCheckErrors
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                    }`}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {autoCheckErrors ? 'إيقاف الفحص التلقائي' : 'تفعيل الفحص التلقائي'}
                  </button>
                  
                  <button
                    onClick={() => setGameStarted(false)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    لعبة جديدة
                  </button>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الألعاب المكتملة:</span>
                    <span className="font-bold text-green-600">{stats.gamesCompleted}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الألعاب:</span>
                    <span className="font-bold text-blue-600">{stats.gamesPlayed}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">أفضل وقت:</span>
                    <span className="font-bold text-purple-600">
                      {stats.bestTime === Infinity ? '--' : formatTime(stats.bestTime)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل النجاح:</span>
                    <span className="font-bold text-yellow-600">
                      {stats.gamesPlayed > 0 ? Math.round((stats.gamesCompleted / stats.gamesPlayed) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
              <p className="text-gray-600 mb-6">لقد أكملت السودوكو بنجاح</p>
              
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
                  <span className="text-gray-600">الأخطاء:</span>
                  <span className="font-bold text-red-600">{mistakes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التلميحات:</span>
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

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">انتهت اللعبة</h2>
              <p className="text-gray-600 mb-6">تجاوزت الحد الأقصى للأخطاء المسموحة</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت المستغرق:</span>
                  <span className="font-bold text-purple-600">{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الأخطاء:</span>
                  <span className="font-bold text-red-600">{mistakes}/{maxMistakes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التقدم:</span>
                  <span className="font-bold text-blue-600">
                    {Math.round(((81 - userGrid.flat().filter(cell => cell === 0).length) / 81) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setGameStarted(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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

export default SudokuGame