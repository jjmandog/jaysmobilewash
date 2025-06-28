// Global type declarations for Jay's Mobile Wash

declare global {
  interface Window {
    JaysMobileWash?: {
      ErrorHandler: any
      LoadingModule: any
      ParticleSystem: any
      McLarenInteractions: any
      ServiceWorkerManager: any
      OfflineManager: any
      LazyLoadManager: any
      MemoryManager: any
      performance: any
    }
    ParticleSystemAPI?: {
      createFoamBurst: (x: number, y: number, count?: number) => void
      createWaterSplash: (x: number, y: number, count?: number) => void
      createWaxShimmer: (x: number, y: number, count?: number) => void
    }
    gtag?: (...args: any[]) => void
  }
}

export {}