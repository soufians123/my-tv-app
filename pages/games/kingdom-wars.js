import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ToastSystem'
import { 
  ChevronLeft, Sword, Shield, Crown, Coins, Hammer, 
  Users, MapPin, Trophy, Clock, Zap, Star, Target,
  Castle, Swords, Home, Factory, Wheat, Gem
} from 'lucide-react'

// Game constants
const RESOURCES = {
  GOLD: 'gold',
  FOOD: 'food',
  WOOD: 'wood',
  STONE: 'stone',
  IRON: 'iron'
}

const BUILDINGS = {
  CASTLE: { name: 'القلعة', icon: Castle, cost: { gold: 500, stone: 300, wood: 200 }, produces: 'defense' },
  FARM: { name: 'المزرعة', icon: Wheat, cost: { gold: 100, wood: 50 }, produces: 'food' },
  MINE: { name: 'المنجم', icon: Gem, cost: { gold: 200, stone: 100 }, produces: 'gold' },
  LUMBER_MILL: { name: 'مطحنة الخشب', icon: Factory, cost: { gold: 150, stone: 50 }, produces: 'wood' },
  QUARRY: { name: 'المحجر', icon: Home, cost: { gold: 180, wood: 80 }, produces: 'stone' },
  BARRACKS: { name: 'الثكنات', icon: Swords, cost: { gold: 300, stone: 150, wood: 100 }, produces: 'soldiers' }
}

const UNITS = {
  WARRIOR: { name: 'محارب', attack: 10, defense: 8, cost: { gold: 50, food: 20 }, upkeep: 5 },
  ARCHER: { name: 'رامي', attack: 12, defense: 5, cost: { gold: 60, wood: 30 }, upkeep: 4 },
  KNIGHT: { name: 'فارس', attack: 20, defense: 15, cost: { gold: 150, iron: 50, food: 30 }, upkeep: 10 },
  MAGE: { name: 'ساحر', attack: 25, defense: 10, cost: { gold: 200, gem: 20 }, upkeep: 15 }
}

const TECHNOLOGIES = {
  AGRICULTURE: { name: 'الزراعة المتقدمة', cost: { gold: 300, food: 100 }, effect: 'food_production_+50%' },
  MINING: { name: 'تقنيات التعدين', cost: { gold: 400, stone: 150 }, effect: 'gold_production_+50%' },
  WARFARE: { name: 'فنون الحرب', cost: { gold: 500, iron: 100 }, effect: 'unit_attack_+25%' },
  FORTIFICATION: { name: 'التحصين', cost: { gold: 600, stone: 200 }, effect: 'defense_+30%' },
  MAGIC: { name: 'السحر القديم', cost: { gold: 800, gem: 50 }, effect: 'mage_power_+50%' }
}

