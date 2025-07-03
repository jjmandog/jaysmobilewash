import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to full site after 3 seconds
    const timer = setTimeout(() => {
      router.push('/index.html');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mobile Detailing Los Angeles & Orange County | Jay&apos;s Mobile Wash - #1 Car Detailing Service</title>
        <meta name="description" content="★★★★★ Premium mobile car detailing in Los Angeles & Orange County. Ceramic coating, paint correction, interior detailing. We come to you! Call 562-228-9429" />
        
        {/* Enhanced SEO Meta Tags */}
        <meta name="keywords" content="mobile detailing los angeles, mobile car wash orange county, ceramic coating near me, paint correction los angeles, mobile auto detailing, car detailing near me, mobile car detailing, ceramic coating los angeles, paint correction orange county" />
        <meta name="author" content="Jay's Mobile Wash" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        
        {/* Geo Meta Tags */}
        <meta name="geo.region" content="US-CA" />
        <meta name="geo.placename" content="Los Angeles, Orange County" />
        <meta name="geo.position" content="33.8743;-118.2827" />
        <meta name="ICBM" content="33.8743, -118.2827" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Mobile Detailing Los Angeles & Orange County | Jay's Mobile Wash" />
        <meta property="og:description" content="Premium mobile car detailing services. Ceramic coating, paint correction, interior detailing. We come to you! ⭐⭐⭐⭐⭐ Rated" />
        <meta property="og:image" content="https://jaysmobilewash.net/og-image.jpg" />
        <meta property="og:image:alt" content="Professional mobile car detailing service in Los Angeles" />
        <meta property="og:url" content="https://www.jaysmobilewash.net" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Jay's Mobile Wash" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mobile Detailing Los Angeles & Orange County | Jay's Mobile Wash" />
        <meta name="twitter:description" content="Premium mobile car detailing. Ceramic coating & paint correction experts. Call 562-228-9429" />
        <meta name="twitter:image" content="https://jaysmobilewash.net/twitter-image.jpg" />
        <meta name="twitter:site" content="@jaysmobilewash" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.jaysmobilewash.net/" />
        
        {/* Favicon fixes */}
        <link rel="icon" type="image/png" href="https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png" />
        <link rel="shortcut icon" href="https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png" />
        <link rel="apple-touch-icon" href="https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png" />
        <meta name="theme-color" content="#13131a" />
        
        {/* Preconnect and DNS Prefetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" as="style" />
        <link rel="preload" href="mobile-detailing.PNG" as="image" />
        <link rel="preload" href="https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png" as="image" />
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        
        {/* Tailwind CSS - Added via dangerouslySetInnerHTML to avoid sync script warning */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.head.appendChild(Object.assign(document.createElement('script'), {
            src: 'https://cdn.tailwindcss.com'
          }));
        ` }} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://www.jaysmobilewash.net/#organization",
          "name": "Jay&apos;s Mobile Wash",
          "alternateName": "Jay&apos;s Mobile Car Detailing",
          "url": "https://www.jaysmobilewash.net",
          "logo": "https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png",
          "telephone": "+15622289429",
          "priceRange": "$70-$1299",
          "description": "Professional mobile car detailing and ceramic coating services throughout Los Angeles and Orange County. We bring the car wash to you!",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "16845 S Hoover St",
            "addressLocality": "Gardena",
            "addressRegion": "CA",
            "postalCode": "90247",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "33.8743",
            "longitude": "-118.2827"
          },
          "areaServed": [
            {
              "@type": "City",
              "name": "Los Angeles"
            },
            {
              "@type": "City", 
              "name": "Orange County"
            }
          ]
        }) }} />
      </Head>
      
      {/* External Scripts */}
      <Script src="spa-seo-head-manager.js" strategy="afterInteractive" />
      <Script src="main.js" strategy="afterInteractive" />
      <Script src="chatbot-handler.js" strategy="afterInteractive" />
      <Script src="invalid-route-handler.js" strategy="afterInteractive" />
      
      {/* Clean auto-redirecting landing page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <img 
              src="https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png" 
              alt="Jay's Mobile Wash Logo" 
              className="h-32 w-32 mx-auto mb-6 animate-pulse"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Jay&apos;s Mobile Wash
            </h1>
            <p className="text-2xl mb-6 text-gray-300">Premium Mobile Car Detailing</p>
            <p className="text-lg text-purple-300 mb-4">
              Los Angeles & Orange County
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              <span>Loading your premium experience...</span>
            </div>
            
            <div className="text-center">
              <p className="text-lg mb-2">
                <span className="text-yellow-400">★★★★★</span> Rated Service
              </p>
              <p className="text-sm text-gray-400">
                Call us: <span className="text-white font-semibold">562-228-9429</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}