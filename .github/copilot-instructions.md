# Jay's Mobile Wash - AI Development Guide

## ⚠️ CRITICAL: DESIGN PRESERVATION RULE

**🚨 NEVER CHANGE THE WEBSITE'S VISUAL DESIGN, LAYOUT, OR COLOR SCHEME! 🚨**

### Absolute Rules:
- ✅ **DO**: Add new features, functionality, and content
- ✅ **DO**: Fix bugs, improve performance, add capabilities
- ✅ **DO**: Enhance SEO, accessibility, and user experience
- ❌ **NEVER**: Change colors, gradients, or visual theme
- ❌ **NEVER**: Modify layout templates or design structure
- ❌ **NEVER**: Alter fonts, spacing, or visual hierarchy
- ❌ **NEVER**: Change the overall look and feel

### Protected Design Elements:
```css
/* NEVER MODIFY THESE DESIGN ASPECTS */
- Color Scheme: Purple/Pink gradients (#b530ff, purple-900, etc.)
- Background: Dark theme (gray-900, black backgrounds)
- Fonts: Manrope font family
- Layout: Current grid and spacing system
- Visual Effects: Glow effects, animations, transitions
- Header/Footer: Structure and styling
- Navigation: Menu layout and design
```

### When Adding Features:
1. **Inherit existing styles** - Use current CSS classes and color variables
2. **Match the aesthetic** - New elements should blend seamlessly
3. **Extend, don't replace** - Add to the design, never replace it
4. **Test visual consistency** - Ensure new features match existing look

### Protected Files (Design):
- `index.html` - Main layout and styling (preserve visual design)
- TailwindCSS classes - Use existing color schemes only
- Service pages - Maintain consistent visual identity

**Remember**: The client loves the current design! Only add functionality, never change appearance.

---

## Architecture Overview

This is a **static website with Next.js framework** for Jay's Mobile Wash, a mobile car detailing business serving Los Angeles & Orange County. The site is optimized for SEO, performance, and local search.

### Key Components
- **Frontend**: Static HTML/CSS/JS with TailwindCSS 4.1.11 (CDN)
- **PWA**: Service Worker for offline caching + Web App Manifest
- **SEO**: Comprehensive Schema.org structured data (LocalBusiness, FAQPage, Reviews)
- **Deployment**: Vercel with GitHub integration (branch: `working-chatbot`)

### Tech Stack Details
- **Framework**: Next.js 15.3.4 (hybrid mode - static HTML + optional API routes)
- **Runtime**: Node.js 18+ with ES Modules (type: "module")
- **Testing**: Vitest 3.2.4 with jsdom environment
- **CSS**: TailwindCSS 4.1.11 via CDN + PostCSS for custom builds
- **PWA**: Service Worker v6-no-chatbot + manifest.json
- **Performance**: Lighthouse score >90, optimized Core Web Vitals

## Critical Development Patterns

### Static Site Architecture
- **Main Entry**: `index.html` (4400+ lines) - comprehensive static HTML
- **Service Worker**: `service-worker.js` - PWA offline caching (v6-no-chatbot)
- **Manifest**: `manifest.json` - PWA installation configuration
- **Styling**: TailwindCSS 4.1.11 loaded via CDN in `<head>`
- **Scripts**: `main.js` and `scripts.js` for interactivity

### SEO & Structured Data Pattern
All pages include comprehensive Schema.org markup:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Jay's Mobile Wash",
  "telephone": "+15622289429",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "16845 S Hoover St",
    "addressLocality": "Gardena",
    "addressRegion": "CA",
    "postalCode": "90247"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "287"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [/* Services $70-$800 */]
  }
}
</script>
```

**Critical SEO Elements:**
- LocalBusiness schema with geo coordinates
- FAQPage schema with 3+ Q&As per page
- BreadcrumbList for navigation
- AggregateRating for social proof
- Service pricing in hasOfferCatalog

### Environment & Deployment

**IMPORTANT**: This site is deployed on Vercel via **GitHub integration** - direct push to branch triggers automatic deployment.

#### Local Development (Requires Node.js/npm)
```bash
npm run dev                  # Start dev server on port 3000
npm run build                # Build static export to /out
npm test                     # Run Vitest tests
npm run audit:all            # Full audit (tests + SEO + CSS)
```

#### Deployment Methods

**Method 1: GitHub Push (Recommended)**
```bash
git add .
git commit -m "feat: your changes"
git push origin working-chatbot
# Vercel automatically deploys on push
```

**Method 2: Vercel CLI** (if installed)
```bash
vercel --prod                # Deploy to production
vercel                       # Deploy preview
vercel logs                  # View deployment logs
```

**Method 3: Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Select project: jaysmobilewash
- Go to Deployments → Click "Redeploy"

**Critical Environment Variables (Set in Vercel Dashboard):**
- Currently none required (chatbot removed)
- Previous: `OPENROUTER_API_KEY` (now unused)

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "echo 'Static site - no build needed'",
  "framework": null,
  "functions": {
    "api/**/*.js": { "maxDuration": 30 }
  }
}
```

