import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Crown, Coins, Users, Home, Factory, 
  TrendingUp, Shield, Zap, Star,
  Building, Hammer, Sword, BookOpen
} from 'lucide-react';

// Game Constants
const RESOURCES = {
  GOLD: 'gold',
  POPULATION: 'population',
  HAPPINESS: 'happiness',
  MILITARY: 'military',
  TECHNOLOGY: 'technology',
  CULTURE: 'culture'
};

const BUILDINGS = {
  HOUSE: { name: 'منزل', cost: { gold: 100 }, effect: { population: 5 }, time: 30 },
  FARM: { name: 'مزرعة', cost: { gold: 200 }, effect: { gold: 2 }, time: 60 },
  MARKET: { name: 'سوق', cost: { gold: 500 }, effect: { gold: 5, happiness: 1 }, time: 120 },
  BARRACKS: { name: 'ثكنة', cost: { gold: 800 }, effect: { military: 10 }, time: 180 },
  LIBRARY: { name: 'مكتبة', cost: { gold: 1000 }, effect: { technology: 5, culture: 3 }, time: 240 },
  PALACE: { name: 'قصر', cost: { gold: 2000 }, effect: { happiness: 10, culture: 5 }, time: 300 },
  FACTORY: { name: 'مصنع', cost: { gold: 1500, technology: 20 }, effect: { gold: 8 }, time: 200 },
  UNIVERSITY: { name: 'جامعة', cost: { gold: 3000, culture: 15 }, effect: { technology: 15 }, time: 360 }
};

const TECHNOLOGIES = {
  AGRICULTURE: { name: 'الزراعة', cost: { technology: 10 }, effect: { goldMultiplier: 1.2 } },
  ENGINEERING: { name: 'الهندسة', cost: { technology: 20 }, effect: { buildTimeReduction: 0.8 } },
  MILITARY_TACTICS: { name: 'التكتيكات العسكرية', cost: { technology: 30 }, effect: { militaryMultiplier: 1.5 } },
  ECONOMICS: { name: 'الاقتصاد', cost: { technology: 40 }, effect: { goldMultiplier: 1.5 } },
  PHILOSOPHY: { name: 'الفلسفة', cost: { technology: 50 }, effect: { happinessMultiplier: 1.3 } }
};

const EVENTS = [
  {
    name: 'موسم حصاد وفير',
    description: 'حصاد استثنائي يزيد من الذهب',
    effect: { gold: 500 },
    probability: 0.1
  },
  {
    name: 'مهرجان ثقافي',
    description: 'مهرجان يرفع معنويات الشعب',
    effect: { happiness: 20, culture: 10 },
    probability: 0.08
  },
  {
    name: 'اكتشاف علمي',
    description: 'اكتشاف جديد يعزز التقنية',
    effect: { technology: 25 },
    probability: 0.06
  },
  {
    name: 'هجوم بربري',
    description: 'هجوم يتطلب دفاعاً قوياً',
    effect: { gold: -300, military: -10 },
    probability: 0.12
  },
  {
    name: 'وباء',
    description: 'مرض يقلل من السكان والسعادة',
    effect: { population: -20, happiness: -15 },
    probability: 0.05
  }
];

