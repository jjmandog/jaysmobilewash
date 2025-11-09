# Changelog

All notable changes to Jay's Mobile Wash website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-08

### Removed
- 🗑️ **Chatbot System** - Complete removal of AI chatbot for performance
  - Removed `advanced-chatbot.js` and all variants
  - Removed `advanced-chatbot.css` and styling
  - Removed chatbot container from all HTML files
  - Removed chatbot initialization scripts
  - Updated service worker cache to v6

### Performance
- ⚡ **Major Performance Boost** 
  - Reduced JavaScript bundle size by ~150KB
  - Eliminated 3+ HTTP requests per page load
  - Improved Lighthouse performance score
  - Faster Time to Interactive (TTI)
  - Lower memory usage

### Changed
- 📝 Updated `README.md` with comprehensive documentation
- 🤖 Updated `robots.txt` with optimized SEO rules
- 📦 Updated `package.json` with better metadata
- 🔧 Updated service worker cache to v6-no-chatbot
- 📚 Created `.github/copilot-instructions.md` for AI agents
- 📋 Created `CONTRIBUTING.md` with contribution guidelines

### Fixed
- 🐛 Resolved slow page load times caused by chatbot
- 🐛 Fixed unnecessary API calls on page load
- 🐛 Removed unused chatbot-related dependencies

## [1.0.0] - 2025-07-01

### Added
- 🎨 Initial website launch
- 📱 Progressive Web App (PWA) functionality
- 🔍 Advanced SEO optimization
- 🎯 Schema.org structured data
- 🌍 Geo-targeting for LA & Orange County
- ♿ WCAG accessibility compliance
- 🤖 AI-powered chatbot (later removed)
- 📧 SMS notification system
- 🎨 Purple/pink gradient design theme
- 📊 Multiple specialized XML sitemaps

### Features
- Responsive design for all devices
- Service worker for offline functionality
- Optimized performance (Lighthouse 90+)
- Local business markup
- Contact form with SMS integration
- Service pages (ceramic coating, paint correction, etc.)
- Location pages (LA, Orange County)
- Package pricing pages

---

## Version History Summary

### v2.0.0 (Current)
- Chatbot removed for performance
- Comprehensive documentation
- Optimized for speed

### v1.0.0
- Initial launch
- Full feature set
- PWA capabilities

---

**Note**: For detailed commit history, see the git log: `git log --oneline --decorate`

Last Updated: November 8, 2025
