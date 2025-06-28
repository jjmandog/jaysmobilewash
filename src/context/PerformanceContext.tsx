import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  loadTime: number
  renderTime: number
  particleCount: number
  gpuMemory: number
}

interface PerformanceContextType {
  metrics: PerformanceMetrics
  isLowPerformance: boolean
  adaptiveSettings: {
    particleLimit: number
    effectsEnabled: boolean
    highQualityRendering: boolean
    animationsEnabled: boolean
  }
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void
  adjustSettings: () => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

const initialMetrics: PerformanceMetrics = {
  fps: 60,
  frameTime: 16.67,
  memoryUsage: 0,
  loadTime: 0,
  renderTime: 0,
  particleCount: 0,
  gpuMemory: 0
}

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics)
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    particleLimit: 1000,
    effectsEnabled: true,
    highQualityRendering: true,
    animationsEnabled: true
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])

  // FPS Monitoring
  useEffect(() => {
    let animationFrameId: number

    const measureFPS = () => {
      const now = performance.now()
      const delta = now - lastTimeRef.current
      
      frameCountRef.current++
      
      if (delta >= 1000) { // Calculate FPS every second
        const fps = Math.round((frameCountRef.current * 1000) / delta)
        const frameTime = delta / frameCountRef.current
        
        // Update FPS history
        fpsHistoryRef.current.push(fps)
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift()
        }
        
        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime
        }))
        
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
      
      animationFrameId = requestAnimationFrame(measureFPS)
    }

    animationFrameId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Memory monitoring
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memInfo.usedJSHeapSize,
          gpuMemory: memInfo.totalJSHeapSize
        }))
      }
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 5000)

    return () => clearInterval(interval)
  }, [])

  // Performance assessment
  useEffect(() => {
    const avgFPS = fpsHistoryRef.current.length > 0 
      ? fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length 
      : 60

    const lowPerf = avgFPS < 30 || metrics.memoryUsage > 100 * 1024 * 1024 // 100MB

    if (lowPerf !== isLowPerformance) {
      setIsLowPerformance(lowPerf)
      adjustSettings()
    }
  }, [metrics.fps, metrics.memoryUsage])

  const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }))
  }

  const adjustSettings = () => {
    const avgFPS = fpsHistoryRef.current.length > 0 
      ? fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length 
      : 60

    if (avgFPS < 20) {
      // Very low performance - aggressive optimization
      setAdaptiveSettings({
        particleLimit: 100,
        effectsEnabled: false,
        highQualityRendering: false,
        animationsEnabled: false
      })
    } else if (avgFPS < 30) {
      // Low performance - moderate optimization
      setAdaptiveSettings({
        particleLimit: 300,
        effectsEnabled: true,
        highQualityRendering: false,
        animationsEnabled: true
      })
    } else if (avgFPS < 45) {
      // Medium performance - light optimization
      setAdaptiveSettings({
        particleLimit: 600,
        effectsEnabled: true,
        highQualityRendering: true,
        animationsEnabled: true
      })
    } else {
      // High performance - full quality
      setAdaptiveSettings({
        particleLimit: 1000,
        effectsEnabled: true,
        highQualityRendering: true,
        animationsEnabled: true
      })
    }
  }

  // Device capabilities detection
  useEffect(() => {
    const detectCapabilities = () => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          console.log('GPU:', renderer)
        }
      }

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setAdaptiveSettings(prev => ({
          ...prev,
          animationsEnabled: false,
          effectsEnabled: false
        }))
      }

      // Check device memory (if available)
      if ('deviceMemory' in navigator) {
        const deviceMemory = (navigator as any).deviceMemory
        if (deviceMemory <= 4) {
          // Low memory device
          setAdaptiveSettings(prev => ({
            ...prev,
            particleLimit: Math.min(prev.particleLimit, 200),
            effectsEnabled: false
          }))
        }
      }

      // Check for mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile) {
        setAdaptiveSettings(prev => ({
          ...prev,
          particleLimit: Math.min(prev.particleLimit, 400)
        }))
      }
    }

    detectCapabilities()
  }, [])

  const contextValue: PerformanceContextType = {
    metrics,
    isLowPerformance,
    adaptiveSettings,
    updateMetrics,
    adjustSettings
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}