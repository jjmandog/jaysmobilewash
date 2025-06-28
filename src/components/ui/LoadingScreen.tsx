import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  onComplete?: () => void
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Initializing foam cannons...')
  const [isComplete, setIsComplete] = useState(false)

  const messages = [
    { progress: 0, text: 'Initializing foam cannons...' },
    { progress: 15, text: 'Loading something special...' },
    { progress: 30, text: 'Preparing McLaren visualization...' },
    { progress: 50, text: 'Calibrating water pressure...' },
    { progress: 70, text: 'Almost there, this is worth it!' },
    { progress: 85, text: 'HERE IT COMES!' },
    { progress: 95, text: "LET'S FUCKING GO!" },
    { progress: 100, text: 'Welcome to the experience!' }
  ]

  useEffect(() => {
    const duration = 7000 // 7 seconds
    const interval = 50 // Update every 50ms
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + increment, 100)
        
        // Update message based on progress
        const currentMessage = messages
          .slice()
          .reverse()
          .find(msg => newProgress >= msg.progress)
        
        if (currentMessage && currentMessage.text !== message) {
          setMessage(currentMessage.text)
        }

        if (newProgress >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          setTimeout(() => {
            onComplete?.()
          }, 500)
        }

        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete, message])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-dark-900 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(181, 48, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Loading Content */}
      <div className="relative text-center px-6 max-w-lg">
        {/* Logo or Brand */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        >
          <div className="text-6xl font-display font-bold text-gradient mb-4">
            Jay's
          </div>
          <div className="text-2xl font-light text-mclaren-blue">
            Mobile Wash
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, 
                  ${progress < 50 ? '#ff6b35' : progress < 75 ? '#00d4ff' : '#b530ff'} 0%,
                  ${progress < 50 ? '#ff8c42' : progress < 75 ? '#42d4ff' : '#c563ff'} 100%
                )`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeInOut', duration: 0.3 }}
            />
          </div>
          
          {/* Progress percentage */}
          <motion.div
            className="mt-2 text-sm font-mono text-dark-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {Math.floor(progress)}%
          </motion.div>
        </div>

        {/* Loading Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg text-white font-medium"
        >
          {message}
        </motion.div>

        {/* Special effects based on progress */}
        {progress >= 75 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Celebration particles */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={`celebration-${i}`}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* McLaren hint */}
        {progress >= 50 && (
          <motion.div
            className="mt-8 text-sm text-mclaren-orange opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            🏎️ Preparing McLaren-level experience...
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default LoadingScreen