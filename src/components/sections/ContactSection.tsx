import React from 'react'

const ContactSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-8">
          Ready to <span className="text-primary-400">Book</span>?
        </h2>
        <p className="text-lg text-dark-300 mb-8">
          Contact us for McLaren-level mobile car detailing
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="tel:+15622289429" className="btn-primary">
            📞 (562) 228-9429
          </a>
          <button className="btn-secondary">
            📧 Email Us
          </button>
        </div>
      </div>
    </section>
  )
}

export default ContactSection