const EmpireBuilder = () => {
  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  
  // Resources
  const [resources, setResources] = useState({
    gold: 1000,
    population: 50,
    happiness: 50,
    military: 10,
    technology: 0,
    culture: 0
  });
  
  // Empire State
  const [buildings, setBuildings] = useState({});
  const [technologies, setTechnologies] = useState({});
  const [constructionQueue, setConstructionQueue] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // UI State
  const [selectedTab, setSelectedTab] = useState('overview');
  const [notification, setNotification] = useState(null);

  // Game Timer
  useEffect(() => {
    if (!gameStarted) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
      
      // Resource generation every second
      setResources(prev => {
        const newResources = { ...prev };
        
        // Gold generation from buildings
        const goldPerSecond = calculateGoldGeneration();
        newResources.gold += goldPerSecond;
        
        // Population growth
        if (newResources.happiness > 30) {
          newResources.population += Math.floor(newResources.population * 0.001);
        }
        
        // Happiness decay
        if (newResources.population > newResources.happiness * 2) {
          newResources.happiness = Math.max(0, newResources.happiness - 0.1);
        }
        
        return newResources;
      });
      
      // Process construction queue
      setConstructionQueue(prev => {
        return prev.map(item => ({
          ...item,
          timeLeft: item.timeLeft - 1
        })).filter(item => {
          if (item.timeLeft <= 0) {
            completeConstruction(item);
            return false;
          }
          return true;
        });
      });
      
      // Random events
      if (Math.random() < 0.002) { // 0.2% chance per second
        triggerRandomEvent();
      }
      
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted]);

  // Calculate gold generation
  const calculateGoldGeneration = useCallback(() => {
    let goldPerSecond = 0;
    
    Object.entries(buildings).forEach(([buildingType, count]) => {
      const building = BUILDINGS[buildingType];
      if (building?.effect?.gold) {
        goldPerSecond += building.effect.gold * count;
      }
    });
    
    // Apply technology multipliers
    if (technologies.AGRICULTURE) goldPerSecond *= 1.2;
    if (technologies.ECONOMICS) goldPerSecond *= 1.5;
    
    return goldPerSecond;
  }, [buildings, technologies]);

  // Complete construction
  const completeConstruction = (item) => {
    setBuildings(prev => ({
      ...prev,
      [item.type]: (prev[item.type] || 0) + 1
    }));
    
    // Apply building effects
    const building = BUILDINGS[item.type];
    if (building.effect) {
      setResources(prev => {
        const newResources = { ...prev };
        Object.entries(building.effect).forEach(([resource, value]) => {
          if (resource !== 'goldMultiplier' && resource !== 'militaryMultiplier') {
            newResources[resource] = (newResources[resource] || 0) + value;
          }
        });
        return newResources;
      });
    }
    
    showNotification(`تم إنجاز بناء ${building.name}!`, 'success');
  };

  // Start construction
  const startConstruction = (buildingType) => {
    const building = BUILDINGS[buildingType];
    
    // Check if resources are sufficient
    const canAfford = Object.entries(building.cost).every(([resource, cost]) => {
      return resources[resource] >= cost;
    });
    
    if (!canAfford) {
      showNotification('موارد غير كافية!', 'error');
      return;
    }
    
    // Deduct resources
    setResources(prev => {
      const newResources = { ...prev };
      Object.entries(building.cost).forEach(([resource, cost]) => {
        newResources[resource] -= cost;
      });
      return newResources;
    });
    
    // Add to construction queue
    const buildTime = technologies.ENGINEERING ? 
      Math.floor(building.time * 0.8) : building.time;
    
    setConstructionQueue(prev => [...prev, {
      type: buildingType,
      name: building.name,
      timeLeft: buildTime,
      totalTime: buildTime
    }]);
    
    showNotification(`بدأ بناء ${building.name}`, 'info');
  };

  // Research technology
  const researchTechnology = (techType) => {
    const tech = TECHNOLOGIES[techType];
    
    if (technologies[techType]) {
      showNotification('تم بحث هذه التقنية مسبقاً!', 'error');
      return;
    }
    
    if (resources.technology < tech.cost.technology) {
      showNotification('نقاط تقنية غير كافية!', 'error');
      return;
    }
    
    setResources(prev => ({
      ...prev,
      technology: prev.technology - tech.cost.technology
    }));
    
    setTechnologies(prev => ({
      ...prev,
      [techType]: true
    }));
    
    showNotification(`تم بحث ${tech.name}!`, 'success');
  };

  // Trigger random event
  const triggerRandomEvent = () => {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    
    if (Math.random() < event.probability) {
      setResources(prev => {
        const newResources = { ...prev };
        Object.entries(event.effect).forEach(([resource, value]) => {
          newResources[resource] = Math.max(0, newResources[resource] + value);
        });
        return newResources;
      });
      
      setEventHistory(prev => [{
        ...event,
        timestamp: gameTime
      }, ...prev.slice(0, 9)]);
      
      showNotification(event.name, event.effect.gold < 0 ? 'error' : 'success');
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameTime(0);
    setScore(0);
    setResources({
      gold: 1000,
      population: 50,
      happiness: 50,
      military: 10,
      technology: 0,
      culture: 0
    });
    setBuildings({});
    setTechnologies({});
    setConstructionQueue([]);
    setEventHistory([]);
    showNotification('مرحباً بك في بناء الإمبراطورية!', 'success');
  };

  // Calculate empire score
  const calculateScore = () => {
    return Math.floor(
      resources.gold * 0.1 +
      resources.population * 2 +
      resources.happiness * 3 +
      resources.military * 5 +
      resources.technology * 10 +
      resources.culture * 8 +
      Object.values(buildings).reduce((sum, count) => sum + count, 0) * 50
    );
  };

  useEffect(() => {
    setScore(calculateScore());
  }, [resources, buildings]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="w-16 h-16 mx-auto text-amber-600 mb-4" />
            <CardTitle className="text-2xl font-bold text-amber-800">
              بناء الإمبراطورية
            </CardTitle>
            <p className="text-gray-600 mt-2">
              ابن إمبراطوريتك من الصفر! أدر الموارد، ابن المدن، وطور التقنيات
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">كيفية اللعب:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ابن المباني لزيادة الموارد</li>
                <li>• طور التقنيات لتحسين الكفاءة</li>
                <li>• حافظ على سعادة الشعب</li>
                <li>• واجه الأحداث العشوائية</li>
                <li>• اجمع أكبر عدد من النقاط</li>
              </ul>
            </div>
            <Button 
              onClick={startGame}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              ابدأ بناء الإمبراطورية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className={`${notification.type === 'error' ? 'border-red-500 bg-red-50' : 
            notification.type === 'success' ? 'border-green-500 bg-green-50' : 
            'border-blue-500 bg-blue-50'}`}>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Crown className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-2xl font-bold text-amber-800">إمبراطوريتي</h1>
              <p className="text-gray-600">المستوى {level} • النقاط: {score.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">الوقت المنقضي</p>
            <p className="text-lg font-semibold">
              {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Coins className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">الذهب</p>
                <p className="font-semibold">{Math.floor(resources.gold).toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">السكان</p>
                <p className="font-semibold">{Math.floor(resources.population).toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Star className="w-5 h-5 text-pink-600" />
              <div>
                <p className="text-xs text-gray-600">السعادة</p>
                <p className="font-semibold">{Math.floor(resources.happiness)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">الجيش</p>
                <p className="font-semibold">{Math.floor(resources.military)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">التقنية</p>
                <p className="font-semibold">{Math.floor(resources.technology)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">الثقافة</p>
                <p className="font-semibold">{Math.floor(resources.culture)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Game Area */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="buildings">المباني</TabsTrigger>
          <TabsTrigger value="technology">التقنية</TabsTrigger>
          <TabsTrigger value="events">الأحداث</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Construction Queue */}
          {constructionQueue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hammer className="w-5 h-5 mr-2" />
                  قائمة البناء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {constructionQueue.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.timeLeft}s متبقية من {item.totalTime}s
                        </p>
                      </div>
                      <Progress 
                        value={((item.totalTime - item.timeLeft) / item.totalTime) * 100} 
                        className="w-32"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empire Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الإمبراطورية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>إجمالي المباني:</span>
                  <span className="font-semibold">
                    {Object.values(buildings).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>التقنيات المبحوثة:</span>
                  <span className="font-semibold">{Object.keys(technologies).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>إنتاج الذهب/ثانية:</span>
                  <span className="font-semibold text-yellow-600">
                    +{calculateGoldGeneration().toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>معدل النمو السكاني:</span>
                  <span className="font-semibold text-blue-600">
                    {resources.happiness > 30 ? '+' : '0'}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المباني المبنية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(buildings).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{BUILDINGS[type].name}:</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(buildings).length === 0 && (
                    <p className="text-gray-500 text-center py-4">لا توجد مباني بعد</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="buildings" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(BUILDINGS).map(([type, building]) => {
              const canAfford = Object.entries(building.cost).every(([resource, cost]) => {
                return resources[resource] >= cost;
              });
              
              return (
                <Card key={type} className={`${canAfford ? 'border-green-200' : 'border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{building.name}</span>
                      <Building className="w-5 h-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">التكلفة:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(building.cost).map(([resource, cost]) => (
                          <Badge 
                            key={resource} 
                            variant={resources[resource] >= cost ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {cost} {resource === 'gold' ? 'ذهب' : resource === 'technology' ? 'تقنية' : resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold mb-1">التأثير:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(building.effect).map(([resource, value]) => (
                          <Badge key={resource} variant="outline" className="text-xs">
                            +{value} {resource === 'gold' ? 'ذهب/ث' : 
                                    resource === 'population' ? 'سكان' :
                                    resource === 'happiness' ? 'سعادة' :
                                    resource === 'military' ? 'جيش' :
                                    resource === 'technology' ? 'تقنية' :
                                    resource === 'culture' ? 'ثقافة' : resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        وقت البناء: {building.time}ث
                      </span>
                      <span className="text-sm font-semibold">
                        مبني: {buildings[type] || 0}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={() => startConstruction(type)}
                      disabled={!canAfford}
                      className="w-full"
                      size="sm"
                    >
                      ابن
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(TECHNOLOGIES).map(([type, tech]) => {
              const canResearch = resources.technology >= tech.cost.technology && !technologies[type];
              const isResearched = technologies[type];
              
              return (
                <Card key={type} className={`${
                  isResearched ? 'border-green-500 bg-green-50' :
                  canResearch ? 'border-blue-200' : 'border-gray-200'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{tech.name}</span>
                      {isResearched ? (
                        <Badge className="bg-green-600">مبحوث</Badge>
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">التكلفة:</p>
                      <Badge 
                        variant={resources.technology >= tech.cost.technology ? "default" : "destructive"}
                      >
                        {tech.cost.technology} تقنية
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold mb-1">التأثير:</p>
                      <div className="text-sm text-gray-700">
                        {Object.entries(tech.effect).map(([effect, value]) => (
                          <div key={effect}>
                            {effect === 'goldMultiplier' && `زيادة إنتاج الذهب بنسبة ${((value - 1) * 100).toFixed(0)}%`}
                            {effect === 'buildTimeReduction' && `تقليل وقت البناء بنسبة ${((1 - value) * 100).toFixed(0)}%`}
                            {effect === 'militaryMultiplier' && `زيادة قوة الجيش بنسبة ${((value - 1) * 100).toFixed(0)}%`}
                            {effect === 'happinessMultiplier' && `زيادة السعادة بنسبة ${((value - 1) * 100).toFixed(0)}%`}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => researchTechnology(type)}
                      disabled={!canResearch || isResearched}
                      className="w-full"
                      size="sm"
                    >
                      {isResearched ? 'مبحوث' : 'ابحث'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل الأحداث</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventHistory.length > 0 ? (
                  eventHistory.map((event, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{event.name}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.floor(event.timestamp / 60)}:{(event.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(event.effect).map(([resource, value]) => (
                          <Badge 
                            key={resource} 
                            variant={value > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {value > 0 ? '+' : ''}{value} {resource === 'gold' ? 'ذهب' : 
                                                      resource === 'population' ? 'سكان' :
                                                      resource === 'happiness' ? 'سعادة' :
                                                      resource === 'military' ? 'جيش' :
                                                      resource === 'technology' ? 'تقنية' :
                                                      resource === 'culture' ? 'ثقافة' : resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">لم تحدث أي أحداث بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmpireBuilder;