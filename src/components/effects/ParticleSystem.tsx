import React, { useRef, useEffect, useCallback } from 'react'
import { usePerformance } from '../../context/PerformanceContext'
import { useApp } from '../../context/AppContext'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'foam' | 'water' | 'wax' | 'exhaust' | 'sparkle'
  opacity: number
  active: boolean
  gravity?: number
  magnetX?: number
  magnetY?: number
  rotation?: number
  rotationSpeed?: number
}

const ParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const isActiveRef = useRef(true)
  const lastTimeRef = useRef(0)

  const { adaptiveSettings, updateMetrics } = usePerformance()
  const { state: appState } = useApp()

  // Particle pool for performance
  const particlePool = useRef<Particle[]>([])
  const nextIdRef = useRef(0)

  // Initialize particle pool
  useEffect(() => {
    for (let i = 0; i < adaptiveSettings.particleLimit; i++) {
      particlePool.current.push({
        id: nextIdRef.current++,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1000,
        size: 5,
        color: '#ffffff',
        type: 'foam',
        opacity: 1,
        active: false,
        gravity: 0.1,
        rotation: 0,
        rotationSpeed: 0
      })
    }
  }, [adaptiveSettings.particleLimit])

  // Get particle from pool
  const getParticle = useCallback((): Particle | null => {
    return particlePool.current.find(p => !p.active) || null
  }, [])

  // Create particle
  const createParticle = useCallback((
    x: number, 
    y: number, 
    type: Particle['type'] = 'foam',
    customProps: Partial<Particle> = {}
  ) => {
    const particle = getParticle()
    if (!particle) return null

    const baseProps = {
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      maxLife: 2000 + Math.random() * 1000,
      size: 3 + Math.random() * 5,
      opacity: 0.8 + Math.random() * 0.2,
      active: true,
      gravity: 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    }

    const typeProps = {
      foam: {
        color: '#ffffff',
        size: 5 + Math.random() * 10,
        gravity: 0.05,
        maxLife: 3000
      },
      water: {
        color: '#00d4ff',
        size: 2 + Math.random() * 4,
        gravity: 0.2,
        maxLife: 1500
      },
      wax: {
        color: '#ffd700',
        size: 3 + Math.random() * 6,
        gravity: 0.02,
        maxLife: 4000
      },
      exhaust: {
        color: '#666666',
        size: 8 + Math.random() * 12,
        gravity: -0.05,
        maxLife: 2000
      },
      sparkle: {
        color: '#b530ff',
        size: 1 + Math.random() * 3,
        gravity: 0,
        maxLife: 1000
      }
    }

    Object.assign(particle, baseProps, typeProps[type], customProps)
    particlesRef.current.push(particle)
    return particle
  }, [getParticle])

  // Create foam burst
  const createFoamBurst = useCallback((x: number, y: number, count = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const velocity = 5 + Math.random() * 10
      createParticle(x, y, 'foam', {
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity
      })
    }
  }, [createParticle])

  // Create water splash (exposed for future use)
  const createWaterSplash = useCallback((x: number, y: number, count = 15) => {
    for (let i = 0; i < count; i++) {
      createParticle(x, y, 'water', {
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 15
      })
    }
  }, [createParticle])

  // Create wax shimmer effect (exposed for future use)
  const createWaxShimmer = useCallback((x: number, y: number, count = 10) => {
    for (let i = 0; i < count; i++) {
      createParticle(x, y, 'wax', {
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8
      })
    }
  }, [createParticle])

  // Expose functions for potential external use
  React.useEffect(() => {
    window.ParticleSystemAPI = {
      createFoamBurst,
      createWaterSplash,
      createWaxShimmer
    }
  }, [createFoamBurst, createWaterSplash, createWaxShimmer])

  // Update particles
  const updateParticles = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const activeParticles = particlesRef.current.filter(p => p.active)
    
    activeParticles.forEach(particle => {
      // Update life
      particle.life -= deltaTime / particle.maxLife
      if (particle.life <= 0) {
        particle.active = false
        return
      }

      // Update physics
      particle.vy += particle.gravity || 0
      particle.x += particle.vx * (deltaTime / 16.67) // Normalize to 60fps
      particle.y += particle.vy * (deltaTime / 16.67)
      particle.rotation! += particle.rotationSpeed! * (deltaTime / 16.67)

      // Mouse attraction for some particles
      if (particle.type === 'sparkle') {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100 * 0.5
          particle.vx += (dx / distance) * force
          particle.vy += (dy / distance) * force
        }
      }

      // Apply drag
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Boundary checks
      if (particle.x < 0 || particle.x > canvas.width || 
          particle.y < 0 || particle.y > canvas.height) {
        particle.active = false
      }

      // Update opacity based on life
      particle.opacity = particle.life * 0.8
    })

    // Remove inactive particles
    particlesRef.current = activeParticles

    // Update performance metrics
    updateMetrics({ particleCount: activeParticles.length })
  }, [updateMetrics])

  // Render particles
  const renderParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    particlesRef.current.forEach(particle => {
      if (!particle.active) return

      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation || 0)

      // Create gradient based on particle type
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
      
      if (particle.type === 'foam') {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      } else if (particle.type === 'water') {
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)')
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
      } else if (particle.type === 'wax') {
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)')
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
      } else if (particle.type === 'exhaust') {
        gradient.addColorStop(0, 'rgba(102, 102, 102, 0.6)')
        gradient.addColorStop(1, 'rgba(102, 102, 102, 0)')
      } else if (particle.type === 'sparkle') {
        gradient.addColorStop(0, 'rgba(181, 48, 255, 1)')
        gradient.addColorStop(1, 'rgba(181, 48, 255, 0)')
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
      ctx.fill()

      // Add glow effect for certain types
      if (particle.type === 'sparkle' || particle.type === 'wax') {
        ctx.shadowBlur = particle.size * 2
        ctx.shadowColor = particle.color
        ctx.fill()
      }

      ctx.restore()
    })
  }, [])

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!isActiveRef.current) return

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    if (canvas && ctx && adaptiveSettings.effectsEnabled) {
      updateParticles(deltaTime)
      renderParticles(ctx)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [updateParticles, renderParticles, adaptiveSettings.effectsEnabled])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Start animation
    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleClick = (e: MouseEvent) => {
      if (adaptiveSettings.effectsEnabled) {
        createFoamBurst(e.clientX, e.clientY)
      }
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('click', handleClick, { passive: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
    }
  }, [createFoamBurst, adaptiveSettings.effectsEnabled])

  // Easter egg effects
  useEffect(() => {
    const handleEasterEgg = (event: CustomEvent) => {
      if (!adaptiveSettings.effectsEnabled) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      switch (event.type) {
        case 'easter:mclaren':
          // McLaren tire smoke effect
          for (let i = 0; i < 50; i++) {
            setTimeout(() => {
              createParticle(centerX + Math.random() * 200 - 100, centerY + 100, 'exhaust')
            }, i * 20)
          }
          break
        
        case 'easter:konami':
          // Massive sparkle explosion
          for (let i = 0; i < 100; i++) {
            createParticle(centerX, centerY, 'sparkle', {
              vx: (Math.random() - 0.5) * 30,
              vy: (Math.random() - 0.5) * 30
            })
          }
          break
        
        case 'easter:jays':
          // Jay's foam party
          for (let i = 0; i < 80; i++) {
            setTimeout(() => {
              createFoamBurst(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                10
              )
            }, i * 50)
          }
          break
      }
    }

    document.addEventListener('easter:mclaren', handleEasterEgg as EventListener)
    document.addEventListener('easter:konami', handleEasterEgg as EventListener)
    document.addEventListener('easter:jays', handleEasterEgg as EventListener)

    return () => {
      document.removeEventListener('easter:mclaren', handleEasterEgg as EventListener)
      document.removeEventListener('easter:konami', handleEasterEgg as EventListener)
      document.removeEventListener('easter:jays', handleEasterEgg as EventListener)
    }
  }, [createParticle, createFoamBurst, adaptiveSettings.effectsEnabled])

  // Performance-based visibility
  useEffect(() => {
    isActiveRef.current = adaptiveSettings.effectsEnabled && !appState.user.preferences.reducedMotion
  }, [adaptiveSettings.effectsEnabled, appState.user.preferences.reducedMotion])

  if (!adaptiveSettings.effectsEnabled || appState.user.preferences.reducedMotion) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 gpu"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  )
}

export default ParticleSystem