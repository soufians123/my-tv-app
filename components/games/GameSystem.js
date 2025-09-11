import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Trophy, Star, Crown, Medal, Target, 
  TrendingUp, Award, Zap, Fire,
  Users, Calendar, Clock, BarChart3
} from 'lucide-react';

// Game System Context
const GameSystemContext = createContext();

// Achievement Types
const ACHIEVEMENT_TYPES = {
  SCORE: 'score',
  GAMES_PLAYED: 'games_played',
  WIN_STREAK: 'win_streak',
  TIME_BASED: 'time_based',
  SPECIAL: 'special'
};

// Achievement Definitions
const ACHIEVEMENTS = {
  // Score-based achievements
  FIRST_SCORE: {
    id: 'first_score',
    name: 'النقطة الأولى',
    description: 'احصل على أول نقطة في أي لعبة',
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 1,
    points: 10,
    icon: Star,
    rarity: 'common'
  },
  HUNDRED_POINTS: {
    id: 'hundred_points',
    name: 'المئة الأولى',
    description: 'احصل على 100 نقطة في لعبة واحدة',
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 100,
    points: 50,
    icon: Target,
    rarity: 'uncommon'
  },
  THOUSAND_POINTS: {
    id: 'thousand_points',
    name: 'الألف الذهبية',
    description: 'احصل على 1000 نقطة في لعبة واحدة',
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 1000,
    points: 200,
    icon: Crown,
    rarity: 'rare'
  },
  MASTER_SCORER: {
    id: 'master_scorer',
    name: 'سيد النقاط',
    description: 'احصل على 10000 نقطة إجمالية',
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 10000,
    points: 500,
    icon: Trophy,
    rarity: 'legendary'
  },

  // Games played achievements
  FIRST_GAME: {
    id: 'first_game',
    name: 'اللعبة الأولى',
    description: 'العب أول لعبة',
    type: ACHIEVEMENT_TYPES.GAMES_PLAYED,
    requirement: 1,
    points: 5,
    icon: Star,
    rarity: 'common'
  },
  DEDICATED_PLAYER: {
    id: 'dedicated_player',
    name: 'لاعب مخلص',
    description: 'العب 50 لعبة',
    type: ACHIEVEMENT_TYPES.GAMES_PLAYED,
    requirement: 50,
    points: 100,
    icon: Medal,
    rarity: 'uncommon'
  },
  GAME_MASTER: {
    id: 'game_master',
    name: 'سيد الألعاب',
    description: 'العب 200 لعبة',
    type: ACHIEVEMENT_TYPES.GAMES_PLAYED,
    requirement: 200,
    points: 300,
    icon: Crown,
    rarity: 'rare'
  },

  // Win streak achievements
  WINNING_STREAK_5: {
    id: 'winning_streak_5',
    name: 'سلسلة انتصارات',
    description: 'اربح 5 ألعاب متتالية',
    type: ACHIEVEMENT_TYPES.WIN_STREAK,
    requirement: 5,
    points: 150,
    icon: Fire,
    rarity: 'uncommon'
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'لا يُقهر',
    description: 'اربح 15 لعبة متتالية',
    type: ACHIEVEMENT_TYPES.WIN_STREAK,
    requirement: 15,
    points: 500,
    icon: Trophy,
    rarity: 'legendary'
  },

  // Time-based achievements
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'شيطان السرعة',
    description: 'أكمل لعبة في أقل من دقيقة',
    type: ACHIEVEMENT_TYPES.TIME_BASED,
    requirement: 60,
    points: 100,
    icon: Zap,
    rarity: 'rare'
  },
  MARATHON_PLAYER: {
    id: 'marathon_player',
    name: 'لاعب الماراثون',
    description: 'العب لأكثر من ساعة متواصلة',
    type: ACHIEVEMENT_TYPES.TIME_BASED,
    requirement: 3600,
    points: 200,
    icon: Clock,
    rarity: 'rare'
  },

  // Special achievements
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'الكمالي',
    description: 'احصل على نتيجة مثالية في أي لعبة',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    requirement: 1,
    points: 300,
    icon: Star,
    rarity: 'epic'
  },
  MULTI_GAME_MASTER: {
    id: 'multi_game_master',
    name: 'سيد الألعاب المتعددة',
    description: 'العب جميع أنواع الألعاب المتاحة',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    requirement: 8,
    points: 400,
    icon: Crown,
    rarity: 'epic'
  }
};

// Rank System
const RANKS = [
  { name: 'مبتدئ', minPoints: 0, maxPoints: 99, color: 'gray', icon: Star },
  { name: 'لاعب', minPoints: 100, maxPoints: 499, color: 'blue', icon: Target },
  { name: 'ماهر', minPoints: 500, maxPoints: 1499, color: 'green', icon: Medal },
  { name: 'خبير', minPoints: 1500, maxPoints: 3999, color: 'purple', icon: Award },
  { name: 'محترف', minPoints: 4000, maxPoints: 9999, color: 'orange', icon: Trophy },
  { name: 'أسطورة', minPoints: 10000, maxPoints: Infinity, color: 'yellow', icon: Crown }
];

// Game System Provider
export const GameSystemProvider = ({ children }) => {
  const [playerStats, setPlayerStats] = useState({
    totalScore: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPlayTime: 0,
    achievements: [],
    gameStats: {},
    lastPlayed: null,
    rank: RANKS[0]
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);

  // Load player stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('gameSystemStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setPlayerStats({
        ...stats,
        rank: calculateRank(stats.totalScore)
      });
    }

    const savedLeaderboard = localStorage.getItem('gameSystemLeaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('gameSystemStats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Calculate player rank
  const calculateRank = (totalScore) => {
    return RANKS.find(rank => totalScore >= rank.minPoints && totalScore <= rank.maxPoints) || RANKS[0];
  };

  // Add score and update stats
  const addScore = (gameType, score, gameWon = false, gameTime = 0, isPerfect = false) => {
    setPlayerStats(prev => {
      const newStats = { ...prev };
      
      // Update basic stats
      newStats.totalScore += score;
      newStats.gamesPlayed += 1;
      newStats.totalPlayTime += gameTime;
      newStats.lastPlayed = new Date().toISOString();
      
      // Update game-specific stats
      if (!newStats.gameStats[gameType]) {
        newStats.gameStats[gameType] = {
          gamesPlayed: 0,
          gamesWon: 0,
          totalScore: 0,
          bestScore: 0,
          totalTime: 0
        };
      }
      
      newStats.gameStats[gameType].gamesPlayed += 1;
      newStats.gameStats[gameType].totalScore += score;
      newStats.gameStats[gameType].totalTime += gameTime;
      
      if (score > newStats.gameStats[gameType].bestScore) {
        newStats.gameStats[gameType].bestScore = score;
      }
      
      // Update win stats and streaks
      if (gameWon) {
        newStats.gamesWon += 1;
        newStats.gameStats[gameType].gamesWon += 1;
        newStats.currentStreak += 1;
        
        if (newStats.currentStreak > newStats.bestStreak) {
          newStats.bestStreak = newStats.currentStreak;
        }
      } else {
        newStats.currentStreak = 0;
      }
      
      // Update rank
      newStats.rank = calculateRank(newStats.totalScore);
      
      // Check for new achievements
      checkAchievements(newStats, { gameType, score, gameWon, gameTime, isPerfect });
      
      return newStats;
    });
    
    // Update leaderboard
    updateLeaderboard();
  };

  // Check for new achievements
  const checkAchievements = (stats, gameData) => {
    const newAchievements = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      // Skip if already earned
      if (stats.achievements.includes(achievement.id)) return;
      
      let earned = false;
      
      switch (achievement.type) {
        case ACHIEVEMENT_TYPES.SCORE:
          if (achievement.id === 'master_scorer') {
            earned = stats.totalScore >= achievement.requirement;
          } else {
            earned = gameData.score >= achievement.requirement;
          }
          break;
          
        case ACHIEVEMENT_TYPES.GAMES_PLAYED:
          earned = stats.gamesPlayed >= achievement.requirement;
          break;
          
        case ACHIEVEMENT_TYPES.WIN_STREAK:
          earned = stats.currentStreak >= achievement.requirement;
          break;
          
        case ACHIEVEMENT_TYPES.TIME_BASED:
          if (achievement.id === 'speed_demon') {
            earned = gameData.gameTime <= achievement.requirement;
          } else if (achievement.id === 'marathon_player') {
            earned = stats.totalPlayTime >= achievement.requirement;
          }
          break;
          
        case ACHIEVEMENT_TYPES.SPECIAL:
          if (achievement.id === 'perfectionist') {
            earned = gameData.isPerfect;
          } else if (achievement.id === 'multi_game_master') {
            earned = Object.keys(stats.gameStats).length >= achievement.requirement;
          }
          break;
      }
      
      if (earned) {
        stats.achievements.push(achievement.id);
        stats.totalScore += achievement.points;
        newAchievements.push(achievement);
      }
    });
    
    // Show achievement notifications
    if (newAchievements.length > 0) {
      setRecentAchievements(prev => [...newAchievements, ...prev.slice(0, 4)]);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setRecentAchievements(prev => prev.filter(a => !newAchievements.includes(a)));
      }, 5000);
    }
  };

  // Update leaderboard
  const updateLeaderboard = () => {
    // Simulate other players for demo
    const demoPlayers = [
      { name: 'أحمد محمد', totalScore: 8500, gamesPlayed: 150, rank: calculateRank(8500) },
      { name: 'فاطمة علي', totalScore: 7200, gamesPlayed: 120, rank: calculateRank(7200) },
      { name: 'محمد حسن', totalScore: 6800, gamesPlayed: 110, rank: calculateRank(6800) },
      { name: 'سارة أحمد', totalScore: 5900, gamesPlayed: 95, rank: calculateRank(5900) },
      { name: 'علي محمود', totalScore: 5200, gamesPlayed: 88, rank: calculateRank(5200) }
    ];
    
    const currentPlayer = {
      name: 'أنت',
      totalScore: playerStats.totalScore,
      gamesPlayed: playerStats.gamesPlayed,
      rank: playerStats.rank,
      isCurrentPlayer: true
    };
    
    const allPlayers = [...demoPlayers, currentPlayer]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, index) => ({ ...player, position: index + 1 }));
    
    setLeaderboard(allPlayers);
    localStorage.setItem('gameSystemLeaderboard', JSON.stringify(allPlayers));
  };

  // Get achievement progress
  const getAchievementProgress = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return 0;
    
    if (playerStats.achievements.includes(achievementId)) return 100;
    
    let current = 0;
    
    switch (achievement.type) {
      case ACHIEVEMENT_TYPES.SCORE:
        current = achievement.id === 'master_scorer' ? playerStats.totalScore : 0;
        break;
      case ACHIEVEMENT_TYPES.GAMES_PLAYED:
        current = playerStats.gamesPlayed;
        break;
      case ACHIEVEMENT_TYPES.WIN_STREAK:
        current = playerStats.bestStreak;
        break;
      default:
        current = 0;
    }
    
    return Math.min(100, (current / achievement.requirement) * 100);
  };

  const value = {
    playerStats,
    leaderboard,
    recentAchievements,
    addScore,
    getAchievementProgress,
    ACHIEVEMENTS,
    RANKS
  };

  return (
    <GameSystemContext.Provider value={value}>
      {children}
      <AchievementNotifications />
    </GameSystemContext.Provider>
  );
};

