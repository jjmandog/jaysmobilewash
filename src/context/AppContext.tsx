import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Types
interface AppState {
  isOnline: boolean
  theme: 'dark' | 'light'
  language: 'en' | 'es'
  user: {
    preferences: {
      reducedMotion: boolean
      highContrast: boolean
      soundEnabled: boolean
    }
  }
  easter: {
    sequenceProgress: number
    unlockedSecrets: string[]
    totalClicks: number
  }
  performance: {
    fps: number
    memoryUsage: number
    loadTime: number
  }
}

type AppAction = 
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['user']['preferences']> }
  | { type: 'UPDATE_EASTER_PROGRESS'; payload: number }
  | { type: 'UNLOCK_SECRET'; payload: string }
  | { type: 'INCREMENT_CLICKS' }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<AppState['performance']> }
  | { type: 'RESET_EASTER_SEQUENCE' }

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  isEasterEggActive: boolean
  triggerEasterEgg: (secretCode: string) => void
}

const initialState: AppState = {
  isOnline: navigator.onLine,
  theme: 'dark',
  language: 'en',
  user: {
    preferences: {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      soundEnabled: true
    }
  },
  easter: {
    sequenceProgress: 0,
    unlockedSecrets: [],
    totalClicks: 0
  },
  performance: {
    fps: 60,
    memoryUsage: 0,
    loadTime: 0
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      }
    
    case 'UPDATE_EASTER_PROGRESS':
      return {
        ...state,
        easter: { ...state.easter, sequenceProgress: action.payload }
      }
    
    case 'UNLOCK_SECRET':
      return {
        ...state,
        easter: {
          ...state.easter,
          unlockedSecrets: [...state.easter.unlockedSecrets, action.payload]
        }
      }
    
    case 'INCREMENT_CLICKS':
      return {
        ...state,
        easter: { ...state.easter, totalClicks: state.easter.totalClicks + 1 }
      }
    
    case 'RESET_EASTER_SEQUENCE':
      return {
        ...state,
        easter: { ...state.easter, sequenceProgress: 0 }
      }
    
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      }
    
    default:
      return state
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now()
    
    const updatePerformance = () => {
      dispatch({
        type: 'UPDATE_PERFORMANCE',
        payload: {
          loadTime: performance.now() - startTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
    }

    // Initial performance update
    setTimeout(updatePerformance, 1000)

    // Periodic performance updates
    const interval = setInterval(updatePerformance, 5000)

    return () => clearInterval(interval)
  }, [])

  // Easter egg sequences
  const easterSequences = {
    'MCLAREN': [
      'KeyM', 'KeyC', 'KeyL', 'KeyA', 'KeyR', 'KeyE', 'KeyN'
    ],
    'KONAMI': [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
      'KeyB', 'KeyA'
    ],
    'JAYS': ['KeyJ', 'KeyA', 'KeyY', 'KeyS']
  }

  const [keySequence, setKeySequence] = React.useState<string[]>([])
  const isEasterEggActive = state.easter.unlockedSecrets.length > 0

  // Keyboard sequence detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeySequence(prev => [...prev.slice(-9), event.code])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Check for easter egg sequences
  useEffect(() => {
    Object.entries(easterSequences).forEach(([name, sequence]) => {
      if (keySequence.slice(-sequence.length).join(',') === sequence.join(',')) {
        triggerEasterEgg(name)
        setKeySequence([])
      }
    })
  }, [keySequence])

  const triggerEasterEgg = (secretCode: string) => {
    if (!state.easter.unlockedSecrets.includes(secretCode)) {
      dispatch({ type: 'UNLOCK_SECRET', payload: secretCode })
      
      // Special effects for different easter eggs
      switch (secretCode) {
        case 'MCLAREN':
          // Trigger McLaren special animation
          document.dispatchEvent(new CustomEvent('easter:mclaren'))
          break
        case 'KONAMI':
          // Trigger particle explosion
          document.dispatchEvent(new CustomEvent('easter:konami'))
          break
        case 'JAYS':
          // Trigger Jay's special message
          document.dispatchEvent(new CustomEvent('easter:jays'))
          break
      }
    }
  }

  const contextValue: AppContextType = {
    state,
    dispatch,
    isEasterEggActive,
    triggerEasterEgg
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}