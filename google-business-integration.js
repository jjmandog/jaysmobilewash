/**
 * Google Business Profile Integration - Error-free Implementation
 * With fallbacks for 404/401 errors and connection issues
 */

class GBPIntegration {
  constructor() {
    this.config = {
      apiEndpoint: '/api/gmb-posts',
      fallbackEndpoint: '/static/gmb-posts.json',
      staticFallbackData: [ // Fallback data if all API calls fail
        {
          type: 'OFFER',
          title: 'Summer Special: 15% Off Ceramic Coating',
          content: 'Beat the heat this summer with our premium ceramic coating service. Now 15% off for all vehicles.',
          imageUrl: '/images/gmb-offer-ceramic.jpg',
          fallbackImageUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'24\' fill=\'%238a4bff\'%3ESpecial Offer%3C/text%3E%3C/svg%3E',
          date: '2025-06-15',
          cta: 'Book Now',
          ctaUrl: '/booking/'
        },
        {
          type: 'UPDATE',
          title: 'Now Serving Manhattan Beach',
          content: 'We now offer our mobile detailing services in Manhattan Beach!',
          imageUrl: '/images/gmb-update-location.jpg',
          fallbackImageUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'24\' fill=\'%238a4bff\'%3ELocation Update%3C/text%3E%3C/svg%3E',
          date: '2025-06-10',
          cta: 'Learn More',
          ctaUrl: '/locations/manhattan-beach/'
        }
      ],
      maxPosts: 4,
      refreshInterval: 3600000, // 1 hour
      timeoutDuration: 8000    // 8 seconds
    };
    
    // State management
    this.state = {
      posts: [],
      lastFetched: null,
      isLoading: true,
      hasError: false,
      errorMessage: '',
      displayMode: 'normal', // normal, error, loading, empty
      callingApi: false
    };
    
    // DOM elements cache
    this.elements = {
      container: null,
      loading: null,
      error: null
    };
    
    // Bind methods
    this.init = this.init.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.renderPosts = this.renderPosts.bind(this);
    this.handleApiError = this.handleApiError.bind(this);
    this.trackEvent = this.trackEvent.bind(this);
    this.checkImageExists = this.checkImageExists.bind(this);
    this.createPostElement = this.createPostElement.bind(this);
    
    // Initialize once the DOM is ready with error handling
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      this.init();
    }
  }
  
  // Initialize with error handling
  init() {
    try {
      // Cache DOM elements
      this.elements.container = document.getElementById('gmb-posts-container');
      this.elements.loading = document.getElementById('gmb-loading');
      this.elements.error = document.getElementById('gmb-error');
      
      // Check if container exists
      if (!this.elements.container) {
        console.warn('GMB posts container not found');
        return;
      }
      
      // Load posts
      this.fetchPosts();
      
      // Set up auto-refresh if needed
      if (this.config.refreshInterval > 0) {
        setInterval(() => {
          this.fetchPosts(true); // Silent refresh
        }, this.config.refreshInterval);
      }
      
      // Track initialization
      this.trackEvent('gmb_module_initialized');
    } catch (err) {
      console.error('GMB integration initialization error:', err);
      this.showErrorState();
    }
  }
  
  // Fetch posts with error handling and fallbacks
  async fetchPosts(silentRefresh = false) {
    // Prevent multiple simultaneous API calls
    if (this.state.callingApi) return;
    this.state.callingApi = true;
    
    // Don't show loading state if silent refresh
    if (!silentRefresh) {
      this.updateDisplayMode('loading');
    }
    
    try {
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutDuration);
      
      // Try primary endpoint first
      const response = await fetch(this.config.apiEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }).catch(err => {
        console.warn('GMB primary API error:', err.message);
        // Continue to fallback
        throw err;
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Process response
      if (response && response.ok) {
        const data = await response.json();
        
        if (data && Array.isArray(data.posts) && data.posts.length > 0) {
          this.state.posts = data.posts;
          this.state.lastFetched = new Date();
          this.state.hasError = false;
          this.renderPosts();
          this.trackEvent('gmb_posts_loaded', { source: 'primary_api', post_count: data.posts.length });
          return;
        } else {
          throw new Error('Invalid or empty data structure');
        }
      } else {
        throw new Error(`API returned status: ${response ? response.status : 'unknown'}`);
      }
    } catch (primaryError) {
      // Primary endpoint failed, try fallback endpoint
      try {
        console.warn('Using fallback API endpoint');
        
        // Create new timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutDuration);
        
        const fallbackResponse = await fetch(this.config.fallbackEndpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Process fallback response
        if (fallbackResponse && fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          
          if (data && Array.isArray(data.posts) && data.posts.length > 0) {
            this.state.posts = data.posts;
            this.state.lastFetched = new Date();
            this.state.hasError = false;
            this.renderPosts();
            this.trackEvent('gmb_posts_loaded', { source: 'fallback_api', post_count: data.posts.length });
            return;
          } else {
            throw new Error('Invalid or empty fallback data structure');
          }
        } else {
          throw new Error(`Fallback API returned status: ${fallbackResponse ? fallbackResponse.status : 'unknown'}`);
        }
      } catch (fallbackError) {
        // Both endpoints failed, use static fallback data
        console.warn('Using static fallback data', fallbackError);
        this.state.posts = this.config.staticFallbackData;
        this.state.lastFetched = new Date();
        this.state.hasError = false;
        this.renderPosts();
        this.trackEvent('gmb_posts_loaded', { source: 'static_fallback', post_count: this.state.posts.length });
      } finally {
        // Reset API call state
        this.state.callingApi = false;
      }
    }
  }
  
  // Render posts with all error prevention mechanisms
  renderPosts() {
    try {
      // Validate container exists
      if (!this.elements.container) return;
      
      // Hide loading state
      this.updateDisplayMode('normal');
      
      // Clear existing content
      this.elements.container.innerHTML = '';
      
      // Handle empty posts
      if (!this.state.posts || this.state.posts.length === 0) {
        this.updateDisplayMode('empty');
        return;
      }
      
      // Get posts to display (respect max posts limit)
      const postsToDisplay = this.state.posts.slice(0, this.config.maxPosts);
      
      // Create and append post elements
      const fragment = document.createDocumentFragment();
      postsToDisplay.forEach((post, index) => {
        const postEl = this.createPostElement(post, index);
        fragment.appendChild(postEl);
      });
      
      // Add to DOM in a single operation for performance
      this.elements.container.appendChild(fragment);
      
      // Add "View More" link if there are more posts than shown
      if (this.state.posts.length > this.config.maxPosts) {
        const viewMoreLink = document.createElement('div');
        viewMoreLink.classList.add('view-more-posts');
        viewMoreLink.innerHTML = `<a href="https://g.page/jays-mobile-wash" target="_blank" rel="noopener" class="btn-outline btn-sm">View More Updates</a>`;
        this.elements.container.appendChild(viewMoreLink);
      }
    } catch (err) {
      console.error('Error rendering GMB posts:', err);
      this.updateDisplayMode('error');
    }
  }
  
  // Create individual post element with error handling for images
  createPostElement(post, index) {
    const postEl = document.createElement('div');
    postEl.classList.add('gmb-post', post.type.toLowerCase());
    postEl.dataset.index = index;
    
    // Safely use post data with fallbacks for everything
    const title = post.title || 'Latest Update';
    const content = post.content || 'Check out our latest mobile detailing update.';
    const imageUrl = post.imageUrl || post.fallbackImageUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'24\' fill=\'%238a4bff\'%3EJay\'s Mobile Wash%3C/text%3E%3C/svg%3E';
    const date = post.date ? new Date(post.date).toLocaleDateString() : 'Recent';
    const type = post.type || 'UPDATE';
    const cta = post.cta || 'Learn More';
    const ctaUrl = post.ctaUrl || '/';
    
    // Create post HTML with error handling
    postEl.innerHTML = `
      <div class="post-image">
        <img src="${imageUrl}" alt="${title}" width="300" height="200" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'24\' fill=\'%238a4bff\'%3EJay\'s Mobile Wash%3C/text%3E%3C/svg%3E';">
        <span class="post-type">${type}</span>
      </div>
      <div class="post-content">
        <h4>${title}</h4>
        <p>${content}</p>
        <div class="post-meta">
          <span class="post-date">${date}</span>
          <a href="${ctaUrl}" class="post-cta btn-sm" onclick="window.gbpIntegration.trackPostClick(${index})">${cta}</a>
        </div>
      </div>
    `;
    
    // Check image exists and load fallback if needed
    this.checkImageExists(imageUrl)
      .then(exists => {
        if (!exists) {
          const img = postEl.querySelector('img');
          if (img) {
            img.src = post.fallbackImageUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%232a2a3a\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'24\' fill=\'%238a4bff\'%3EJay\'s Mobile Wash%3C/text%3E%3C/svg%3E';
          }
        }
      })
      .catch(() => {
        // Handle error silently, the onerror attribute on the image will handle the fallback
      });
    
    return postEl;
  }
  
  // Check if an image exists and is loadable
  async checkImageExists(url) {
    try {
      // Don't check data URLs
      if (url.startsWith('data:')) return true;
      
      // Use HEAD request to check if image exists
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      return false;
    }
  }
  
  // Update display mode (loading, error, normal, empty)
  updateDisplayMode(mode) {
    this.state.displayMode = mode;
    
    try {
      // Update loading state
      if (this.elements.loading) {
        this.elements.loading.style.display = mode === 'loading' ? 'block' : 'none';
      }
      
      // Update error state
      if (this.elements.error) {
        this.elements.error.style.display = mode === 'error' ? 'block' : 'none';
      }
      
      // Handle empty state
      if (mode === 'empty' && this.elements.container) {
        this.elements.container.innerHTML = `
          <div class="gmb-empty">
            <p>No recent updates available. Visit our <a href="https://g.page/jays-mobile-wash" target="_blank" rel="noopener">Google Business Profile</a> for the latest information.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error('Error updating display mode:', err);
    }
  }
  
  // Handle any API error
  handleApiError(error) {
    console.error('GMB API Error:', error);
    this.state.hasError = true;
    this.state.errorMessage = error.message || 'Unable to load updates';
    this.updateDisplayMode('error');
    
    // Track error for analytics
    this.trackEvent('gmb_error', {
      error_message: this.state.errorMessage
    });
  }
  
  // Track events safely (without errors)
  trackEvent(eventName, params = {}) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          'event_category': 'gmb',
          ...params
        });
      }
    } catch (err) {
      console.warn('Analytics tracking error:', err);
    }
  }
  
  // Track post clicks (exposed for onclick handler)
  trackPostClick(index) {
    try {
      const post = this.state.posts[index];
      if (!post) return;
      
      this.trackEvent('gmb_post_click', {
        post_type: post.type || 'unknown',
        post_title: post.title || 'unknown_title',
        post_index: index
      });
    } catch (err) {
      console.warn('Post click tracking error:', err);
    }
  }
}

// Initialize and expose integration globally (for event handling)
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.gbpIntegration = new GBPIntegration();
  } catch (err) {
    console.error('GMB integration failed:', err);
    
    // Show fallback content
    const container = document.getElementById('gmb-posts-container');
    if (container) {
      container.innerHTML = `
        <div class="gmb-fallback">
          <p>Check out our latest updates on <a href="https://g.page/jays-mobile-wash" target="_blank" rel="noopener">Google</a>.</p>
        </div>
      `;
    }
    
    // Hide loading indicator
    const loading = document.getElementById('gmb-loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }
});
