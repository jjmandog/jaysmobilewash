/**
 * Example usage of SPA SEO Head Manager for Jay's Mobile Wash
 * This file demonstrates how to use the SPA SEO Head Manager utility
 */

// Example 1: Update SEO for a service page
function updateServicePageSEO(serviceName, serviceDescription) {
    window.updatePageSEO({
        title: `${serviceName} | Jay's Mobile Wash - Los Angeles & Orange County`,
        description: `${serviceDescription} Call 562-228-9429 for professional mobile detailing services.`,
        canonical: `https://www.jaysmobilewash.net/services/${serviceName.toLowerCase().replace(/\s+/g, '-')}/`,
        keywords: `${serviceName.toLowerCase()}, mobile detailing, los angeles, orange county, ceramic coating`,
        openGraph: {
            title: `${serviceName} - Jay's Mobile Wash`,
            description: serviceDescription,
            image: `https://www.jaysmobilewash.net/images/${serviceName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            type: 'website'
        },
        twitterCard: {
            title: `${serviceName} - Jay's Mobile Wash`,
            description: serviceDescription,
            image: `https://www.jaysmobilewash.net/images/${serviceName.toLowerCase().replace(/\s+/g, '-')}-twitter.jpg`
        }
    });
}

// Example 2: Update SEO for a location page
function updateLocationPageSEO(locationName, locationDetails) {
    const businessData = {
        name: `Jay's Mobile Wash - ${locationName}`,
        description: `Premium mobile car detailing services in ${locationName}. ${locationDetails}`,
        url: `https://www.jaysmobilewash.net/locations/${locationName.toLowerCase().replace(/\s+/g, '-')}/`,
        phone: "+15622289429",
        address: {
            "@type": "PostalAddress",
            "addressLocality": locationName,
            "addressRegion": "CA",
            "addressCountry": "US"
        },
        areaServed: [locationName, "Los Angeles County", "Orange County"]
    };

    window.updatePageSEO({
        title: `Mobile Car Detailing in ${locationName} | Jay's Mobile Wash`,
        description: `Professional mobile detailing services in ${locationName}. ${locationDetails} Call 562-228-9429 to book.`,
        canonical: businessData.url,
        keywords: `mobile detailing ${locationName.toLowerCase()}, car wash ${locationName.toLowerCase()}, ceramic coating ${locationName.toLowerCase()}`,
        structuredData: window.SPASEOManager.generateLocalBusinessStructuredData(businessData)
    });
}

// Example 3: Update SEO for promotional content
function updatePromotionalSEO(promoTitle, promoDescription, promoKeywords) {
    window.updatePageSEO({
        title: `${promoTitle} | Jay's Mobile Wash Special Offer`,
        description: `${promoDescription} Limited time offer from Jay's Mobile Wash. Call 562-228-9429`,
        keywords: `${promoKeywords}, mobile detailing specials, car wash deals, los angeles`,
        openGraph: {
            title: promoTitle,
            description: promoDescription,
            image: 'https://www.jaysmobilewash.net/images/special-offer.jpg'
        }
    });
}

// Example usage calls:
// updateServicePageSEO('Ceramic Coating', 'Professional ceramic coating service that protects your vehicle\'s paint for years.');
// updateLocationPageSEO('Beverly Hills', 'Luxury mobile detailing for high-end vehicles in Beverly Hills and surrounding areas.');
// updatePromotionalSEO('50% Off First Service', 'Get 50% off your first mobile detailing service. New customers only.', 'discount, first time customer, mobile detailing deal');

// Example 4: Dynamic SEO based on user interaction
function handleServiceSelection(serviceType) {
    const serviceConfig = {
        'interior': {
            title: 'Interior Detailing Services',
            description: 'Complete interior cleaning, vacuuming, and protection services for your vehicle.',
            keywords: 'interior detailing, car interior cleaning, upholstery cleaning'
        },
        'exterior': {
            title: 'Exterior Detailing Services', 
            description: 'Hand wash, wax, paint correction and exterior protection services.',
            keywords: 'exterior detailing, car wash, paint correction, wax'
        },
        'ceramic': {
            title: 'Ceramic Coating Services',
            description: 'Professional ceramic coating application for long-lasting paint protection.',
            keywords: 'ceramic coating, paint protection, long lasting shine'
        }
    };

    if (serviceConfig[serviceType]) {
        const config = serviceConfig[serviceType];
        updateServicePageSEO(config.title, config.description);
    }
}

// Example 5: Reset SEO when navigating away or returning to default state
function resetToDefaultSEO() {
    window.resetSEO();
    console.log('SEO reset to original page values');
}