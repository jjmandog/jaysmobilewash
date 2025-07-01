/**
 * 410 Gone Route Handler for Invalid Routes
 * Implements proper HTTP 410 response for permanently removed/invalid routes
 * Production-ready error handling for Jay's Mobile Wash SPA
 */

class InvalidRouteHandler {
  constructor(options = {}) {
    this.goneRoutes = options.goneRoutes || [
      '/old-services/',
      '/legacy/',
      '/deprecated/',
      '/removed/',
      '/old-blog/',
      '/archive/',
      '/temp/',
      '/beta/',
      '/staging/'
    ];
    
    this.validRoutes = options.validRoutes || [
      '/',
      '/services/',
      '/services/exterior-detailing/',
      '/services/interior-detailing/',
      '/services/ceramic-coating/',
      '/locations/',
      '/locations/los-angeles/',
      '/locations/orange-county/',
      '/locations/beverly-hills/',
      '/about/',
      '/contact/',
      '/privacy/',
      '/terms/',
      '/products/'
    ];
    
    this.baseUrl = options.baseUrl || 'https://www.jaysmobilewash.net';
    this.initialized = false;
  }

  /**
   * Initialize route handling
   */
  init() {
    if (this.initialized) return;
    
    this.setupRouteDetection();
    this.setupHistoryMonitoring();
    this.initialized = true;
    
    console.log('410 Gone Route Handler initialized');
  }

  /**
   * Setup route detection for current page
   */
  setupRouteDetection() {
    // Check current route on page load
    document.addEventListener('DOMContentLoaded', () => {
      this.checkCurrentRoute();
    });
  }

