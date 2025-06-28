import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '../../context/AudioContext'

const McLarenShowcase: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const { playSound } = useAudio()

  // Interactive McLaren SVG handlers
  const handleWheelSpin = (wheel: 'front' | 'rear') => {
    const wheelElement = svgRef.current?.querySelector(`.${wheel}-wheel`)
    if (wheelElement) {
      wheelElement.classList.add('animate-spin')
      playSound('tireSqueal', { volume: 0.4 })
      setTimeout(() => {
        wheelElement.classList.remove('animate-spin')
      }, 2000)
    }
  }

  const handleEngineRev = () => {
    playSound('engineRev', { volume: 0.6 })
    const carBody = svgRef.current?.querySelector('.car-body')
    if (carBody) {
      carBody.classList.add('animate-pulse')
      setTimeout(() => {
        carBody.classList.remove('animate-pulse')
      }, 1000)
    }
  }

  const handleWiperAction = () => {
    playSound('wiperSwipe', { volume: 0.3 })
    // Trigger wiper animation
  }

  const handleDoorOpen = () => {
    playSound('doorOpen', { volume: 0.5 })
    // Trigger door animation
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Interactive <span className="text-mclaren-orange">McLaren</span>
          </h2>
          <p className="text-lg text-dark-300 max-w-3xl mx-auto">
            Explore our 3D McLaren showcase. Click on different parts to see interactive effects!
          </p>
        </motion.div>

        {/* Interactive McLaren SVG */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 800 400"
            className="w-full max-w-4xl mx-auto h-auto"
            style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
          >
            {/* Car Body */}
            <g className="car-body">
              {/* Main body */}
              <path
                d="M100 250 Q120 200 200 200 L600 200 Q680 200 700 250 L700 300 Q700 320 680 320 L120 320 Q100 320 100 300 Z"
                fill="url(#carGradient)"
                className="hover:fill-mclaren-orange/80 transition-colors cursor-pointer"
                onClick={handleEngineRev}
              />
              
              {/* Windows */}
              <path
                d="M150 200 Q150 180 170 180 L250 180 Q270 180 270 200 L270 220 L150 220 Z"
                fill="rgba(0,0,0,0.8)"
                className="transition-opacity hover:opacity-60"
              />
              <path
                d="M530 200 Q530 180 550 180 L630 180 Q650 180 650 200 L650 220 L530 220 Z"
                fill="rgba(0,0,0,0.8)"
                className="transition-opacity hover:opacity-60"
                onClick={handleWiperAction}
              />
            </g>

            {/* Wheels */}
            <circle
              cx="200"
              cy="300"
              r="40"
              fill="url(#wheelGradient)"
              className="front-wheel cursor-pointer hover:stroke-mclaren-blue hover:stroke-4 transition-all"
              onClick={() => handleWheelSpin('front')}
            />
            <circle
              cx="600"
              cy="300"
              r="40"
              fill="url(#wheelGradient)"
              className="rear-wheel cursor-pointer hover:stroke-mclaren-blue hover:stroke-4 transition-all"
              onClick={() => handleWheelSpin('rear')}
            />

            {/* Headlights */}
            <ellipse
              cx="120"
              cy="240"
              rx="25"
              ry="15"
              fill="url(#lightGradient)"
              className="headlight-glow animate-pulse"
            />

            {/* Door (clickable) */}
            <rect
              x="300"
              y="220"
              width="80"
              height="80"
              fill="transparent"
              className="cursor-pointer hover:fill-white/10 transition-all"
              onClick={handleDoorOpen}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="50%" stopColor="#e55a2b" />
                <stop offset="100%" stopColor="#cc4925" />
              </linearGradient>
              
              <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#333" />
                <stop offset="50%" stopColor="#666" />
                <stop offset="100%" stopColor="#333" />
              </linearGradient>
              
              <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#0099cc" />
              </radialGradient>
            </defs>
          </svg>

          {/* Interactive Hints */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 animate-bounce">
              <div className="bg-primary-500 text-white text-xs px-2 py-1 rounded">
                Click wheels to spin!
              </div>
            </div>
            <div className="absolute top-1/3 right-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="bg-mclaren-orange text-white text-xs px-2 py-1 rounded">
                Click body for engine rev!
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature callouts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              icon: '🏎️',
              title: 'McLaren Expertise',
              description: 'Certified techniques for supercar care'
            },
            {
              icon: '🎯',
              title: 'Precision Detailing',
              description: 'Every surface treated with precision'
            },
            {
              icon: '✨',
              title: 'Interactive Experience',
              description: 'See our process in stunning detail'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="card text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-mclaren-orange">{feature.title}</h3>
              <p className="text-dark-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default McLarenShowcase