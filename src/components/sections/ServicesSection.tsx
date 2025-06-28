import React from 'react'

const ServicesSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Our <span className="text-primary-400">Services</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Basic Wash', price: '$70' },
            { name: 'Premium Detail', price: '$130' },
            { name: 'McLaren Special', price: '$200' }
          ].map((service, index) => (
            <div key={index} className="card text-center">
              <h3 className="text-xl font-bold mb-4">{service.name}</h3>
              <p className="text-primary-400 text-2xl font-bold">{service.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection