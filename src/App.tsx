import React, { Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Context Providers
import { AppProvider } from './context/AppContext'
import { AudioProvider } from './context/AudioContext'
import { PerformanceProvider } from './context/PerformanceContext'

// Components
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'
import OfflineIndicator from './components/ui/OfflineIndicator'
import ParticleSystem from './components/effects/ParticleSystem'

// Lazy-loaded pages
const HomePage = React.lazy(() => import('./pages/HomePage'))
const AboutJaysCompany = React.lazy(() => import('./pages/AboutJaysCompany'))
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

// Types
interface AppState {
  isLoading: boolean
  hasError: boolean
}

const App: React.FC = () => {
  const [appState, setAppState] = React.useState<AppState>({
    isLoading: true,
    hasError: false
  })

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Preload critical resources
        await Promise.all([
          // Preload fonts
          document.fonts.ready,
          // Preload critical images
          new Promise((resolve) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = resolve
            img.src = '/images/mclaren-hero.webp'
          }),
          // Initialize audio context (user gesture required)
          new Promise(resolve => setTimeout(resolve, 100))
        ])

        setAppState(prev => ({ ...prev, isLoading: false }))
      } catch (error) {
        console.error('App initialization error:', error)
        setAppState({ isLoading: false, hasError: true })
      }
    }

    initializeApp()
  }, [])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      setAppState(prev => ({ ...prev, hasError: true }))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (appState.isLoading) {
    return <LoadingScreen />
  }

  if (appState.hasError) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-dark-400 mb-8">
            We're experiencing technical difficulties. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <PerformanceProvider>
      <AudioProvider>
        <AppProvider>
          <div className="App">
            <Helmet>
              <html lang="en" />
              <body className="bg-dark-900 text-white" />
            </Helmet>

            {/* Global Effects */}
            <ParticleSystem />
            <OfflineIndicator />

            {/* Main Application Routes */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about-jays-company" element={<AboutJaysCompany />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:serviceId" element={<ServicesPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>

            {/* Background Effects */}
            <div 
              className="fixed inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 80%, rgba(181, 48, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)
                `
              }}
            />
          </div>
        </AppProvider>
      </AudioProvider>
    </PerformanceProvider>
  )
}

export default App