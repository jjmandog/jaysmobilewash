import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const AboutJaysCompany: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About Jay's Company - The Story Behind McLaren-Level Mobile Detailing</title>
        <meta 
          name="description" 
          content="Discover the story behind Jay's Mobile Wash, from humble beginnings to becoming the premier McLaren-certified mobile car detailing service in Los Angeles and Orange County. Learn about our mission, values, and commitment to excellence." 
        />
        <meta 
          name="keywords" 
          content="Jay's Mobile Wash history, mobile car detailing company, McLaren certified detailer, Los Angeles car care business, automotive detailing expertise, luxury car service provider" 
        />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About Jay's Company - The Story Behind McLaren-Level Mobile Detailing" />
        <meta property="og:description" content="From passion project to premier mobile detailing service - discover the journey of Jay's Mobile Wash." />
        <meta property="og:url" content="https://jaysmobilewash.net/about-jays-company" />
        <meta property="og:type" content="article" />
        
        {/* Structured Data for Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Jay's Mobile Wash",
            "alternateName": "Jay's Company",
            "description": "Premier mobile car detailing service specializing in luxury vehicles with McLaren-certified techniques.",
            "url": "https://jaysmobilewash.net",
            "logo": "https://jaysmobilewash.net/images/logo.png",
            "foundingDate": "2018",
            "founder": {
              "@type": "Person",
              "name": "Jay",
              "jobTitle": "Founder & Master Detailer"
            },
            "location": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Los Angeles",
                "addressRegion": "CA",
                "addressCountry": "US"
              }
            },
            "areaServed": [
              {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 34.0522,
                  "longitude": -118.2437
                },
                "geoRadius": "50 miles"
              }
            ],
            "knowsAbout": [
              "McLaren Detailing",
              "Luxury Car Care",
              "Ceramic Coating",
              "Paint Protection",
              "Mobile Car Detailing",
              "Automotive Restoration"
            ],
            "award": [
              "McLaren Certified Detailing Partner",
              "Los Angeles Best Mobile Detailer 2023",
              "Orange County Premium Service Award"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-dark-900 text-white">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-mclaren-orange/20" />
          <div className="relative max-w-7xl mx-auto px-4 py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
                <span className="text-gradient">About Jay's</span>
                <br />
                <span className="text-mclaren-orange">Company</span>
              </h1>
              <p className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto">
                The story behind McLaren-level mobile detailing excellence
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
          
          {/* Origin Story */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              From Passion to <span className="text-mclaren-orange">Profession</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-dark-300 leading-relaxed">
                  It all started in 2018 when Jay, a lifelong automotive enthusiast, 
                  was frustrated with the lack of premium mobile car care services in 
                  Los Angeles. After his own McLaren 570S received subpar treatment 
                  at a traditional car wash, he decided to take matters into his own hands.
                </p>
                
                <p className="text-lg text-dark-300 leading-relaxed">
                  What began as detailing cars for friends and family quickly evolved 
                  into something bigger. Word spread about Jay's meticulous attention 
                  to detail and his innovative approach to mobile car care.
                </p>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-mclaren-orange/20 to-primary-500/20 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏎️</div>
                    <div className="text-2xl font-bold text-mclaren-orange">2018</div>
                    <div className="text-dark-400">Founded</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Mission & Values */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              Our <span className="text-primary-400">Mission</span> & Values
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  title: 'Precision',
                  description: 'Every detail matters. We treat every vehicle with the same care we\'d give a McLaren P1.'
                },
                {
                  icon: '🏆',
                  title: 'Excellence',
                  description: 'We don\'t just meet expectations – we exceed them. Our standards are as high as our clients\'.'
                },
                {
                  icon: '🤝',
                  title: 'Trust',
                  description: 'Your vehicle is your pride and joy. We honor that trust with every service we provide.'
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="card text-center"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-mclaren-orange">{value.title}</h3>
                  <p className="text-dark-300">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* McLaren Partnership */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-mclaren-orange/10 to-primary-500/10 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="text-mclaren-orange">McLaren</span> Certified Partner
            </h2>
            
            <div className="text-center space-y-6">
              <p className="text-lg text-dark-300 leading-relaxed max-w-3xl mx-auto">
                In 2021, Jay's Mobile Wash achieved a milestone that few detailing 
                services can claim: official McLaren certification. This recognition 
                validates our commitment to the highest standards of automotive care 
                and our deep understanding of luxury vehicle requirements.
              </p>
              
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-mclaren-orange">500+</div>
                  <div className="text-dark-400">McLarens Detailed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-400">98%</div>
                  <div className="text-dark-400">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-mclaren-blue">24/7</div>
                  <div className="text-dark-400">Availability</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Innovation & Technology */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Innovation & <span className="text-primary-400">Technology</span>
            </h2>
            
            <div className="space-y-8">
              <p className="text-lg text-dark-300 leading-relaxed text-center max-w-3xl mx-auto">
                We're not just about traditional car care. Jay's Mobile Wash embraces 
                cutting-edge technology to enhance every aspect of our service, from 
                our interactive 3D vehicle showcases to our advanced booking system.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: '3D Vehicle Visualization',
                    description: 'Interactive McLaren models that showcase our capabilities and let customers explore every detail.'
                  },
                  {
                    title: 'Real-Time Tracking',
                    description: 'Know exactly when we\'ll arrive with our GPS-enabled scheduling system.'
                  },
                  {
                    title: 'Advanced Products',
                    description: 'We use only the latest ceramic coatings and protection technologies.'
                  },
                  {
                    title: 'Digital Documentation',
                    description: 'Before and after photos, service records, and maintenance recommendations.'
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-dark-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Team & Expertise */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Meet the <span className="text-mclaren-orange">Team</span>
            </h2>
            
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-gradient-to-br from-mclaren-orange to-primary-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">👨‍🔧</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Jay - Founder & Master Detailer</h3>
                <p className="text-mclaren-orange mb-4">McLaren Certified | 10+ Years Experience</p>
                <p className="text-dark-300 max-w-2xl mx-auto">
                  "Every car tells a story, and my job is to help it shine while telling that story. 
                  Whether it's a daily driver or a million-dollar supercar, it deserves the best care possible."
                </p>
              </div>
            </div>
          </motion.section>

          {/* Future Vision */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">
              Looking to the <span className="text-primary-400">Future</span>
            </h2>
            
            <p className="text-lg text-dark-300 leading-relaxed max-w-3xl mx-auto mb-8">
              As we continue to grow, our commitment remains unchanged: providing 
              McLaren-level service to every client, one vehicle at a time. We're 
              constantly innovating, learning, and pushing the boundaries of what 
              mobile car care can be.
            </p>
            
            <Link 
              to="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Experience Our Service</span>
              <span>🏎️</span>
            </Link>
          </motion.section>
        </div>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500/20 to-mclaren-orange/20 py-16"
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lg text-dark-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who trust Jay's Mobile Wash 
              with their automotive pride and joy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+15622289429"
                className="btn-primary"
              >
                📞 Call (562) 228-9429
              </a>
              <Link 
                to="/#contact"
                className="btn-secondary"
              >
                📧 Book Online
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  )
}

export default AboutJaysCompany