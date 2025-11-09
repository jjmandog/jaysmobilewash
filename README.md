# Jay's Mobile Wash - Website

[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-90%2B-success)](https://jaysmobilewash.net)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)]()
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)]()

## About
Premium mobile car detailing service website for Jay's Mobile Wash, serving Los Angeles County and Orange County with professional automotive care services.

**Live Site**: [https://jaysmobilewash.net](https://jaysmobilewash.net)

## Features
- ⚡ **Optimized Performance** - Lighthouse score 90+, Core Web Vitals optimized
- 📱 **Progressive Web App (PWA)** - Installable, offline-capable mobile experience
- 🎨 **Modern Design** - TailwindCSS with purple/pink gradient theme
- 🔍 **Advanced SEO** - Schema.org markup, local business optimization, geo-targeting
- ♿ **Accessibility** - WCAG compliant, screen reader optimized
- 🚀 **Fast Loading** - Service worker caching, optimized assets
- 📊 **Structured Data** - Rich snippets for search engines

## Technologies Used
- **Framework**: Next.js 15.3.4 (static export + API routes)
- **Styling**: TailwindCSS 4.1.11 (via CDN)
- **Runtime**: Node.js ES Modules
- **Testing**: Vitest 3.2.4 with jsdom
- **Deployment**: Vercel with serverless functions
- **PWA**: Service Worker + Web App Manifest
- **Performance**: Lighthouse CI, automated audits

## SEO Implementations
✅ Schema.org LocalBusiness markup  
✅ Service-specific structured data  
✅ Voice search optimization  
✅ Geo-targeting (LA & Orange County)  
✅ Multiple specialized XML sitemaps  
✅ Optimized robots.txt  
✅ Meta tags for social sharing (OG, Twitter)  
✅ Canonical URLs  
✅ Rich snippets enabled  

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/jjmandog/jaysmobilewash.git

# Navigate to project directory
cd jaysmobilewash

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the site.

### Development Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:coverage # Generate coverage report
npm run lighthouse   # Run performance audits
npm run audit:all    # Full quality audit
npm run deploy       # Deploy to production
```

## Project Structure
```
jaysmobilewash/
├── api/                    # Serverless API functions
│   └── send-sms.js        # SMS notification endpoint
├── pages/                 # Next.js pages
│   └── index.js           # Landing page
├── public/                # Static assets
│   └── index.html         # Main HTML (backup)
├── src/                   # Source code
│   ├── constants/         # Configuration constants
│   └── utils/             # Utility functions
├── scripts/               # Build and validation scripts
│   ├── lighthouse-performance.js
│   ├── seo-prerender-validator.js
│   └── critical-css-validator.js
├── tests/                 # Test suite
├── index.html             # Main entry point (4400+ lines)
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker (v6)
├── next.config.js         # Next.js configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## Key Files
- **`index.html`** - Main website with all content
- **`manifest.json`** - PWA configuration
- **`service-worker.js`** - Offline functionality (cache v6)
- **`robots.txt`** - Search engine directives
- **`sitemap.xml`** - Main sitemap index
- **`vercel.json`** - Deployment configuration

## API Endpoints

### SMS Notification API
- **Endpoint**: `/api/send-sms`
- **Method**: POST
- **Purpose**: Handle contact form submissions and notifications

**Request Format**:
```json
{
  "to": "5622289429@vtext.com",
  "text": "Your message here",
  "from": "website@jaysmobilewash.net"
}
```

**CORS Enabled**: All API endpoints support CORS for client-side requests.

## Performance Metrics

### Target Thresholds
- Lighthouse Performance: **>90**
- Lighthouse Accessibility: **>95**
- Lighthouse SEO: **>95**
- Cumulative Layout Shift: **<0.1**
- Largest Contentful Paint: **<2.5s**
- First Input Delay: **<100ms**

Run `npm run lighthouse` to audit performance.

## Deployment

### Vercel (Production)
```bash
npm run deploy              # Deploy to production
npm run deploy:preview      # Deploy preview
```

### Environment Variables
Set these in Vercel dashboard:
- `OPENROUTER_API_KEY` - Not currently used (chatbot removed)
- Additional variables as needed

### Build Configuration
- **Framework**: Automatic detection (Next.js)
- **Build Command**: `next build`
- **Output Directory**: Auto-detected
- **Node Version**: 18.x or higher

## Testing

### Run Tests
```bash
npm test                    # Watch mode
npm run test:run            # Single run
npm run test:coverage       # With coverage
npm run test:ui             # Visual UI
```

### Quality Audits
```bash
npm run lighthouse          # Performance audit
npm run seo:validate        # SEO validation
npm run css:validate        # CSS validation
npm run audit:all           # Complete audit
```

## Business Information

**Jay's Mobile Wash**  
📍 16845 S Hoover St, Gardena, CA 90247  
📞 (562) 228-9429  
📧 info@jaysmobilewash.net  
🌐 https://jaysmobilewash.net  

**Service Areas**: Los Angeles County, Orange County  
**Hours**: Mon-Fri 8am-6pm, Sat-Sun 9am-5pm

### Services & Pricing
- **Mini Detail**: $70
- **Luxury Detail**: $130  
- **Max Detail**: $200
- **Ceramic Coating**: $450 (2-3 year protection)
- **Graphene Coating**: $800 (3-5 year protection)

## Contributing

This is a private repository for Jay's Mobile Wash. For bug reports or feature requests, please contact the development team.

## License

© 2025 Jay's Mobile Wash. All rights reserved.

---

**Last Updated**: November 8, 2025  
**Version**: 2.0 (No Chatbot - Performance Optimized)  
**Maintained By**: Development Team
