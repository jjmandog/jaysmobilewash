# Contributing to Jay's Mobile Wash

Thank you for your interest in contributing to Jay's Mobile Wash website!

## ⚠️ CRITICAL: Design Preservation Rule

**NEVER CHANGE THE WEBSITE'S VISUAL DESIGN, LAYOUT, OR COLOR SCHEME!**

### Absolute Rules:
- ✅ **DO**: Add new features, functionality, and content
- ✅ **DO**: Fix bugs, improve performance, add capabilities
- ✅ **DO**: Enhance SEO, accessibility, and user experience
- ❌ **NEVER**: Change colors, gradients, or visual theme
- ❌ **NEVER**: Modify layout templates or design structure
- ❌ **NEVER**: Alter fonts, spacing, or visual hierarchy

The client loves the current design! Only add functionality, never change appearance.

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Getting Started
```bash
# Clone the repository
git clone https://github.com/jjmandog/jaysmobilewash.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### Before Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Run tests: `npm test`
3. Check current branch: `git branch`

### While Developing
1. Follow existing code patterns
2. Test locally: `npm run dev`
3. Run audits: `npm run audit:all`
4. Check browser console for errors

### Before Committing
1. Run full audit: `npm run audit:all`
2. Ensure tests pass: `npm run test:run`
3. Check performance: `npm run lighthouse`
4. Review your changes: `git diff`

### Commit Guidelines
```bash
# Use conventional commit messages
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "perf: improve performance"
git commit -m "docs: update documentation"
git commit -m "test: add tests"
```

## Code Standards

### JavaScript
- Use ES6+ syntax
- Use `const` and `let`, avoid `var`
- Add comments for complex logic
- Follow existing patterns

### HTML
- Semantic HTML5 elements
- WCAG accessibility standards
- Schema.org structured data
- Preserve existing layout structure

### CSS
- Use TailwindCSS utility classes
- Maintain purple/pink gradient theme
- Preserve existing color variables
- Keep dark theme (gray-900/black)

### Performance
- Optimize images before adding
- Minimize new dependencies
- Keep bundle size small
- Test Core Web Vitals

## Testing

### Run Tests
```bash
npm test                    # Watch mode
npm run test:run            # Single run
npm run test:coverage       # With coverage
```

### Quality Audits
```bash
npm run lighthouse          # Performance
npm run seo:validate        # SEO
npm run css:validate        # CSS
npm run audit:all           # Everything
```

### Performance Thresholds
- Lighthouse Performance: >90
- Lighthouse Accessibility: >95
- Lighthouse SEO: >95
- Cumulative Layout Shift: <0.1
- Largest Contentful Paint: <2.5s

## Project Structure

```
jaysmobilewash/
├── api/                    # Serverless functions
├── pages/                  # Next.js pages
├── public/                 # Static assets
├── src/                    # Source code
│   ├── constants/          # Configuration
│   └── utils/              # Utilities
├── scripts/                # Build scripts
├── tests/                  # Test suite
└── index.html              # Main entry
```

## Key Files (Do Not Delete)

- `index.html` - Main website
- `manifest.json` - PWA config
- `service-worker.js` - Offline support
- `robots.txt` - SEO directives
- `vercel.json` - Deployment config
- `next.config.js` - Next.js config

## API Guidelines

### Creating New Endpoints
1. Add to `/api/` directory
2. Follow CORS pattern
3. Accept POST requests only
4. Include proper error handling
5. Add tests for new endpoints

### CORS Headers (Required)
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

## Adding New Features

### Checklist
- [ ] Feature doesn't change existing design
- [ ] Code follows existing patterns
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance checked
- [ ] Accessibility tested
- [ ] SEO impact assessed
- [ ] Mobile responsive
- [ ] Browser tested (Chrome, Firefox, Safari)

## Deployment

### Preview Deployment
```bash
npm run deploy:preview
```

### Production Deployment
```bash
npm run deploy
```

## Getting Help

For questions or issues:
- Review existing code patterns
- Check `.github/copilot-instructions.md`
- Review `README.md`
- Check test files for examples

## Code Review

Pull requests require:
- [ ] All tests passing
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Design unchanged
- [ ] Documentation updated
- [ ] Commit messages follow conventions

---

**Remember**: The website's visual design is sacred. Add features, never change the look!

Last Updated: November 8, 2025
