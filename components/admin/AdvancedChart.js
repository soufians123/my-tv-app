import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'
import { Button, Select, Card, Badge } from '../ui/unified-components'

const AdvancedChart = ({ title, data, type = 'line', color = 'blue', height = 300 }) => {
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(100)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  const getColorClass = (colorName) => {
    const colors = {
      blue: 'stroke-blue-500 fill-blue-500',
      green: 'stroke-green-500 fill-green-500',
      purple: 'stroke-purple-500 fill-purple-500',
      red: 'stroke-red-500 fill-red-500',
      yellow: 'stroke-yellow-500 fill-yellow-500',
      indigo: 'stroke-indigo-500 fill-indigo-500'
    }
    return colors[colorName] || colors.blue
  }

  const generatePath = () => {
    if (data.length === 0) return ''
    
    const width = 400
    const chartHeight = height - 80
    const stepX = width / (data.length - 1)
    
    let path = ''
    
    data.forEach((point, index) => {
      const x = index * stepX
      const y = chartHeight - ((point.value - minValue) / range) * chartHeight
      
      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        // Create smooth curves
        const prevX = (index - 1) * stepX
        const prevY = chartHeight - ((data[index - 1].value - minValue) / range) * chartHeight
        const cpX1 = prevX + stepX / 3
        const cpX2 = x - stepX / 3
        path += ` C ${cpX1} ${prevY} ${cpX2} ${y} ${x} ${y}`
      }
    })
    
    return path
  }

  const generateAreaPath = () => {
    const linePath = generatePath()
    if (!linePath) return ''
    
    const width = 400
    const chartHeight = height - 80
    
    return `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`
  }

  const renderLineChart = () => {
    const width = 400
    const chartHeight = height - 80
    const stepX = width / (data.length - 1)
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" opacity="0.5"/>
          </pattern>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-500)`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`var(--${color}-500)`} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Area */}
        <path
          d={generateAreaPath()}
          className={`${getColorClass(color)} fill-opacity-20`}
          style={{
            strokeDasharray: type === 'line' ? '0' : '5,5',
            strokeDashoffset: type === 'line' ? 0 : animationProgress * -10,
            transition: 'all 1s ease-in-out'
          }}
        />
        
        {/* Line */}
        <path
          d={generatePath()}
          fill="none"
          className={getColorClass(color)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: type === 'dashed' ? '8,4' : '0',
            pathLength: 1,
            strokeDashoffset: 1 - (animationProgress / 100),
            transition: 'stroke-dashoffset 2s ease-in-out'
          }}
        />
        
        {/* Data Points */}
        {data.map((point, index) => {
          const x = index * stepX
          const y = chartHeight - ((point.value - minValue) / range) * chartHeight
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={hoveredPoint === index ? 6 : 4}
                className={`${getColorClass(color)} stroke-white`}
                strokeWidth="2"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
              />
              
              {/* Tooltip */}
              {hoveredPoint === index && (
                <g>
                  <rect
                    x={x - 30}
                    y={y - 35}
                    width="60"
                    height="25"
                    rx="4"
                    fill="rgba(0,0,0,0.8)"
                    className="animate-fadeIn"
                  />
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {point.value.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          )
        })}
        
        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = index * stepX
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {point.label}
            </text>
          )
        })}
      </svg>
    )
  }

  const renderBarChart = () => {
    const width = 400
    const chartHeight = height - 80
    const barWidth = (width / data.length) * 0.7
    const barSpacing = (width / data.length) * 0.3
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((point, index) => {
          const x = index * (width / data.length) + barSpacing / 2
          const barHeight = ((point.value - minValue) / range) * chartHeight * (animationProgress / 100)
          const y = chartHeight - barHeight
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                className={`${getColorClass(color)} hover:opacity-80`}
                rx="4"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer'
                }}
              />
              
              {/* Value label on hover */}
              {hoveredPoint === index && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#374151"
                >
                  {point.value.toLocaleString()}
                </text>
              )}
              
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 }
    
    const firstValue = data[0].value
    const lastValue = data[data.length - 1].value
    const percentage = ((lastValue - firstValue) / firstValue) * 100
    
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage).toFixed(1)
    }
  }

  const trend = calculateTrend()

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <BarChart3 className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">آخر 30 يوم</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {trend.direction === 'up' && (
            <Badge variant="success" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{trend.percentage}%
            </Badge>
          )}
          {trend.direction === 'down' && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -{trend.percentage}%
            </Badge>
          )}
          {trend.direction === 'neutral' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              مستقر
            </Badge>
          )}
          <Button variant="ghost" size="sm">
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative">
        {type === 'bar' ? renderBarChart() : renderLineChart()}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">الحد الأقصى</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {maxValue.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">المتوسط</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">الحد الأدنى</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {minValue.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AdvancedChart