const KingdomWars = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  
  // Kingdom state
  const [kingdomName, setKingdomName] = useState('')
  const [population, setPopulation] = useState(100)
  const [happiness, setHappiness] = useState(75)
  
  // Resources
  const [resources, setResources] = useState({
    gold: 1000,
    food: 500,
    wood: 300,
    stone: 200,
    iron: 100
  })
  
  // Buildings
  const [buildings, setBuildings] = useState({
    castle: 1,
    farm: 2,
    mine: 1,
    lumber_mill: 1,
    quarry: 1,
    barracks: 1
  })
  
  // Army
  const [army, setArmy] = useState({
    warrior: 10,
    archer: 5,
    knight: 2,
    mage: 1
  })
  
  // Technologies
  const [technologies, setTechnologies] = useState([])
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [battleInProgress, setBattleInProgress] = useState(false)
  const [enemyKingdom, setEnemyKingdom] = useState(null)
  
  // Game timer
  useEffect(() => {
    if (!gameStarted) return
    
    const timer = setInterval(() => {
      setGameTime(prev => prev + 1)
      
      // Resource production every 5 seconds
      if (gameTime % 5 === 0) {
        produceResources()
      }
      
      // Random events every 30 seconds
      if (gameTime % 30 === 0) {
        triggerRandomEvent()
      }
      
      // Enemy attacks every 60 seconds
      if (gameTime % 60 === 0 && gameTime > 0) {
        generateEnemyAttack()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameTime])

  const produceResources = () => {
    setResources(prev => {
      const newResources = { ...prev }
      
      // Base production
      newResources.gold += buildings.mine * 10
      newResources.food += buildings.farm * 15
      newResources.wood += buildings.lumber_mill * 12
      newResources.stone += buildings.quarry * 8
      newResources.iron += buildings.mine * 2
      
      // Technology bonuses
      if (technologies.includes('AGRICULTURE')) {
        newResources.food += buildings.farm * 7 // +50% bonus
      }
      if (technologies.includes('MINING')) {
        newResources.gold += buildings.mine * 5 // +50% bonus
      }
      
      // Army upkeep
      const totalUpkeep = 
        army.warrior * UNITS.WARRIOR.upkeep +
        army.archer * UNITS.ARCHER.upkeep +
        army.knight * UNITS.KNIGHT.upkeep +
        army.mage * UNITS.MAGE.upkeep
      
      newResources.food = Math.max(0, newResources.food - totalUpkeep)
      
      return newResources
    })
  }

  const triggerRandomEvent = () => {
    const events = [
      {
        name: 'تجار مسافرون',
        description: 'وصل تجار مسافرون إلى مملكتك',
        effect: () => {
          setResources(prev => ({ ...prev, gold: prev.gold + 100 }))
          showToast('حصلت على 100 ذهب من التجار!', 'success')
        }
      },
      {
        name: 'موسم حصاد وفير',
        description: 'حصاد استثنائي هذا الموسم',
        effect: () => {
          setResources(prev => ({ ...prev, food: prev.food + 200 }))
          showToast('حصلت على 200 طعام إضافي!', 'success')
        }
      },
      {
        name: 'اكتشاف منجم',
        description: 'اكتشف عمالك منجماً جديداً',
        effect: () => {
          setResources(prev => ({ ...prev, iron: prev.iron + 50 }))
          showToast('اكتشفت منجم حديد جديد!', 'success')
        }
      },
      {
        name: 'وباء في المملكة',
        description: 'انتشر وباء في المملكة',
        effect: () => {
          setPopulation(prev => Math.max(50, prev - 20))
          setHappiness(prev => Math.max(0, prev - 15))
          showToast('وباء ضرب المملكة! فقدت سكان وسعادة', 'error')
        }
      },
      {
        name: 'مهرجان الحصاد',
        description: 'احتفل الشعب بمهرجان الحصاد',
        effect: () => {
          setHappiness(prev => Math.min(100, prev + 20))
          showToast('ارتفعت سعادة الشعب!', 'success')
        }
      }
    ]
    
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    randomEvent.effect()
  }

  const generateEnemyAttack = () => {
    const enemyNames = ['مملكة الظلام', 'إمبراطورية الشمال', 'قبائل الصحراء', 'محاربو الجبال']
    const enemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)]
    
    const enemyStrength = Math.floor(level * 50 + Math.random() * 100)
    
    setEnemyKingdom({
      name: enemyName,
      strength: enemyStrength,
      army: {
        warrior: Math.floor(enemyStrength / 10),
        archer: Math.floor(enemyStrength / 15),
        knight: Math.floor(enemyStrength / 30),
        mage: Math.floor(enemyStrength / 50)
      }
    })
    
    showToast(`${enemyName} تهاجم مملكتك!`, 'warning')
  }

  const buildStructure = (buildingType) => {
    const building = BUILDINGS[buildingType]
    if (!building) return
    
    // Check if player has enough resources
    for (const [resource, amount] of Object.entries(building.cost)) {
      if (resources[resource] < amount) {
        showToast(`ليس لديك ${resource} كافي!`, 'error')
        return
      }
    }
    
    // Deduct resources
    setResources(prev => {
      const newResources = { ...prev }
      for (const [resource, amount] of Object.entries(building.cost)) {
        newResources[resource] -= amount
      }
      return newResources
    })
    
    // Add building
    setBuildings(prev => ({
      ...prev,
      [buildingType.toLowerCase()]: (prev[buildingType.toLowerCase()] || 0) + 1
    }))
    
    setScore(prev => prev + 50)
    showToast(`تم بناء ${building.name}!`, 'success')
  }

  const trainUnit = (unitType) => {
    const unit = UNITS[unitType]
    if (!unit) return
    
    // Check resources
    for (const [resource, amount] of Object.entries(unit.cost)) {
      if (resources[resource] < amount) {
        showToast(`ليس لديك ${resource} كافي!`, 'error')
        return
      }
    }
    
    // Deduct resources
    setResources(prev => {
      const newResources = { ...prev }
      for (const [resource, amount] of Object.entries(unit.cost)) {
        newResources[resource] -= amount
      }
      return newResources
    })
    
    // Add unit
    setArmy(prev => ({
      ...prev,
      [unitType.toLowerCase()]: (prev[unitType.toLowerCase()] || 0) + 1
    }))
    
    setScore(prev => prev + 25)
    showToast(`تم تدريب ${unit.name}!`, 'success')
  }

  const researchTechnology = (techType) => {
    const tech = TECHNOLOGIES[techType]
    if (!tech || technologies.includes(techType)) return
    
    // Check resources
    for (const [resource, amount] of Object.entries(tech.cost)) {
      if (resources[resource] < amount) {
        showToast(`ليس لديك ${resource} كافي!`, 'error')
        return
      }
    }
    
    // Deduct resources
    setResources(prev => {
      const newResources = { ...prev }
      for (const [resource, amount] of Object.entries(tech.cost)) {
        newResources[resource] -= amount
      }
      return newResources
    })
    
    // Add technology
    setTechnologies(prev => [...prev, techType])
    setScore(prev => prev + 100)
    showToast(`تم بحث ${tech.name}!`, 'success')
  }

  const calculateArmyStrength = (armyData) => {
    let strength = 0
    for (const [unitType, count] of Object.entries(armyData)) {
      const unit = UNITS[unitType.toUpperCase()]
      if (unit) {
        let unitStrength = (unit.attack + unit.defense) * count
        
        // Technology bonuses
        if (technologies.includes('WARFARE')) {
          unitStrength *= 1.25 // +25% attack bonus
        }
        if (technologies.includes('MAGIC') && unitType === 'mage') {
          unitStrength *= 1.5 // +50% mage power
        }
        
        strength += unitStrength
      }
    }
    return Math.floor(strength)
  }

  const startBattle = () => {
    if (!enemyKingdom) return
    
    setBattleInProgress(true)
    
    setTimeout(() => {
      const playerStrength = calculateArmyStrength(army)
      const enemyStrength = calculateArmyStrength(enemyKingdom.army)
      
      // Add defense bonus from castles
      const defenseBonus = buildings.castle * 50
      const totalPlayerStrength = playerStrength + defenseBonus
      
      if (totalPlayerStrength > enemyStrength) {
        // Victory
        const goldReward = Math.floor(enemyStrength * 2)
        const scoreReward = Math.floor(enemyStrength * 5)
        
        setResources(prev => ({ ...prev, gold: prev.gold + goldReward }))
        setScore(prev => prev + scoreReward)
        setLevel(prev => prev + 1)
        
        showToast(`انتصرت! حصلت على ${goldReward} ذهب و ${scoreReward} نقطة!`, 'success')
      } else {
        // Defeat
        const losses = Math.floor(Math.random() * 0.3 * playerStrength)
        
        // Lose some army units
        setArmy(prev => {
          const newArmy = { ...prev }
          const totalUnits = Object.values(newArmy).reduce((sum, count) => sum + count, 0)
          const lossRatio = losses / (totalUnits * 10)
          
          for (const unitType of Object.keys(newArmy)) {
            newArmy[unitType] = Math.max(0, Math.floor(newArmy[unitType] * (1 - lossRatio)))
          }
          
          return newArmy
        })
        
        setHappiness(prev => Math.max(0, prev - 20))
        showToast('هُزمت في المعركة! فقدت بعض الجنود', 'error')
      }
      
      setBattleInProgress(false)
      setEnemyKingdom(null)
    }, 3000)
  }

  const startGame = () => {
    if (!kingdomName.trim()) {
      showToast('يرجى إدخال اسم المملكة', 'error')
      return
    }
    setGameStarted(true)
    showToast(`مرحباً بك في مملكة ${kingdomName}!`, 'success')
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameTime(0)
    setScore(0)
    setLevel(1)
    setKingdomName('')
    setPopulation(100)
    setHappiness(75)
    setResources({ gold: 1000, food: 500, wood: 300, stone: 200, iron: 100 })
    setBuildings({ castle: 1, farm: 2, mine: 1, lumber_mill: 1, quarry: 1, barracks: 1 })
    setArmy({ warrior: 10, archer: 5, knight: 2, mage: 1 })
    setTechnologies([])
    setEnemyKingdom(null)
    setBattleInProgress(false)
    showToast('تم إعادة تعيين اللعبة', 'info')
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول للعب حرب الممالك</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">حرب الممالك</h1>
            <p className="text-gray-600">ابن إمبراطوريتك وادافع عن مملكتك</p>
          </div>
          
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            إعادة تعيين
          </button>
        </div>

        {!gameStarted ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <Crown className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">أنشئ مملكتك</h2>
                <p className="text-gray-600">ابدأ رحلتك لبناء أعظم إمبراطورية</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المملكة
                  </label>
                  <input
                    type="text"
                    value={kingdomName}
                    onChange={(e) => setKingdomName(e.target.value)}
                    placeholder="أدخل اسم مملكتك"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  ابدأ المملكة
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Coins className="h-6 w-6" />
                  <span className="text-xl font-bold">{resources.gold}</span>
                </div>
                <p className="text-yellow-100 text-sm">ذهب</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Wheat className="h-6 w-6" />
                  <span className="text-xl font-bold">{resources.food}</span>
                </div>
                <p className="text-green-100 text-sm">طعام</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Users className="h-6 w-6" />
                  <span className="text-xl font-bold">{population}</span>
                </div>
                <p className="text-blue-100 text-sm">سكان</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Star className="h-6 w-6" />
                  <span className="text-xl font-bold">{happiness}%</span>
                </div>
                <p className="text-purple-100 text-sm">سعادة</p>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Trophy className="h-6 w-6" />
                  <span className="text-xl font-bold">{score}</span>
                </div>
                <p className="text-red-100 text-sm">نقاط</p>
              </div>
              
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Clock className="h-6 w-6" />
                  <span className="text-lg font-bold">{formatTime(gameTime)}</span>
                </div>
                <p className="text-gray-100 text-sm">وقت اللعب</p>
              </div>
            </div>

            {/* Enemy Attack Alert */}
            {enemyKingdom && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      🚨 هجوم من {enemyKingdom.name}!
                    </h3>
                    <p className="text-red-700">
                      قوة العدو: {enemyKingdom.strength} | قوتك: {calculateArmyStrength(army) + buildings.castle * 50}
                    </p>
                  </div>
                  <button
                    onClick={startBattle}
                    disabled={battleInProgress}
                    className="bg-red-600 text-white py-2 px-6 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {battleInProgress ? 'المعركة جارية...' : 'ابدأ المعركة'}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'overview', name: 'نظرة عامة', icon: Home },
                { id: 'buildings', name: 'المباني', icon: Castle },
                { id: 'army', name: 'الجيش', icon: Sword },
                { id: 'research', name: 'البحث', icon: Zap }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">مملكة {kingdomName}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">الموارد</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🪙 ذهب</span>
                          <span className="font-bold">{resources.gold}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🌾 طعام</span>
                          <span className="font-bold">{resources.food}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🪵 خشب</span>
                          <span className="font-bold">{resources.wood}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🪨 حجر</span>
                          <span className="font-bold">{resources.stone}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>⚔️ حديد</span>
                          <span className="font-bold">{resources.iron}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">الجيش</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>⚔️ محاربون</span>
                          <span className="font-bold">{army.warrior}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🏹 رماة</span>
                          <span className="font-bold">{army.archer}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🐎 فرسان</span>
                          <span className="font-bold">{army.knight}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>🔮 سحرة</span>
                          <span className="font-bold">{army.mage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'buildings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">المباني</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(BUILDINGS).map(([key, building]) => {
                      const Icon = building.icon
                      const count = buildings[key.toLowerCase()] || 0
                      
                      return (
                        <div key={key} className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                          <div className="flex items-center mb-3">
                            <Icon className="h-6 w-6 text-purple-600 mr-2" />
                            <h3 className="font-semibold">{building.name}</h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">المملوك: {count}</p>
                          
                          <div className="text-xs text-gray-500 mb-3">
                            التكلفة: {Object.entries(building.cost).map(([resource, amount]) => 
                              `${amount} ${resource}`
                            ).join(', ')}
                          </div>
                          
                          <button
                            onClick={() => buildStructure(key)}
                            className="w-full bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            بناء
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'army' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">الجيش</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(UNITS).map(([key, unit]) => {
                      const count = army[key.toLowerCase()] || 0
                      
                      return (
                        <div key={key} className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                          <h3 className="font-semibold mb-2">{unit.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">المملوك: {count}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            هجوم: {unit.attack} | دفاع: {unit.defense}
                          </p>
                          
                          <div className="text-xs text-gray-500 mb-3">
                            التكلفة: {Object.entries(unit.cost).map(([resource, amount]) => 
                              `${amount} ${resource}`
                            ).join(', ')}
                          </div>
                          
                          <button
                            onClick={() => trainUnit(key)}
                            className="w-full bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            تدريب
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'research' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">البحث والتطوير</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(TECHNOLOGIES).map(([key, tech]) => {
                      const isResearched = technologies.includes(key)
                      
                      return (
                        <div key={key} className={`p-4 border rounded-xl transition-all ${
                          isResearched 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 hover:shadow-lg'
                        }`}>
                          <h3 className="font-semibold mb-2">{tech.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{tech.effect}</p>
                          
                          {!isResearched && (
                            <>
                              <div className="text-xs text-gray-500 mb-3">
                                التكلفة: {Object.entries(tech.cost).map(([resource, amount]) => 
                                  `${amount} ${resource}`
                                ).join(', ')}
                              </div>
                              
                              <button
                                onClick={() => researchTechnology(key)}
                                className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                بحث
                              </button>
                            </>
                          )}
                          
                          {isResearched && (
                            <div className="text-center text-green-600 font-medium">
                              ✅ مكتمل
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default KingdomWars