  /**
   * Setup history monitoring for SPA navigation
   */
  setupHistoryMonitoring() {
    // Monitor history changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.checkCurrentRoute(), 0);
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.checkCurrentRoute(), 0);
    };
    
    // Monitor popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkCurrentRoute(), 0);
    });
  }

  /**
   * Check current route and handle invalid routes
   */
  checkCurrentRoute() {
    const currentPath = this.getCurrentPath();
    const routeStatus = this.getRouteStatus(currentPath);
    
    switch (routeStatus) {
      case 'gone':
        this.handle410Gone(currentPath);
        break;
      case 'invalid':
        this.handle404NotFound(currentPath);
        break;
      case 'valid':
        // Route is valid, continue normal operation
        break;
    }
  }

  /**
   * Get current path from URL
   */
  getCurrentPath() {
    const path = window.location.pathname;
    return path.endsWith('/') ? path : path + '/';
  }

  /**
   * Determine route status
   */
  getRouteStatus(path) {
    // Check if route is explicitly marked as gone
    if (this.goneRoutes.some(route => path.startsWith(route))) {
      return 'gone';
    }
    
    // Check if route is valid
    if (this.isValidRoute(path)) {
      return 'valid';
    }
    
    // Unknown route - could be 404
    return 'invalid';
  }

  /**
   * Check if route is valid
   */
  isValidRoute(path) {
    // Exact match
    if (this.validRoutes.includes(path)) {
      return true;
    }
    
    // Pattern matching for dynamic routes
    const dynamicPatterns = [
      /^\/services\/[a-z-]+\/$/,
      /^\/locations\/[a-z-]+\/$/,
      /^\/blog\/[a-z0-9-]+\/$/
    ];
    
    return dynamicPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Handle 410 Gone response
   */
  handle410Gone(path) {
    console.log(`410 Gone: ${path}`);
    
    // Track the 410 event
    this.track410Event(path);
    
    // Show 410 page or redirect
    this.show410Page(path);
  }

  /**
   * Handle 404 Not Found response
   */
  handle404NotFound(path) {
    console.log(`404 Not Found: ${path}`);
    
    // Track the 404 event
    this.track404Event(path);
    
    // Redirect to 404 page if not already there
    if (!window.location.pathname.includes('404')) {
      window.location.href = '/404.html';
    }
  }

  /**
   * Show 410 Gone page
   */
  show410Page(path) {
    const redirectUrl = this.findBestRedirect(path);
    
    // Create 410 page content
    const gonePageHTML = this.create410PageHTML(path, redirectUrl);
    
    // Replace page content
    document.documentElement.innerHTML = gonePageHTML;
    
    // Update page title and meta
    document.title = '410 - Page Permanently Removed | Jay\'s Mobile Wash';
    
    // Set proper meta tags
    this.set410MetaTags(path);
    
    // Auto-redirect after delay if redirect URL found
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 5000);
    }
  }

  /**
   * Find best redirect for gone route
   */
  findBestRedirect(path) {
    const redirectMap = {
      '/old-services/': '/services/',
      '/legacy/': '/',
      '/deprecated/': '/',
      '/removed/': '/',
      '/old-blog/': '/',
      '/archive/': '/',
      '/temp/': '/',
      '/beta/': '/',
      '/staging/': '/'
    };
    
    // Find direct mapping
    for (const [pattern, redirect] of Object.entries(redirectMap)) {
      if (path.startsWith(pattern)) {
        return redirect;
      }
    }
    
    // Default redirect to home
    return '/';
  }

  /**
   * Create 410 page HTML
   */
  create410PageHTML(path, redirectUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>410 - Page Permanently Removed | Jay's Mobile Wash</title>
    <meta name="description" content="This page has been permanently removed. Please visit our updated services and locations.">
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${this.baseUrl}/">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
        }
        h1 {
            font-size: 4rem;
            margin: 0 0 1rem 0;
            font-weight: bold;
        }
        h2 {
            font-size: 1.5rem;
            margin: 0 0 2rem 0;
            opacity: 0.9;
        }
        .description {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .btn-primary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn-primary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .redirect-notice {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            font-size: 0.9rem;
        }
        .countdown {
            font-weight: bold;
            color: #ffeb3b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>410</h1>
        <h2>Page Permanently Removed</h2>
        <div class="description">
            <p>The page you're looking for at <strong>${path}</strong> has been permanently removed from our website.</p>
            <p>This may be due to a service update, site restructuring, or the content being replaced with improved alternatives.</p>
        </div>
        <div class="buttons">
            <a href="/" class="btn btn-primary">🏠 Return Home</a>
            <a href="/services/" class="btn btn-primary">🚗 View Services</a>
            <a href="/contact/" class="btn btn-primary">📞 Contact Us</a>
        </div>
        ${redirectUrl ? `
        <div class="redirect-notice">
            <p>You will be automatically redirected to <strong>${redirectUrl}</strong> in <span class="countdown" id="countdown">5</span> seconds.</p>
            <p><a href="${redirectUrl}" style="color: #ffeb3b;">Click here to go immediately</a></p>
        </div>` : ''}
    </div>
    
    <script>
        // Countdown timer for redirect
        if (document.getElementById('countdown')) {
            let count = 5;
            const countdownEl = document.getElementById('countdown');
            const timer = setInterval(() => {
                count--;
                countdownEl.textContent = count;
                if (count <= 0) {
                    clearInterval(timer);
                }
            }, 1000);
        }
        
        // Track 410 event
        if (typeof gtag === 'function') {
            gtag('event', '410_page_gone', {
                'event_category': 'Error',
                'event_label': '${path}',
                'page_path': '${path}',
                'redirect_url': '${redirectUrl || 'none'}',
                'non_interaction': true
            });
        }
    </script>
</body>
</html>`;
  }

  /**
   * Set 410 meta tags
   */
  set410MetaTags(path) {
    // Update meta tags for 410 page
    const metaTags = [
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:title', content: '410 - Page Permanently Removed' },
      { property: 'og:description', content: `The page at ${path} has been permanently removed.` },
      { name: 'twitter:title', content: '410 - Page Permanently Removed' }
    ];
    
    metaTags.forEach(tag => {
      const existing = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
      if (existing) {
        existing.content = tag.content;
      } else {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.property) meta.property = tag.property;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  /**
   * Track 410 event
   */
  track410Event(path) {
    try {
      // Google Analytics 4
      if (typeof gtag === 'function') {
        gtag('event', '410_gone', {
          'event_category': 'Error',
          'event_label': path,
          'page_path': path,
          'referrer': document.referrer,
          'user_agent': navigator.userAgent,
          'timestamp': new Date().toISOString()
        });
      }
      
      // Custom analytics
      if (window.trackGA4Event) {
        window.trackGA4Event('410_gone', {
          path: path,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to track 410 event:', error);
    }
  }

  /**
   * Track 404 event
   */
  track404Event(path) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', '404_not_found', {
          'event_category': 'Error',
          'event_label': path,
          'page_path': path,
          'referrer': document.referrer
        });
      }
    } catch (error) {
      console.error('Failed to track 404 event:', error);
    }
  }

  /**
   * Add route as permanently gone
   */
  addGoneRoute(route) {
    if (!this.goneRoutes.includes(route)) {
      this.goneRoutes.push(route);
    }
  }

  /**
   * Remove route from gone list
   */
  removeGoneRoute(route) {
    const index = this.goneRoutes.indexOf(route);
    if (index > -1) {
      this.goneRoutes.splice(index, 1);
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      goneRoutes: [...this.goneRoutes],
      validRoutes: [...this.validRoutes],
      initialized: this.initialized
    };
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.InvalidRouteHandler = new InvalidRouteHandler();
  window.InvalidRouteHandler.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvalidRouteHandler;
}