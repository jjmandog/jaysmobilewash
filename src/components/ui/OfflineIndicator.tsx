import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const OfflineIndicator: React.FC = () => {
  const { state } = useApp()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (!state.isOnline) {
      setShowIndicator(true)
    } else {
      // Delay hiding to show "back online" message briefly
      const timer = setTimeout(() => setShowIndicator(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.isOnline])

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className={`
            px-6 py-3 rounded-lg shadow-lg backdrop-blur-md border
            ${state.isOnline 
              ? 'bg-green-500/20 border-green-500/30 text-green-100' 
              : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100'
            }
          `}>
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {state.isOnline ? (
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
                    />
                  </svg>
                )}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {state.isOnline ? (
                    <span className="flex items-center">
                      🎉 Back online! All features restored
                    </span>
                  ) : (
                    <span className="flex items-center">
                      📡 You're offline - Some features may be limited
                    </span>
                  )}
                </p>
                
                {!state.isOnline && (
                  <p className="text-xs opacity-80 mt-1">
                    Don't worry, you can still browse and call us!
                  </p>
                )}
              </div>

              {/* Pulse indicator for offline */}
              {!state.isOnline && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Offline actions */}
            {!state.isOnline && (
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                <div className="flex space-x-3 text-xs">
                  <a
                    href="tel:+15622289429"
                    className="text-yellow-200 hover:text-yellow-100 underline"
                  >
                    📞 Call us
                  </a>
                  <span className="text-yellow-300">•</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-yellow-200 hover:text-yellow-100 underline"
                  >
                    🔄 Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator