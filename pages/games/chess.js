import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { ChevronLeft, RotateCcw, Flag, Trophy, Clock, User, Bot } from 'lucide-react'

// Chess piece definitions
const PIECES = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn'
}

const COLORS = {
  WHITE: 'white',
  BLACK: 'black'
}

// Initial chess board setup
const initialBoard = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
]

// Piece values for AI evaluation
const PIECE_VALUES = {
  '♔': 0, '♚': 0,     // Kings
  '♕': 9, '♛': 9,     // Queens
  '♖': 5, '♜': 5,     // Rooks
  '♗': 3, '♝': 3,     // Bishops
  '♘': 3, '♞': 3,     // Knights
  '♙': 1, '♟': 1      // Pawns
}

// Position evaluation tables for better AI
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
]

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
]

const ChessGame = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [board, setBoard] = useState(initialBoard)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(COLORS.WHITE)
  const [gameStatus, setGameStatus] = useState('playing') // playing, check, checkmate, stalemate
  const [moveHistory, setMoveHistory] = useState([])
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] })
  const [gameTime, setGameTime] = useState({ white: 600, black: 600 }) // 10 minutes each
  const [isThinking, setIsThinking] = useState(false)
  const [difficulty, setDifficulty] = useState('medium') // easy, medium, hard, expert
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [proMode, setProMode] = useState(false)

  // Refs for timers cleanup
  const gameTimerRef = useRef(null)
  const aiMoveTimeoutRef = useRef(null)

  // Timer effect with proper cleanup
  useEffect(() => {
    // Clear existing timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }

    if (!gameStarted || gameStatus !== 'playing') return
    
    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => {
        const newTime = { ...prev }
        if (currentPlayer === COLORS.WHITE) {
          newTime.white = Math.max(0, newTime.white - 1)
          if (newTime.white === 0) {
            setGameStatus('timeout')
            showToast('انتهى الوقت! فاز الذكاء الاصطناعي', 'error')
          }
        } else {
          newTime.black = Math.max(0, newTime.black - 1)
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
        gameTimerRef.current = null
      }
    }
  }, [currentPlayer, gameStarted, gameStatus, showToast])

  // AI move effect with timeout cleanup
  useEffect(() => {
    // Clear existing AI timeout
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }

    if (currentPlayer === COLORS.BLACK && gameStatus === 'playing' && gameStarted) {
      // Add small delay for AI move to make it feel more natural
      aiMoveTimeoutRef.current = setTimeout(() => {
        makeAIMove()
      }, 500)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
      }
    }
  }, [currentPlayer, gameStatus, gameStarted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
      }
    }
  }, [])

  const isWhitePiece = (piece) => {
    return piece && '♔♕♖♗♘♙'.includes(piece)
  }

  const isBlackPiece = (piece) => {
    return piece && '♚♛♜♝♞♟'.includes(piece)
  }

  const getPieceColor = (piece) => {
    if (isWhitePiece(piece)) return COLORS.WHITE
    if (isBlackPiece(piece)) return COLORS.BLACK
    return null
  }

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol]
    const targetPiece = board[toRow][toCol]
    
    // Can't capture own pieces
    if (targetPiece && getPieceColor(piece) === getPieceColor(targetPiece)) {
      return false
    }

    // Basic piece movement validation
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    
    switch (piece) {
      case '♙': // White pawn
        if (fromCol === toCol) {
          if (targetPiece) return false
          if (fromRow === 6 && toRow === 4 && !board[5][fromCol]) return true
          return fromRow - toRow === 1
        }
        return rowDiff === 1 && colDiff === 1 && targetPiece && isBlackPiece(targetPiece)
      
      case '♟': // Black pawn
        if (fromCol === toCol) {
          if (targetPiece) return false
          if (fromRow === 1 && toRow === 3 && !board[2][fromCol]) return true
          return toRow - fromRow === 1
        }
        return rowDiff === 1 && colDiff === 1 && targetPiece && isWhitePiece(targetPiece)
      
      case '♖': case '♜': // Rooks
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false
      
      case '♗': case '♝': // Bishops
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false
      
      case '♕': case '♛': // Queens
        if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false
      
      case '♘': case '♞': // Knights
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      
      case '♔': case '♚': // Kings
        return rowDiff <= 1 && colDiff <= 1
      
      default:
        return false
    }
  }

  const isPathClear = (fromRow, fromCol, toRow, toCol) => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0
    
    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return false
      }
      currentRow += rowStep
      currentCol += colStep
    }
    
    return true
  }

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row])
    const piece = newBoard[fromRow][fromCol]
    const capturedPiece = newBoard[toRow][toCol]
    
    newBoard[toRow][toCol] = piece
    newBoard[fromRow][fromCol] = null
    
    // Handle captured pieces
    if (capturedPiece) {
      const captureColor = isWhitePiece(capturedPiece) ? 'white' : 'black'
      setCapturedPieces(prev => ({
        ...prev,
        [captureColor]: [...prev[captureColor], capturedPiece]
      }))
      
      // Add score for captures
      if (currentPlayer === COLORS.WHITE) {
        setScore(prev => prev + PIECE_VALUES[capturedPiece] * 10)
      }
    }
    
    setBoard(newBoard)
    setMoveHistory(prev => [...prev, { from: [fromRow, fromCol], to: [toRow, toCol], piece, captured: capturedPiece }])
    setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE)
    
    // Check for game end conditions
    checkGameStatus(newBoard, currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE)
  }

  const checkGameStatus = (board, nextPlayer) => {
    // Simplified game status check - in a real implementation, you'd check for check, checkmate, etc.
    // For now, we'll just continue the game
  }

  const handleSquareClick = (row, col) => {
    if (currentPlayer !== COLORS.WHITE || gameStatus !== 'playing' || !gameStarted) return
    
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare
      
      if (selectedRow === row && selectedCol === col) {
        setSelectedSquare(null)
        return
      }
      
      if (isValidMove(selectedRow, selectedCol, row, col)) {
        makeMove(selectedRow, selectedCol, row, col)
        setSelectedSquare(null)
      } else {
        // Select new piece if it belongs to current player
        const piece = board[row][col]
        if (piece && getPieceColor(piece) === currentPlayer) {
          setSelectedSquare([row, col])
        } else {
          setSelectedSquare(null)
        }
      }
    } else {
      // Select piece if it belongs to current player
      const piece = board[row][col]
      if (piece && getPieceColor(piece) === currentPlayer) {
        setSelectedSquare([row, col])
      }
    }
  }

  const evaluateBoard = (board) => {
    let score = 0
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (!piece) continue
        
        let pieceValue = PIECE_VALUES[piece] || 0
        
        // Add positional bonuses
        if (piece === '♙' || piece === '♟') {
          pieceValue += PAWN_TABLE[row][col] / 100
        } else if (piece === '♘' || piece === '♞') {
          pieceValue += KNIGHT_TABLE[row][col] / 100
        }
        
        if (isWhitePiece(piece)) {
          score -= pieceValue
        } else {
          score += pieceValue
        }
      }
    }
    
    return score
  }

  const getAllPossibleMoves = (board, color) => {
    const moves = []
    
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol]
        if (!piece || getPieceColor(piece) !== color) continue
        
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(fromRow, fromCol, toRow, toCol)) {
              moves.push({ from: [fromRow, fromCol], to: [toRow, toCol] })
            }
          }
        }
      }
    }
    
    return moves
  }

  const minimax = (board, depth, isMaximizing, alpha, beta) => {
    if (depth === 0) {
      return evaluateBoard(board)
    }
    
    const color = isMaximizing ? COLORS.BLACK : COLORS.WHITE
    const moves = getAllPossibleMoves(board, color)
    
    if (moves.length === 0) {
      return isMaximizing ? -1000 : 1000
    }
    
    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = board.map(row => [...row])
        const [fromRow, fromCol] = move.from
        const [toRow, toCol] = move.to
        
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
        newBoard[fromRow][fromCol] = null
        
        const evaluation = minimax(newBoard, depth - 1, false, alpha, beta)
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = board.map(row => [...row])
        const [fromRow, fromCol] = move.from
        const [toRow, toCol] = move.to
        
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
        newBoard[fromRow][fromCol] = null
        
        const evaluation = minimax(newBoard, depth - 1, true, alpha, beta)
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  const makeAIMove = async () => {
    setIsThinking(true)
    
    // Add thinking delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const moves = getAllPossibleMoves(board, COLORS.BLACK)
    if (moves.length === 0) {
      setGameStatus('checkmate')
      showToast('تهانينا! لقد فزت!', 'success')
      setScore(prev => prev + 1000)
      setIsThinking(false)
      return
    }
    
    let bestMove = moves[0]
    let bestScore = -Infinity
    
    const searchDepth =
      difficulty === 'easy' ? 2 :
      difficulty === 'medium' ? 3 :
      difficulty === 'hard' ? 4 :
      difficulty === 'expert' ? 5 : 6 // legend
    
    for (const move of moves) {
      const newBoard = board.map(row => [...row])
      const [fromRow, fromCol] = move.from
      const [toRow, toCol] = move.to
      
      newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
      newBoard[fromRow][fromCol] = null
      
      const score = minimax(newBoard, searchDepth - 1, false, -Infinity, Infinity)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    const [fromRow, fromCol] = bestMove.from
    const [toRow, toCol] = bestMove.to
    
    makeMove(fromRow, fromCol, toRow, toCol)
    setIsThinking(false)
  }

  const startGame = () => {
    setGameStarted(true)
    // في وضع المحترفين: وقت 5 دقائق لكل لاعب، وإلا 10 دقائق
    setGameTime({ white: proMode ? 300 : 600, black: proMode ? 300 : 600 })
    showToast('بدأت اللعبة! حظ سعيد!', 'success')
  }

  const resetGame = () => {
    setBoard(initialBoard)
    setSelectedSquare(null)
    setCurrentPlayer(COLORS.WHITE)
    setGameStatus('playing')
    setMoveHistory([])
    setCapturedPieces({ white: [], black: [] })
    setGameTime({ white: proMode ? 300 : 600, black: proMode ? 300 : 600 })
    setScore(0)
    setGameStarted(false)
    showToast('تم إعادة تعيين اللعبة', 'info')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب الشطرنج</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الشطرنج الذكي</h1>
            <p className="text-gray-600">تحدى الذكاء الاصطناعي في لعبة الشطرنج</p>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            {!gameStarted || !proMode ? (
              <button
                onClick={resetGame}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="إعادة تعيين"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Info Panel */}
          <div className="space-y-6">
            {/* Game Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">حالة اللعبة</h3>
              
              {!gameStarted ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">اختر مستوى الصعوبة وابدأ اللعب</p>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                    <option value="expert">خبير</option>
                    <option value="legend">أسطوري</option>
                  </select>
                  <label className="flex items-center justify-center gap-2 text-sm text-gray-700 mb-4 select-none">
                    <input type="checkbox" className="rounded" checked={proMode} onChange={(e)=>setProMode(e.target.checked)} />
                    تفعيل وضع واقعي محترف (5 دقائق لكل لاعب، لا إعادة أثناء اللعب)
                  </label>
                  <button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    ابدأ اللعبة
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الدور الحالي:</span>
                    <div className="flex items-center">
                      {currentPlayer === COLORS.WHITE ? (
                        <><User className="h-4 w-4 mr-1" /> أنت</>
                      ) : (
                        <><Bot className="h-4 w-4 mr-1" /> الذكاء الاصطناعي</>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">وقتك:</span>
                      <div className="flex items-center text-blue-600 font-mono">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(gameTime.white)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">وقت الذكاء الاصطناعي:</span>
                      <div className="flex items-center text-red-600 font-mono">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(gameTime.black)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">النقاط:</span>
                    <span className="text-green-600 font-bold">{score}</span>
                  </div>
                  
                  {isThinking && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        الذكاء الاصطناعي يفكر...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Captured Pieces */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">القطع المأسورة</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">قطعك المأسورة:</p>
                  <div className="flex flex-wrap gap-1">
                    {capturedPieces.white.map((piece, idx) => (
                      <span key={idx} className="text-2xl">{piece}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">قطع الذكاء الاصطناعي المأسورة:</p>
                  <div className="flex flex-wrap gap-1">
                    {capturedPieces.black.map((piece, idx) => (
                      <span key={idx} className="text-2xl">{piece}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="aspect-square max-w-lg mx-auto">
                <div className="grid grid-cols-8 gap-0 border-2 border-gray-800 rounded-lg overflow-hidden">
                  {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0
                      const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-200
                            ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                            ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                            hover:brightness-110
                          `}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                        >
                          {piece && (
                            <span className="select-none transform transition-transform hover:scale-110">
                              {piece}
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تاريخ الحركات</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {moveHistory.map((move, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    الحركة {index + 1}: {move.piece}
                  </div>
                  <div className="text-gray-600">
                    من ({move.from[0]}, {move.from[1]}) إلى ({move.to[0]}, {move.to[1]})
                    {move.captured && ` - أسر ${move.captured}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ChessGame