// Achievement Notifications Component
const AchievementNotifications = () => {
  const { recentAchievements } = useContext(GameSystemContext);
  
  return (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      {recentAchievements.map((achievement, index) => {
        const IconComponent = achievement.icon || Star;
        return (
          <div 
            key={`${achievement.id}-${index}`}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-slide-in-left"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <IconComponent className="w-8 h-8" />
              <div>
                <h4 className="font-bold">إنجاز جديد!</h4>
                <p className="text-sm">{achievement.name}</p>
                <p className="text-xs opacity-90">+{achievement.points} نقطة</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Player Stats Component
export const PlayerStats = () => {
  const { playerStats, RANKS } = useContext(GameSystemContext);
  const currentRank = playerStats.rank;
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  
  const rankProgress = nextRank ? 
    ((playerStats.totalScore - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100 : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <span>إحصائياتي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rank Display */}
        <div className="text-center">
          <div className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-full bg-${currentRank.color}-100 text-${currentRank.color}-800`}>
            <currentRank.icon className="w-5 h-5" />
            <span className="font-bold">{currentRank.name}</span>
          </div>
          {nextRank && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">
                التقدم للرتبة التالية: {nextRank.name}
              </p>
              <Progress value={rankProgress} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">
                {playerStats.totalScore} / {nextRank.minPoints} نقطة
              </p>
            </div>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/30 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
              <p className="text-sm font-bold text-blue-600">{playerStats.totalScore.toLocaleString()}</p>
            </div>
            <p className="text-xs text-gray-600">إجمالي النقاط</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <p className="text-sm font-bold text-green-600">{playerStats.gamesPlayed}</p>
            </div>
            <p className="text-xs text-gray-600">الألعاب المُلعبة</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse"></div>
              <p className="text-sm font-bold text-purple-600">{playerStats.achievements.length}</p>
            </div>
            <p className="text-xs text-gray-600">الإنجازات</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/30 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
              <p className="text-sm font-bold text-orange-600">{playerStats.bestStreak}</p>
            </div>
            <p className="text-xs text-gray-600">أفضل سلسلة</p>
          </div>
        </div>
        
        {/* Win Rate */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/30 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">معدل الفوز</span>
            </div>
            <span className="text-sm font-bold text-gray-800 bg-white px-2 py-1 rounded-lg shadow-sm">
              {playerStats.gamesPlayed > 0 ? 
                Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100) : 0}%
            </span>
          </div>
          <Progress 
            value={playerStats.gamesPlayed > 0 ? (playerStats.gamesWon / playerStats.gamesPlayed) * 100 : 0} 
            className="w-full h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Achievements Component
export const AchievementsPanel = () => {
  const { playerStats, getAchievementProgress, ACHIEVEMENTS } = useContext(GameSystemContext);
  
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'gray';
      case 'uncommon': return 'green';
      case 'rare': return 'blue';
      case 'epic': return 'purple';
      case 'legendary': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Award className="w-6 h-6 text-purple-600" />
          <span>الإنجازات</span>
          <Badge variant="secondary">
            {playerStats.achievements.length} / {Object.keys(ACHIEVEMENTS).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {Object.values(ACHIEVEMENTS).map(achievement => {
            const isEarned = playerStats.achievements.includes(achievement.id);
            const progress = getAchievementProgress(achievement.id);
            const IconComponent = achievement.icon || Star;
            const rarityColor = getRarityColor(achievement.rarity);
            
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isEarned 
                    ? `border-${rarityColor}-300 bg-${rarityColor}-50` 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-full ${
                    isEarned ? `bg-${rarityColor}-200` : 'bg-gray-200'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isEarned ? `text-${rarityColor}-600` : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${
                        isEarned ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge 
                          variant={isEarned ? "default" : "secondary"}
                          className={`text-xs bg-${rarityColor}-100 text-${rarityColor}-800`}
                        >
                          {achievement.rarity}
                        </Badge>
                        {isEarned && (
                          <Badge className="bg-green-100 text-green-800">
                            +{achievement.points}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${
                      isEarned ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    {!isEarned && progress > 0 && (
                      <div>
                        <Progress value={progress} className="w-full h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          التقدم: {Math.round(progress)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Leaderboard Component
export const Leaderboard = () => {
  const { leaderboard } = useContext(GameSystemContext);
  
  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <span>المتصدرون</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((player, index) => {
            const RankIcon = player.rank.icon;
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.isCurrentPlayer 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getPositionIcon(player.position)}
                  <div>
                    <p className={`font-semibold ${
                      player.isCurrentPlayer ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {player.name}
                    </p>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RankIcon className={`w-4 h-4 text-${player.rank.color}-600`} />
                      <span className="text-sm text-gray-600">{player.rank.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{player.totalScore.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{player.gamesPlayed} لعبة</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Game Stats Component
export const GameStats = () => {
  const { playerStats } = useContext(GameSystemContext);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>إحصائيات الألعاب</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(playerStats.gameStats).map(([gameType, stats]) => {
            const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0;
            const avgScore = stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0;
            
            return (
              <div key={gameType} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3 capitalize">{gameType}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">الألعاب المُلعبة</p>
                    <p className="font-semibold">{stats.gamesPlayed}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">معدل الفوز</p>
                    <p className="font-semibold">{Math.round(winRate)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">أفضل نتيجة</p>
                    <p className="font-semibold">{stats.bestScore.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">متوسط النقاط</p>
                    <p className="font-semibold">{Math.round(avgScore).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {Object.keys(playerStats.gameStats).length === 0 && (
            <p className="text-gray-500 text-center py-8">لم تلعب أي ألعاب بعد</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Hook to use game system
export const useGameSystem = () => {
  const context = useContext(GameSystemContext);
  if (!context) {
    throw new Error('useGameSystem must be used within a GameSystemProvider');
  }
  return context;
};

export default GameSystemProvider;