**Next.js Config (`next.config.js`):**
```javascript
const nextConfig = {
  // NO output: 'export' - keeps API routes available if needed
  trailingSlash: true,
  images: { unoptimized: true }
}
```

## Testing & Quality Assurance

### Test Suite Organization
```bash
npm run audit:all          # Full audit: tests + SEO + CSS validation
npm run lighthouse         # Performance testing with thresholds
npm run test:coverage      # Code coverage reports
```

**Key Test Categories:**
- `tests/nextjs-vercel-setup.test.js` - Deployment configuration
- `scripts/lighthouse-performance.js` - Automated performance audits
- `scripts/seo-prerender-validator.js` - SEO validation
- `scripts/critical-css-validator.js` - CSS validation

### Performance Requirements
- Lighthouse Performance: >90
- Cumulative Layout Shift: <0.1  
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms

## Business Context Integration

### Service Information
Business details for SEO and content:
```javascript
const jayBusinessInfo = {
  name: "Jay's Mobile Wash",
  phone: "(562) 228-9429",
  email: "info@jaysmobilewash.net",
  address: "16845 S Hoover St, Gardena, CA 90247",
  serviceAreas: ["Los Angeles County", "Orange County"],
  hours: "Mon-Fri 8am-6pm, Sat-Sun 9am-5pm",
  services: [
    { name: "Mini Detail", price: 70 },
    { name: "Luxury Detail", price: 130 },
    { name: "Max Detail", price: 200 },
    { name: "Ceramic Coating (2-3yr)", price: 450 },
    { name: "Graphene Coating (3-5yr)", price: 800 }
  ]
};
```

### SEO & PWA Requirements
- All pages need structured data (Schema.org LocalBusiness)
- Service Worker caching for offline functionality
- Manifest.json for PWA installation
- Geo-targeting meta tags for local SEO

## Common Development Tasks

### Adding New Content Pages
1. Create HTML file following existing structure
2. Include Schema.org LocalBusiness markup
3. Add to sitemap files (main-sitemap.xml, etc.)
4. Update service worker cache if needed
5. Test SEO with `npm run seo:validate`

### Optimizing Performance
- Run `npm run lighthouse` before deployment
- Use `npm run audit:all` for comprehensive checks
- Monitor Core Web Vitals in production
- Update service worker cache version when needed

## File Structure Priorities
Focus on these directories for most development work:
- `/` - Root HTML files (index.html, service pages)
- `/scripts/` - Build and validation tools
- `/tests/` - Test suite
- `service-worker.js` - PWA caching logic
- `manifest.json` - PWA configuration

## Common Gotchas
- Service worker cache version must be updated when making major changes
- TailwindCSS loaded via CDN - no build step needed for CSS
- Vercel deployment automatic on git push to `working-chatbot` branch
- All HTML pages should include comprehensive Schema.org markup
- Performance target: Lighthouse >90 for all metrics

## Complete File Reference Guide

### Frontend & PWA
```
index.html                       # Main entry point (4400+ lines)
pages/index.js                   # Next.js landing page
main.js                          # Main JS logic
scripts.js                       # Additional scripts
manifest.json                    # PWA manifest
service-worker.js                # Service worker (cache v6-no-chatbot)
```

### Testing & Scripts
```
tests/nextjs-vercel-setup.test.js # Deployment tests
scripts/lighthouse-performance.js # Performance audits
scripts/seo-prerender-validator.js # SEO validation
scripts/critical-css-validator.js # CSS validation
backend-audit.js                 # Backend coverage audit
vitest.config.js                 # Test configuration
```

### Configuration Files
```
package.json                     # Dependencies & scripts
next.config.js                   # Next.js config (NO export!)
vercel.json                      # Vercel deployment
.eslintrc.json                   # ESLint config
postcss.config.cjs               # PostCSS config
vitest.config.js                 # Testing config
.gitignore                       # Git ignore rules
```

## Emergency Recovery Procedures

### Deployment Issues
1. Verify `next.config.js` does NOT have `output: 'export'`
2. Check `vercel.json` has proper configuration
3. Push to GitHub: `git push origin working-chatbot`
4. Check Vercel dashboard for deployment logs
5. Verify environment variables in Vercel dashboard (none required currently)

### Performance Problems
1. Run `npm run lighthouse` for performance report
2. Check service worker cache version in `service-worker.js`
3. Verify TailwindCSS is loaded via CDN
4. Check Core Web Vitals: CLS <0.1, LCP <2.5s
5. Review Lighthouse report in `/lighthouse-reports/`

### SEO Issues
1. Validate Schema.org markup with Google Rich Results Test
2. Check robots.txt is not blocking important pages
3. Verify all pages have LocalBusiness schema
4. Ensure FAQPage schema on service pages
5. Run `npm run seo:validate` for comprehensive check

