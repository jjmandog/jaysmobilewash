/**
 * Main JavaScript for Jay's Mobile Wash
 * Includes all core website functionality with error prevention
 */

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initSmoothScrolling();
  initBackToTop();
  initLanguageSelector();
  setupAccessibility();
  
  // Track page load time
  if (window.performance) {
    const pageLoadTime = Math.round(performance.now());
    trackEvent('page_load_complete', {
      load_time_ms: pageLoadTime
    });
  }
});

// Mobile menu functionality
function initMobileMenu() {
  try {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !mainNav) return;
    
    menuToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
      mainNav.classList.toggle('active');
      
      // Prevent scrolling when menu is open
      document.body.classList.toggle('menu-open');
      
      // Track menu toggle
      trackEvent('mobile_menu_' + (expanded ? 'close' : 'open'));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (mainNav.classList.contains('active') && 
          !mainNav.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });
  } catch (err) {
    console.error('Error initializing mobile menu:', err);
  }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  try {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          // Close mobile menu if open
          const mainNav = document.querySelector('.main-nav');
          const menuToggle = document.querySelector('.mobile-menu-toggle');
          
          if (mainNav && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
          }
          
          // Scroll smoothly
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL hash but avoid jump
          window.history.pushState(null, null, `#${targetId}`);
          
          // Track scroll to section
          trackEvent('scroll_to_section', {
            section: targetId
          });
        }
      });
    });
  } catch (err) {
    console.error('Error initializing smooth scrolling:', err);
    // Non-critical feature, continue execution
  }
}

// Back to top button
function initBackToTop() {
  try {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Track event
      trackEvent('back_to_top_click');
    });
  } catch (err) {
    console.error('Error initializing back to top button:', err);
  }
}

// Language selector
function initLanguageSelector() {
  try {
    // Set up language buttons with error handling
    const enBtn = document.getElementById('en-lang-btn');
    const esBtn = document.getElementById('es-lang-btn');
    
    if (!enBtn || !esBtn) return;
    
    const currentUrl = window.location.pathname;
    
    // Highlight current language
    if (currentUrl.startsWith('/es/')) {
      esBtn.classList.add('active');
      enBtn.classList.remove('active');
    } else {
      enBtn.classList.add('active');
      esBtn.classList.remove('active');
    }
    
    // Handle English button click
    enBtn.addEventListener('click', function() {
      try {
        // Save preference
        localStorage.setItem('preferred_language', 'en');
        
        // Navigate to English version
        if (currentUrl.startsWith('/es/')) {
          window.location.href = currentUrl.replace('/es/', '/');
        } else if (currentUrl === '/es') {
          window.location.href = '/';
        }
      } catch (e) {
        console.error('Error switching to English:', e);
      }
    });
    
    // Handle Spanish button click
    esBtn.addEventListener('click', function() {
      try {
        // Save preference
        localStorage.setItem('preferred_language', 'es');
        
        // Construct Spanish URL
        let spanishUrl;
        if (currentUrl === '/') {
          spanishUrl = '/es/';
        } else if (!currentUrl.startsWith('/es/')) {
          spanishUrl = '/es' + currentUrl;
        } else {
          return; // Already on Spanish page
        }
        
        // Check if Spanish page exists before navigating
        fetch(spanishUrl, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              window.location.href = spanishUrl;
            } else {
              // Fallback to Spanish homepage if specific page doesn't exist
              window.location.href = '/es/';
            }
          })
          .catch(() => {
            // Fallback to Spanish homepage on error
            window.location.href = '/es/';
          });
      } catch (e) {
        console.error('Error switching to Spanish:', e);
      }
    });
  } catch (err) {
    console.error('Language selector error:', err);
  }
}

// Accessibility enhancements
function setupAccessibility() {
  try {
    // Skip to content functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
        }
      });
    }
    
    // Add focus indicators to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    interactiveElements.forEach(el => {
      el.addEventListener('focus', function() {
        this.classList.add('focus-visible');
      });
      el.addEventListener('blur', function() {
        this.classList.remove('focus-visible');
      });
    });
  } catch (err) {
    console.error('Error setting up accessibility features:', err);
  }
}

// Safe analytics tracking
function trackEvent(eventName, params = {}) {
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  } catch (err) {
    console.warn('Analytics tracking error:', err);
  }
}
