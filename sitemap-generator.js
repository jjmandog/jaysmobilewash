// Automatic sitemap generator for dynamic updates
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.jaysmobilewash.net';
const LOCATIONS_LA = [
    'los-angeles', 'beverly-hills', 'santa-monica', 'long-beach', 
    'pasadena', 'malibu', 'torrance', 'gardena', 'manhattan-beach',
    'hermosa-beach', 'redondo-beach', 'el-segundo', 'culver-city',
    'west-la', 'glendale', 'burbank', 'studio-city', 'sherman-oaks'
];

const LOCATIONS_OC = [
    'orange-county', 'newport-beach', 'huntington-beach', 'irvine',
    'anaheim', 'laguna-beach', 'costa-mesa', 'dana-point',
    'san-clemente', 'mission-viejo', 'laguna-niguel', 'aliso-viejo',
    'fullerton', 'buena-park', 'tustin', 'orange'
];

const SERVICES = [
    'mobile-detailing', 'ceramic-coating', 'paint-correction',
    'mobile-car-wash', 'engine-bay-cleaning', 'headlight-restoration',
    'pet-hair-removal', 'odor-elimination', 'tar-bug-removal',
    'paint-touch-up'
];

function generateLocationServiceCombos() {
    const combos = [];
    const highValueServices = ['ceramic-coating', 'paint-correction', 'mobile-detailing'];
    const highValueLocations = ['beverly-hills', 'newport-beach', 'santa-monica', 'malibu'];
    
    // Generate high-value combinations
    highValueServices.forEach(service => {
        highValueLocations.forEach(location => {
            combos.push({
                loc: `${BASE_URL}/${service}-${location}/`,
                priority: 0.9,
                changefreq: 'weekly'
            });
        });
    });
    
    return combos;
}

function generateDynamicSitemap() {
    const now = new Date().toISOString();
    const locationServiceCombos = generateLocationServiceCombos();
    
    // Add dynamic entries to sitemap
    console.log('Generated', locationServiceCombos.length, 'location-service combo URLs');
    
    // Write to file
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locationServiceCombos.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
    
    fs.writeFileSync('sitemap-dynamic.xml', sitemapContent);
    console.log('Dynamic sitemap generated successfully!');
}

// Run generator
generateDynamicSitemap();
