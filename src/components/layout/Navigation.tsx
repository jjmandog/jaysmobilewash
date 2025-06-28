import React from 'react'
import { Link } from 'react-router-dom'

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gradient">
            Jay's Mobile Wash
          </Link>
          <div className="hidden md:flex space-x-8">
            <a href="#services" className="nav-link">Services</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/about-jays-company" className="nav-link">About</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation