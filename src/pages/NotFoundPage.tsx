import React from 'react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  )
}

export default NotFoundPage