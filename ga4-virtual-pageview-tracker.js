/**
 * GA4 Virtual Pageview Tracking for SPA Navigation
 * Tracks virtual pageviews on history changes without altering UI or router logic
 * Production-ready implementation with proper error handling
 */

class GA4VirtualPageviewTracker {
  constructor(measurementId = null) {
    this.measurementId = measurementId;
    this.isInitialized = false;
    this.currentPath = window.location.pathname;
    this.init();
  }

  /**
   * Initialize GA4 tracking
   */
  init() {
    try {
      // Check if gtag is already loaded
      if (typeof gtag !== 'undefined') {
        this.isInitialized = true;
        this.setupHistoryTracking();
        console.log('GA4 Virtual Pageview Tracker initialized');
        return;
      }

      // Auto-detect measurement ID from existing gtag script
      if (!this.measurementId) {
        this.measurementId = this.detectMeasurementId();
      }

      if (!this.measurementId) {
        console.warn('GA4 Measurement ID not found. Virtual pageview tracking disabled.');
        return;
      }

      // Load GA4 if not already loaded
      this.loadGA4();
    } catch (error) {
      console.error('Failed to initialize GA4 Virtual Pageview Tracker:', error);
    }
  }

  /**
   * Detect existing GA4 measurement ID from scripts
   */
  detectMeasurementId() {
    try {
      // Check for existing gtag config calls
      if (window.dataLayer) {
        for (const item of window.dataLayer) {
          if (Array.isArray(item) && item[0] === 'config' && item[1]?.startsWith('G-')) {
            return item[1];
          }
        }
      }

      // Check for gtag script src
      const gtagScript = document.querySelector('script[src*="gtag/js"]');
      if (gtagScript) {
        const match = gtagScript.src.match(/id=([^&]+)/);
        if (match && match[1].startsWith('G-')) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting GA4 measurement ID:', error);
      return null;
    }
  }

  /**
   * Load GA4 script dynamically
   */
  loadGA4() {
    try {
      // Create gtag script
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(gtagScript);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      gtag('js', new Date());
      gtag('config', this.measurementId, {
        send_page_view: false // We'll handle page views manually
      });

      this.isInitialized = true;
      this.setupHistoryTracking();
      
      console.log(`GA4 loaded with measurement ID: ${this.measurementId}`);
    } catch (error) {
      console.error('Failed to load GA4:', error);
    }
  }

  /**
   * Setup history change tracking for SPA navigation
   */
  setupHistoryTracking() {
    try {
      // Track initial page view
      this.trackPageView();

      // Override history.pushState
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.handleHistoryChange();
      };

      // Override history.replaceState
      const originalReplaceState = history.replaceState;
      history.replaceState = (...args) => {
        originalReplaceState.apply(history, args);
        this.handleHistoryChange();
      };

      // Track popstate events (back/forward buttons)
      window.addEventListener('popstate', () => {
        this.handleHistoryChange();
      });

      // Track hash changes for hash-based SPA routing
      window.addEventListener('hashchange', () => {
        this.handleHistoryChange();
      });

      console.log('GA4 history tracking setup complete');
    } catch (error) {
      console.error('Failed to setup history tracking:', error);
    }
  }

  /**
   * Handle history changes and track virtual pageviews
   */
  handleHistoryChange() {
    try {
      // Debounce rapid navigation changes
      if (this.trackingTimeout) {
        clearTimeout(this.trackingTimeout);
      }

      this.trackingTimeout = setTimeout(() => {
        const newPath = window.location.pathname + window.location.search + window.location.hash;
        
        // Only track if the path actually changed
        if (this.currentPath !== newPath) {
          this.currentPath = newPath;
          this.trackPageView();
        }
      }, 100);
    } catch (error) {
      console.error('Error handling history change:', error);
    }
  }

  /**
   * Track virtual pageview
   */
  trackPageView() {
    try {
      if (!this.isInitialized || typeof gtag === 'undefined') {
        return;
      }

      const pageData = {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search + window.location.hash
      };

      // Track the pageview
      gtag('event', 'page_view', pageData);

      // Enhanced tracking for SPA pages
      this.trackSPAPageView(pageData);

      console.log('GA4 Virtual pageview tracked:', pageData.page_path);
    } catch (error) {
      console.error('Failed to track virtual pageview:', error);
    }
  }

  /**
   * Enhanced SPA page tracking with additional context
   */
  trackSPAPageView(pageData) {
    try {
      // Determine page type based on URL
      const pageType = this.getPageType(pageData.page_path);
      
      // Track enhanced SPA navigation event
      gtag('event', 'spa_navigation', {
        page_type: pageType,
        page_path: pageData.page_path,
        page_title: pageData.page_title,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });

      // Track specific page categories
      if (pageType === 'service') {
        this.trackServicePageView(pageData.page_path);
      } else if (pageType === 'location') {
        this.trackLocationPageView(pageData.page_path);
      }
    } catch (error) {
      console.error('Failed to track enhanced SPA pageview:', error);
    }
  }

  /**
   * Determine page type from URL path
   */
  getPageType(path) {
    if (path.includes('/services/')) return 'service';
    if (path.includes('/locations/')) return 'location';
    if (path.includes('/about')) return 'about';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/privacy')) return 'privacy';
    if (path.includes('/terms')) return 'terms';
    if (path === '/' || path === '') return 'home';
    return 'other';
  }

  /**
   * Track service page views with enhanced data
   */
  trackServicePageView(path) {
    try {
      let serviceType = 'unknown';
      
      if (path.includes('exterior-detailing')) serviceType = 'exterior_detailing';
      else if (path.includes('interior-detailing')) serviceType = 'interior_detailing';
      else if (path.includes('ceramic-coating')) serviceType = 'ceramic_coating';
      else if (path.includes('paint-correction')) serviceType = 'paint_correction';

      gtag('event', 'view_service_page', {
        service_type: serviceType,
        service_category: 'detailing_services',
        page_path: path
      });
    } catch (error) {
      console.error('Failed to track service page view:', error);
    }
  }

  /**
   * Track location page views with enhanced data
   */
  trackLocationPageView(path) {
    try {
      let location = 'unknown';
      
      if (path.includes('los-angeles')) location = 'los_angeles';
      else if (path.includes('orange-county')) location = 'orange_county';
      else if (path.includes('beverly-hills')) location = 'beverly_hills';

      gtag('event', 'view_location_page', {
        location: location,
        page_path: path
      });
    } catch (error) {
      console.error('Failed to track location page view:', error);
    }
  }

  /**
   * Manually track a custom event
   */
  trackEvent(eventName, parameters = {}) {
    try {
      if (!this.isInitialized || typeof gtag === 'undefined') {
        return;
      }

      gtag('event', eventName, {
        ...parameters,
        timestamp: new Date().toISOString()
      });

      console.log(`GA4 Custom event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  /**
   * Get tracking status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      measurementId: this.measurementId,
      currentPath: this.currentPath,
      gtagAvailable: typeof gtag !== 'undefined'
    };
  }
}

// Initialize GA4 Virtual Pageview Tracker
window.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize with auto-detection
    window.GA4Tracker = new GA4VirtualPageviewTracker();
    
    // Expose global tracking function
    window.trackGA4Event = (eventName, parameters) => {
      if (window.GA4Tracker) {
        window.GA4Tracker.trackEvent(eventName, parameters);
      }
    };
    
    // Expose status check function
    window.getGA4Status = () => {
      return window.GA4Tracker ? window.GA4Tracker.getStatus() : { isInitialized: false };
    };
    
  } catch (error) {
    console.error('Failed to initialize GA4 Virtual Pageview Tracker:', error);
  }
});