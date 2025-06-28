# Jay's Mobile Wash - McLaren-Level Mobile Car Detailing 🏎️

A premium React-based website featuring interactive 3D McLaren visualization, particle effects, weather-responsive design, and comprehensive offline functionality. Built with TypeScript, Vite, and modern web technologies.

## 🌟 Features

### 🚀 Core Features
- **Interactive 3D McLaren Showcase** - Click wheels to spin, engine to rev, interactive sound effects
- **Dynamic Particle System** - Foam bursts, water splashes, exhaust smoke, and wax shimmer effects
- **Weather-Based Effects** - Real-time weather integration with adaptive UI and particle effects
- **Time-Aware Interface** - Dynamic greetings and styling based on time of day
- **Offline-First PWA** - Comprehensive service worker with intelligent caching strategies
- **Audio System** - Interactive sound effects and ambient music with user controls
- **Performance Monitoring** - Adaptive settings based on device capabilities and performance

### 🎮 Interactive Features
- **Easter Eggs** - Hidden features unlocked by keyboard sequences:
  - Type "MCLAREN" for tire smoke effects
  - Use Konami code (↑↑↓↓←→←→BA) for particle explosion
  - Type "JAYS" for foam party
  - Ctrl+M for ambient music, Ctrl+S to stop
- **Click Interactions** - Click anywhere for foam effects
- **McLaren Interactions** - Interactive car parts with sound and visual feedback
- **Accessibility** - Full keyboard navigation, screen reader support, reduced motion support

### 🔧 Technical Features
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom animations and McLaren-themed design
- **Framer Motion** for smooth animations and transitions
- **Three.js Integration** ready for future 3D model enhancements
- **Progressive Web App** with offline functionality and push notifications
- **SEO Optimized** with structured data, meta tags, and sitemap
- **Error Boundaries** with graceful fallbacks
- **Performance Adaptive** - Automatically adjusts features based on device capabilities

## 📁 Project Structure

```
src/
├── components/
│   ├── 3d/                 # 3D components and McLaren showcase
│   ├── effects/            # Particle system and weather effects
│   ├── interactive/        # Interactive components
│   ├── layout/            # Navigation, footer, layout components
│   ├── sections/          # Page sections (Hero, Services, etc.)
│   └── ui/                # Reusable UI components
├── context/               # React context providers
│   ├── AppContext.tsx     # Global app state and easter eggs
│   ├── AudioContext.tsx   # Audio system management
│   └── PerformanceContext.tsx # Performance monitoring
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
│   ├── HomePage.tsx       # Main landing page
│   ├── AboutJaysCompany.tsx # Hidden SEO page
│   └── ServicesPage.tsx   # Services page
├── styles/               # CSS and styling
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── assets/               # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/jjmandog/jaysmobilewash.git
cd jaysmobilewash

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run deploy       # Deploy to GitHub Pages
```

## 🎯 SEO & Performance

### SEO Features
- **Structured Data** - Rich snippets for local business, services, and FAQs
- **Meta Tags** - Comprehensive Open Graph and Twitter Card support
- **Sitemap** - Dynamic XML sitemap with all pages
- **Hidden SEO Page** - `/about-jays-company` for additional SEO content
- **Canonical URLs** - Proper URL canonicalization
- **Accessibility** - WCAG compliant with proper ARIA labels

### Performance Optimizations
- **Code Splitting** - Automatic route-based code splitting
- **Asset Optimization** - Image and asset optimization
- **Lazy Loading** - Components and images loaded on demand
- **Service Worker** - Intelligent caching with offline support
- **Performance Monitoring** - Real-time FPS and memory monitoring
- **Adaptive Features** - Performance-based feature scaling

## 🎮 Easter Eggs & Interactive Features

### Keyboard Sequences
- **MCLAREN** - Tire smoke particle effect with sound
- **Konami Code** (↑↑↓↓←→←→BA) - Massive sparkle explosion
- **JAYS** - Multi-location foam party effect
- **Ctrl+M** - Start ambient background music
- **Ctrl+S** - Stop background music

### Mouse Interactions
- **Click anywhere** - Create foam burst effects
- **McLaren wheels** - Click to spin with tire squeal sound
- **McLaren body** - Click for engine rev effect
- **McLaren windshield** - Click for wiper action
- **McLaren door area** - Click for door sound

### Weather Integration
- **Rain Effects** - Animated rain particles
- **Night Mode** - Starfield effects and moon theme
- **Sunny Weather** - Optimized for exterior detailing messaging
- **Dynamic Greetings** - Time-based welcome messages

## 🔧 Configuration

### Environment Variables
```bash
# Optional API keys for enhanced features
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_ANALYTICS_ID=your_analytics_id
VITE_DOMAIN=https://jaysmobilewash.net
```

### Build Configuration
The project uses Vite with custom configuration for:
- PWA functionality with Workbox
- Asset optimization and compression
- Code splitting and chunk optimization
- TypeScript and React support

## 📱 PWA Features

### Offline Functionality
- **Static Asset Caching** - Core files cached for offline use
- **Dynamic Caching** - API responses and images cached intelligently
- **Background Sync** - Form submissions queued when offline
- **Update Notifications** - Automatic app update prompts

### Installation
- **Add to Home Screen** - iOS and Android support
- **App Shortcuts** - Quick actions from home screen
- **Splash Screen** - Custom loading screen
- **Push Notifications** - Service booking reminders (future)

## 🎨 Design System

### Color Palette
- **Primary Purple** - #b530ff (Jay's brand color)
- **McLaren Orange** - #ff6b35 (McLaren accent)
- **McLaren Blue** - #00d4ff (Water/detail effects)
- **Carbon Fiber** - #1a1a1a (Luxury automotive)
- **Dark Theme** - Various shades for depth

### Typography
- **Display Font** - Orbitron (futuristic, automotive)
- **Body Font** - Inter (clean, readable)
- **Responsive Scaling** - Fluid typography

### Animations
- **Particle Effects** - Canvas-based particle system
- **Micro Interactions** - Hover and click effects
- **Page Transitions** - Smooth route transitions
- **Loading States** - Engaging loading animations

## 🔍 Technical Deep Dive

### Architecture Decisions
- **Context-based State Management** - Avoiding prop drilling
- **Component Composition** - Reusable, composable components
- **Performance First** - Adaptive features based on device capabilities
- **Accessibility First** - Built with a11y in mind from the start
- **Progressive Enhancement** - Works without JavaScript

### Key Technologies
- **React 18** - Latest React features including concurrent rendering
- **TypeScript** - Type safety throughout the application
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Howler.js** - Audio management and spatial audio
- **Workbox** - Advanced service worker functionality

### Performance Monitoring
- **FPS Tracking** - Real-time frame rate monitoring
- **Memory Usage** - JavaScript heap size tracking
- **Adaptive Settings** - Automatic quality adjustment
- **Web Vitals** - Core web vitals measurement
- **Error Tracking** - Comprehensive error boundaries

## 📞 Contact & Support

- **Phone**: [+1 (562) 228-9429](tel:+15622289429)
- **Email**: info@jaysmobilewash.net
- **Website**: [jaysmobilewash.net](https://jaysmobilewash.net)
- **Service Areas**: Los Angeles County & Orange County

## 📄 License

© 2025 Jay's Mobile Wash. All rights reserved.

---

## 🏆 Awards & Recognition

- **McLaren Certified Detailing Partner** (2021)
- **Los Angeles Best Mobile Detailer** (2023)
- **Orange County Premium Service Award** (2023)

---

Built with ❤️ and precision by the Jay's Mobile Wash team. Experience McLaren-level mobile car detailing today!