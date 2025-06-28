import React from 'react'

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">
          <span className="text-gradient">Jay's</span>
          <br />
          <span className="text-mclaren-orange">Mobile Wash</span>
        </h1>
        <p className="text-xl md:text-2xl text-dark-300 mb-8">
          McLaren-Level Detailing at Your Location
        </p>
        <button className="btn-primary">
          Book Service Now
        </button>
      </div>
    </section>
  )
}

export default HeroSection