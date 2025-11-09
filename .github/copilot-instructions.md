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
  ## Copilot / AI Agent Instructions — Jay's Mobile Wash (concise)

  Purpose: give AI coding agents the minimal, actionable context to be productive in this repo.

  - Critical: Do NOT change visual design or layout. Protected file: `index.html` (main layout). Keep Tailwind classes and colors (purple/pink) intact.
  - Project type: Next.js hybrid static site + small API routes. Main site is large static HTML (`index.html`) and PWA assets (`service-worker.js`, `manifest.json`).

  Where to look first
  - `index.html` — primary content (4400+ lines). Edit small sections only; copy patterns when adding pages.
  - `service-worker.js` — cache name/version (update when changing offline assets).
  - `scripts/` — audit and SEO scripts (e.g., `lighthouse-performance.js`, `seo-prerender-validator.js`).
  - `pages/`, `api/` — Next.js pages and serverless endpoints (follow existing CORS pattern).

  Developer workflows (commands you'll use)
  - Install & dev: `npm install` then `npm run dev` (localhost:3000)
  - Tests: `npm test` (watch), `npm run test:run` (single run)
  - Quality: `npm run audit:all` (full audit), `npm run lighthouse`, `npm run seo:validate`
  - Deploy: push to branch `working-chatbot` — Vercel auto-deploys. (Alternatively `vercel --prod`.)

  Project-specific conventions
  - Tailwind is loaded via CDN — do not introduce a new CSS build unless coordinated.
  - Structured data: pages include Schema.org LocalBusiness JSON-LD; copy the existing pattern when adding services or FAQ entries.
  - PWA: Always update the cache name in `service-worker.js` when changing assets (cache key example: `jays-mobile-wash-v6-no-chatbot`).

  Integration & gotchas
  - Vercel: no special env vars required currently; previous chatbot keys (e.g., `OPENROUTER_API_KEY`) are unused.
  - Next.js must NOT use `output: 'export'` in `next.config.js` (this disables API routes).
  - CORS: API endpoints include CORS support; preserve headers when editing `api/*` handlers.

  Quick examples
  - Add a service page: duplicate existing `services-*.html`, update JSON-LD block (copy from `index.html`), and add to `main-sitemap.xml`.
  - Update SW cache: bump the string in `service-worker.js` and increment any version constants referenced by `manifest.json`.

  If unsure
  - Run `npm run audit:all` locally to surface lint/tests/SEO failures before pushing.

  When done, ask for a human review if your change touches layout, colors, fonts, or header/footer structure.

  Last updated: 2025-11-08
  Maintained by: repo maintainers
