# Netlify Migration Guide

## Overview

Jay's Mobile Wash has been successfully migrated to support Netlify deployment alongside the existing Vercel setup. This migration preserves all existing functionality including:

- ✅ SPA routing and client-side navigation
- ✅ Technical SEO features (canonical tags, Open Graph, structured data)
- ✅ Hugging Face AI endpoint at `/api/ai`
- ✅ Bot/crawler blocking and security features
- ✅ All existing tests and validation scripts
- ✅ No UI layout changes or breaking modifications

## New Files Added

### `/netlify/functions/ai.js`
- Production-ready serverless function for Netlify
- Identical functionality to `/api/ai.js` but in Netlify format
- Handles POST requests to Hugging Face API
- Includes bot blocking, error handling, and CORS headers

### `/netlify.toml`
- Netlify configuration file
- Redirects `/api/ai` to `/.netlify/functions/ai`
- Configures SPA routing for client-side navigation
- Sets security headers and caching policies
- Specifies Node.js version for serverless functions

### `/tests/netlify-ai.test.js`
- Comprehensive test suite for Netlify function (28 tests)
- Ensures identical behavior to Vercel function
- Tests all error conditions and edge cases

## Deployment Instructions

### 1. Environment Variables
Set the following environment variable in Netlify dashboard:
- Go to **Site settings** > **Environment variables**
- Add `HF_API_KEY` with your Hugging Face API token

### 2. Build Configuration
The site is configured as a static site with serverless functions:
- **Build command**: None (static site)
- **Publish directory**: `.` (root directory)
- **Functions directory**: `netlify/functions` (configured in netlify.toml)

### 3. Domain Configuration
- SPA routing is automatically configured
- All existing URLs will continue to work
- `/api/ai` endpoint remains available and functional

## Technical Details

### API Endpoint Compatibility
- **Existing URL**: `/api/ai` (unchanged)
- **Netlify Function**: `/.netlify/functions/ai` (redirected from `/api/ai`)
- **Request Format**: Same POST with JSON body `{ prompt: "..." }`
- **Response Format**: Identical to Vercel version

### SPA Routing
- Configured in `netlify.toml` with catch-all redirect to `index.html`
- Preserves all client-side routing functionality
- Maintains SEO-friendly URLs and canonical tags

### Security Features
- Bot/crawler blocking preserved
- CORS headers configured for cross-origin requests
- Security headers set in netlify.toml

## Testing

All existing tests continue to pass (109/109 tests):
```bash
npm test                    # Run all tests
npm test -- tests/netlify-ai.test.js  # Test Netlify function specifically
```

## Migration Benefits

1. **Zero Downtime**: Existing Vercel setup continues to work
2. **Platform Flexibility**: Can deploy to either Vercel or Netlify
3. **Identical Functionality**: No changes to API behavior or UI
4. **SEO Preservation**: All SEO features maintained
5. **Test Coverage**: Comprehensive test suite ensures reliability

## Environment Compatibility

- **Node.js**: Version 18 (configured in netlify.toml)
- **Browser Support**: Same as existing implementation
- **Dependencies**: No new dependencies added

## Rollback Plan

If any issues arise, the migration can be easily rolled back by:
1. Removing the new files: `netlify/` directory and `netlify.toml`
2. Continuing to use the existing Vercel setup
3. All existing functionality remains unchanged

The migration is completely additive with no breaking changes to existing code or functionality.