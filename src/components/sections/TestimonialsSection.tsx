import React from 'react'

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Our <span className="text-mclaren-orange">Clients</span> Say
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <p className="text-dark-300 mb-4">
              "Jay detailed my McLaren 720S and it looks better than when I bought it!"
            </p>
            <div className="text-primary-400 font-bold">- Mike Rodriguez</div>
          </div>
          <div className="card">
            <p className="text-dark-300 mb-4">
              "Professional service and incredible attention to detail."
            </p>
            <div className="text-primary-400 font-bold">- Sarah Chen</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection