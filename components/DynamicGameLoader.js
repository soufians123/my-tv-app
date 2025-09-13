import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

// Dynamic loading components with loading states
const GameSystem = dynamic(
  () => import('./games/GameSystem').then(mod => ({ default: mod.GameSystemProvider })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="mr-2 text-gray-600">جاري تحميل نظام الألعاب...</span>
      </div>
    ),
    ssr: false
  }
)

const PlayerStats = dynamic(
  () => import('./games/GameSystem').then(mod => ({ default: mod.PlayerStats })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
    ),
    ssr: false
  }
)

const AchievementsPanel = dynamic(
  () => import('./games/GameSystem').then(mod => ({ default: mod.AchievementsPanel })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
    ),
    ssr: false
  }
)

const Leaderboard = dynamic(
  () => import('./games/GameSystem').then(mod => ({ default: mod.Leaderboard })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
    ),
    ssr: false
  }
)

const GameStats = dynamic(
  () => import('./games/GameSystem').then(mod => ({ default: mod.GameStats })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>
    ),
    ssr: false
  }
)

export {
  GameSystem,
  PlayerStats,
  AchievementsPanel,
  Leaderboard,
  GameStats
}