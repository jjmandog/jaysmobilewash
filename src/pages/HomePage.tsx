import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

// Components
import HeroSection from '../components/sections/HeroSection'
import McLarenShowcase from '../components/3d/McLarenShowcase'
import ServicesSection from '../components/sections/ServicesSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import ContactSection from '../components/sections/ContactSection'
import WeatherEffects from '../components/effects/WeatherEffects'
import Navigation from '../components/layout/Navigation'
import Footer from '../components/layout/Footer'

// Hooks
import { useApp } from '../context/AppContext'
import { useAudio } from '../context/AudioContext'

const HomePage: React.FC = () => {
  const { state } = useApp()
  const { playMusic, stopMusic } = useAudio()

  // Easter egg handler
  React.useEffect(() => {
    const handleKeySequence = (event: KeyboardEvent) => {
      // Secret sequence to start ambient music
      if (event.ctrlKey && event.key === 'm') {
        playMusic('ambient')
      }
      if (event.ctrlKey && event.key === 's') {
        stopMusic()
      }
    }

    document.addEventListener('keydown', handleKeySequence)
    return () => document.removeEventListener('keydown', handleKeySequence)
  }, [playMusic, stopMusic])

  return (
    <>
      <Helmet>
        <title>Jay's Mobile Wash - McLaren-Level Mobile Car Detailing | Los Angeles & Orange County</title>
        <meta 
          name="description" 
          content="Experience premium mobile car detailing with our interactive 3D McLaren showcase. Professional ceramic coating, paint correction & luxury car care services at your location in LA & OC. Book online now!" 
        />
        <meta 
          name="keywords" 
          content="mobile car detailing, McLaren detailing, ceramic coating, car wash Los Angeles, auto detailing Orange County, luxury car care, paint protection, mobile car wash, Jay's mobile wash" 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jay's Mobile Wash - McLaren-Level Mobile Car Detailing" />
        <meta property="og:description" content="Premium mobile car detailing with 3D McLaren visualization and interactive effects. Professional services at your location." />
        <meta property="og:image" content="https://jaysmobilewash.net/images/og-image-mclaren.jpg" />
        <meta property="og:url" content="https://jaysmobilewash.net/" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jay's Mobile Wash - McLaren-Level Mobile Car Detailing" />
        <meta name="twitter:description" content="Premium mobile car detailing with 3D McLaren visualization and interactive effects." />
        <meta name="twitter:image" content="https://jaysmobilewash.net/images/twitter-card-mclaren.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Jay's Mobile Wash",
            "description": "Premium mobile car detailing service specializing in luxury vehicles with McLaren-certified techniques and 3D visualization technology.",
            "url": "https://jaysmobilewash.net",
            "telephone": "+1-562-228-9429",
            "email": "info@jaysmobilewash.net",
            "priceRange": "$$-$$$",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Los Angeles",
              "addressRegion": "CA",
              "addressCountry": "US",
              "areaServed": ["Los Angeles County", "Orange County"]
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "34.0522",
              "longitude": "-118.2437"
            },
            "openingHours": "Mo-Su 07:00-19:00",
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "34.0522",
                "longitude": "-118.2437"
              },
              "geoRadius": "50 miles"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Mobile Car Detailing Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Premium McLaren Detail",
                    "description": "Complete exterior and interior detailing with ceramic coating and paint protection",
                    "serviceType": "Mobile Car Detailing"
                  },
                  "price": "200",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Basic Wash & Wax",
                    "description": "Exterior wash with premium wax application",
                    "serviceType": "Mobile Car Wash"
                  },
                  "price": "70",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Interior Deep Clean",
                    "description": "Complete interior detailing with steam cleaning",
                    "serviceType": "Car Interior Cleaning"
                  },
                  "price": "130",
                  "priceCurrency": "USD"
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "247",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Mike Rodriguez"
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5"
                },
                "reviewBody": "Jay detailed my McLaren 720S and it looks better than when I bought it! The attention to detail is incredible."
              }
            ]
          })}
        </script>
        
        {/* FAQ Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Do you work on luxury cars like McLaren?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! We specialize in high-end luxury vehicles and are certified to work on McLaren, Ferrari, Lamborghini, and other exotic cars with specialized techniques and premium products."
                }
              },
              {
                "@type": "Question",
                "name": "What areas do you serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We provide mobile car detailing services throughout Los Angeles County and Orange County, with a 50-mile service radius from downtown LA."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a full detail take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A complete McLaren-level detail typically takes 3-4 hours, depending on the vehicle's condition and selected services. We work efficiently while maintaining our high standards."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
        {/* Navigation */}
        <Navigation />

        {/* Weather Effects */}
        <WeatherEffects />

        {/* Hero Section with McLaren */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <HeroSection />
        </motion.div>

        {/* McLaren 3D Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <McLarenShowcase />
        </motion.section>

        {/* Services Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          id="services"
        >
          <ServicesSection />
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          id="testimonials"
        >
          <TestimonialsSection />
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          id="contact"
        >
          <ContactSection />
        </motion.section>

        {/* Footer */}
        <Footer />

        {/* Easter Egg Indicator */}
        {state.easter.unlockedSecrets.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-mclaren-orange to-primary-500 p-3 rounded-full shadow-lg">
              <span className="text-white font-bold">
                🎉 {state.easter.unlockedSecrets.length} secret{state.easter.unlockedSecrets.length > 1 ? 's' : ''} unlocked!
              </span>
            </div>
          </motion.div>
        )}

        {/* Hidden Tips */}
        <div className="sr-only">
          <p>Pro tip: Try typing "MCLAREN" or use the Konami code for hidden features!</p>
          <p>Press Ctrl+M for ambient music, Ctrl+S to stop</p>
          <p>Click anywhere to create foam effects</p>
        </div>
      </div>
    </>
  )
}

export default HomePage