## Development Workflow Best Practices

### Before Making Changes
1. Run `npm test` to ensure tests pass
2. Check current branch: `git branch` (should be `working-chatbot`)
3. Review existing patterns in similar files
4. Check `src/constants/apiOptions.js` for API configs

### After Making Changes
1. Run `npm run audit:all` for full validation
2. Test locally: `npm run dev` (if Node.js available)
3. Check browser console for errors
4. Run `npm run test:coverage` for coverage report
5. Deploy via GitHub push: `git push origin working-chatbot`

### Adding New Features
1. Follow existing design patterns (purple/pink theme)
2. Add tests in `/tests/` directory if needed
3. Update this file with new patterns
4. Document in code comments
5. Test with `npm test` before committing (if Node.js available)

## Quick Reference Commands

```bash
# Development
npm run dev                  # Start dev server (port 3000)
npm run build                # Build static export to /out
npm start                    # Start production server

# Testing
npm test                     # Run tests in watch mode
npm run test:run             # Run tests once
npm run test:coverage        # Generate coverage report
npm run test:ui              # Open Vitest UI

# Validation
npm run audit:all            # Full audit (tests + SEO + CSS)
npm run lighthouse           # Performance testing
npm run seo:validate         # SEO validation
npm run css:validate         # CSS validation
npm run robots:validate      # Robots.txt validation

# Deployment
npm run deploy               # Deploy to production
npm run deploy:preview       # Deploy preview
vercel --prod                # Direct Vercel deploy
vercel logs                  # View deployment logs

# CSS
npm run build:css            # Build Tailwind CSS
npm run build:css:watch      # Watch mode for CSS
```

## Important Constants & Values

### Business Information
- **Phone**: (562) 228-9429
- **Email**: info@jaysmobilewash.net
- **Address**: 16845 S Hoover St, Gardena, CA 90247
- **Service Areas**: Los Angeles County, Orange County
- **Hours**: Mon-Fri 8am-6pm, Sat-Sun 9am-5pm

### Pricing
- Mini Detail: $70
- Luxury Detail: $130
- Max Detail: $200
- Ceramic Coating: $450 (2-3 year)
- Graphene Coating: $800 (3-5 year)

### Performance Thresholds
- Lighthouse Performance: >90
- Lighthouse Accessibility: >95
- Lighthouse SEO: >95
- Cumulative Layout Shift: <0.1
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms

### Cache & Version
- Service Worker Cache: `jays-mobile-wash-v6-no-chatbot`
- CSS Version: Via CDN (TailwindCSS 4.1.11)
- Next.js Version: 15.3.4
- Vitest Version: 3.2.4

## Known Issues & Workarounds

### Issue: CORS Errors in Production
**Problem**: API calls blocked by CORS policy
**Solution**: Ensure all API handlers include proper CORS headers in `vercel.json`

### Issue: Next.js Build Errors
**Problem**: Build fails with "output: 'export' not compatible with API routes"
**Solution**: Remove `output: 'export'` from `next.config.js`

### Issue: Service Worker Not Updating
**Problem**: Old cached version persists
**Solution**: Update cache name in `service-worker.js` (currently `v6-no-chatbot`)

## Documentation & Resources

### Internal Documentation
- `README.md` - Project overview and setup
- `CONTRIBUTING.md` - Contributing guidelines
- `CHANGELOG.md` - Version history
- `SEO_CHECKLIST.md` - SEO audit checklist

### External Resources
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Vitest Docs: https://vitest.dev
- TailwindCSS Docs: https://tailwindcss.com/docs

## Testing Checklist Before Deployment

- [ ] All tests pass: `npm test`
- [ ] No console errors in browser
- [ ] Lighthouse score >90: `npm run lighthouse`
- [ ] SEO validation passes: `npm run seo:validate`
- [ ] CSS validation passes: `npm run css:validate`
- [ ] Service worker caches properly
- [ ] PWA manifest is valid
- [ ] Environment variables set in Vercel
- [ ] No TypeScript/ESLint errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Preview deployment works: `npm run deploy:preview`

## Git Workflow

### Current Branch
- **Active**: `working-chatbot`
- **Remote**: `jjmandog/jaysmobilewash`

### Commit Best Practices
```bash
# Before committing
git status                   # Check changed files
npm run audit:all            # Run full audit
git add .                    # Stage changes
git commit -m "feat: descriptive message"
git push origin working-chatbot

# After deployment
git tag v1.x.x               # Tag releases
git push --tags              # Push tags
```

### Branch Strategy
- `working-chatbot` - Active development (current)
- `main` - Production (stable)
- Feature branches for major changes

---

**Last Updated**: November 8, 2025
**Maintained By**: AI Coding Agents & Development Team
**Version**: 2.0 (Comprehensive Edition)
