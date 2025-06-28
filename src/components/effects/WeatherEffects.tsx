import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WeatherData {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'night'
  temperature: number
  description: string
}

const WeatherEffects: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    condition: 'sunny',
    temperature: 72,
    description: 'Perfect weather for car detailing!'
  })
  const [isVisible, setIsVisible] = useState(false)

  // Simulate weather detection based on time of day
  useEffect(() => {
    const updateWeather = () => {
      const hour = new Date().getHours()
      const temp = 65 + Math.random() * 20 // 65-85°F range
      
      let condition: WeatherData['condition']
      let description: string

      if (hour >= 6 && hour < 18) {
        // Daytime
        const random = Math.random()
        if (random < 0.7) {
          condition = 'sunny'
          description = 'Perfect weather for car detailing!'
        } else if (random < 0.9) {
          condition = 'cloudy'
          description = 'Great day for mobile service!'
        } else {
          condition = 'rainy'
          description = 'We work in all weather conditions!'
        }
      } else {
        // Nighttime
        condition = 'night'
        description = 'Night service available!'
      }

      setWeather({
        condition,
        temperature: Math.round(temp),
        description
      })
    }

    updateWeather()
    const interval = setInterval(updateWeather, 30000) // Update every 30 seconds

    // Show weather widget after a delay
    setTimeout(() => setIsVisible(true), 2000)

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return '☀️'
      case 'cloudy':
        return '☁️'
      case 'rainy':
        return '🌧️'
      case 'night':
        return '🌙'
      default:
        return '☀️'
    }
  }

  const getWeatherColor = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-500'
      case 'cloudy':
        return 'from-gray-400 to-gray-600'
      case 'rainy':
        return 'from-blue-400 to-blue-600'
      case 'night':
        return 'from-purple-600 to-indigo-800'
      default:
        return 'from-yellow-400 to-orange-500'
    }
  }

  // Weather-based particle effects
  const renderWeatherParticles = () => {
    if (weather.condition === 'rainy') {
      return (
        <div className="fixed inset-0 pointer-events-none z-5">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-400 opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
              }}
              animate={{
                y: [0, window.innerHeight + 50],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )
    }

    if (weather.condition === 'night') {
      return (
        <div className="fixed inset-0 pointer-events-none z-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <>
      {/* Weather Particles */}
      {renderWeatherParticles()}

      {/* Weather Widget */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="fixed top-20 right-4 z-30"
          >
            <div className="glass p-4 rounded-xl border border-white/20 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className={`text-3xl bg-gradient-to-r ${getWeatherColor(weather.condition)} bg-clip-text`}>
                  {getWeatherIcon(weather.condition)}
                </div>
                
                <div className="flex-1">
                  <div className="text-sm text-dark-400">Current Weather</div>
                  <div className="text-white font-semibold">
                    {weather.temperature}°F
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-dark-300">
                {weather.description}
              </div>

              {/* Weather-specific service message */}
              <div className="mt-2 text-xs text-primary-400">
                {weather.condition === 'rainy' && '💧 We detail in garages & covered areas!'}
                {weather.condition === 'sunny' && '☀️ Perfect day for exterior detailing!'}
                {weather.condition === 'cloudy' && '☁️ Great conditions for all services!'}
                {weather.condition === 'night' && '🌙 24/7 service available!'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time-based greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-20 left-4 z-30"
      >
        <div className="glass p-3 rounded-lg border border-white/10">
          <div className="text-sm text-white">
            {(() => {
              const hour = new Date().getHours()
              if (hour < 12) return '🌅 Good morning!'
              if (hour < 17) return '☀️ Good afternoon!'
              if (hour < 21) return '🌆 Good evening!'
              return '🌙 Working late? We are too!'
            })()}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default WeatherEffects