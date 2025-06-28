import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Howl, Howler } from 'howler'

interface AudioState {
  isEnabled: boolean
  volume: number
  currentTrack: string | null
  isPlaying: boolean
}

interface AudioContextType {
  state: AudioState
  playSound: (soundId: string, options?: { volume?: number; loop?: boolean }) => void
  playMusic: (trackId: string) => void
  stopMusic: () => void
  setVolume: (volume: number) => void
  toggleEnabled: () => void
  preloadSounds: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

// Sound library
const SOUNDS = {
  engineRev: '/audio/engine-rev.mp3',
  tireSqueal: '/audio/tire-squeal.mp3',
  foamBurst: '/audio/foam-burst.mp3',
  waterSplash: '/audio/water-splash.mp3',
  wiperSwipe: '/audio/wiper-swipe.mp3',
  doorOpen: '/audio/door-open.mp3',
  buttonClick: '/audio/button-click.mp3',
  notification: '/audio/notification.mp3',
  celebration: '/audio/celebration.mp3',
  secretUnlock: '/audio/secret-unlock.mp3'
}

const MUSIC = {
  ambient: '/audio/music/ambient-background.mp3',
  garage: '/audio/music/garage-vibes.mp3',
  electronic: '/audio/music/electronic-chill.mp3'
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AudioState>({
    isEnabled: true,
    volume: 0.7,
    currentTrack: null,
    isPlaying: false
  })

  const soundsRef = useRef<{ [key: string]: Howl }>({})
  const musicRef = useRef<{ [key: string]: Howl }>({})
  const currentMusicRef = useRef<Howl | null>(null)

  // Initialize audio on user interaction
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeAudio = () => {
      if (!isInitialized) {
        preloadSounds()
        setIsInitialized(true)
      }
    }

    // Wait for user interaction
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, initializeAudio, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initializeAudio)
      })
    }
  }, [isInitialized])

  // Set global volume
  useEffect(() => {
    Howler.volume(state.isEnabled ? state.volume : 0)
  }, [state.volume, state.isEnabled])

  const preloadSounds = () => {
    // Preload sound effects
    Object.entries(SOUNDS).forEach(([key, src]) => {
      if (!soundsRef.current[key]) {
        soundsRef.current[key] = new Howl({
          src: [src],
          volume: 0.5,
          preload: true,
          onload: () => console.log(`Sound loaded: ${key}`),
          onloaderror: (error) => console.warn(`Failed to load sound ${key}:`, error)
        })
      }
    })

    // Preload music tracks
    Object.entries(MUSIC).forEach(([key, src]) => {
      if (!musicRef.current[key]) {
        musicRef.current[key] = new Howl({
          src: [src],
          volume: 0.3,
          loop: true,
          preload: false, // Load on demand for music
          onload: () => console.log(`Music loaded: ${key}`),
          onloaderror: (error) => console.warn(`Failed to load music ${key}:`, error)
        })
      }
    })
  }

  const playSound = (
    soundId: string, 
    options: { volume?: number; loop?: boolean } = {}
  ) => {
    if (!state.isEnabled || !isInitialized) return

    const sound = soundsRef.current[soundId]
    if (sound) {
      sound.volume(options.volume ?? 0.5)
      sound.loop(options.loop ?? false)
      sound.play()
    } else {
      console.warn(`Sound not found: ${soundId}`)
    }
  }

  const playMusic = (trackId: string) => {
    if (!state.isEnabled || !isInitialized) return

    // Stop current music
    if (currentMusicRef.current) {
      currentMusicRef.current.stop()
    }

    const music = musicRef.current[trackId]
    if (music) {
      currentMusicRef.current = music
      music.play()
      setState(prev => ({ 
        ...prev, 
        currentTrack: trackId, 
        isPlaying: true 
      }))
    } else {
      console.warn(`Music track not found: ${trackId}`)
    }
  }

  const stopMusic = () => {
    if (currentMusicRef.current) {
      currentMusicRef.current.stop()
      currentMusicRef.current = null
      setState(prev => ({ 
        ...prev, 
        currentTrack: null, 
        isPlaying: false 
      }))
    }
  }

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setState(prev => ({ ...prev, volume: clampedVolume }))
  }

  const toggleEnabled = () => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
  }

  // Easter egg audio events
  useEffect(() => {
    const handleEasterEgg = (event: CustomEvent) => {
      switch (event.type) {
        case 'easter:mclaren':
          playSound('engineRev', { volume: 0.8 })
          setTimeout(() => playSound('tireSqueal', { volume: 0.6 }), 500)
          break
        case 'easter:konami':
          playSound('celebration', { volume: 1.0 })
          break
        case 'easter:jays':
          playSound('secretUnlock', { volume: 0.8 })
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
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach(sound => sound.unload())
      Object.values(musicRef.current).forEach(music => music.unload())
    }
  }, [])

  const contextValue: AudioContextType = {
    state,
    playSound,
    playMusic,
    stopMusic,
    setVolume,
    toggleEnabled,
    preloadSounds
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}