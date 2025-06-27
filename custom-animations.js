/**
 * Jay's Mobile Wash - Custom Animation JavaScript
 * Last updated: 2025-06-27
 * Author: JJ Mandog
 */

document.addEventListener('DOMContentLoaded', function() {
  // =================================================
  // CUSTOM CURSOR IMPLEMENTATION
  // =================================================
  
  // Enable custom cursor functionality on the entire site
  document.body.classList.add('custom-cursor-enabled');
  
  // Special cursor states for different elements
  const linkElements = document.querySelectorAll('a, button, .clickable');
  const detailElements = document.querySelectorAll('.detail-section, .package-card');
  const washElements = document.querySelectorAll('.wash-service, .foam-section, .car-image');
  
  // Apply custom cursors to different element types
  linkElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.remove('custom-cursor-enabled');
      document.body.classList.add('custom-cursor-link');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('custom-cursor-link');
      document.body.classList.add('custom-cursor-enabled');
    });
  });
  
  detailElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.remove('custom-cursor-enabled');
      document.body.classList.add('custom-cursor-click');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('custom-cursor-click');
      document.body.classList.add('custom-cursor-enabled');
    });
  });
  
  washElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.remove('custom-cursor-enabled');
      document.body.classList.add('custom-cursor-foam');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('custom-cursor-foam');
      document.body.classList.add('custom-cursor-enabled');
    });
  });

  // =================================================
  // DYNAMIC GLOWING TEXT EFFECT
  // =================================================
  
  // Find all elements with the glowing-text class
  const glowingElements = document.querySelectorAll('.glowing-text, .glowing-text-intense, .gradient-text');
  
  // Add random slight variation to the glow animation
  glowingElements.forEach(el => {
    // Create a small random delay for each element to make the effect more natural
    const randomDelay = Math.random() * 2; // Between 0 and 2 seconds
    el.style.animationDelay = `${randomDelay}s`;
  });
  
  // =================================================
  // RAINBOW TEXT HOVER EFFECT
  // =================================================
  
  // Apply rainbow highlight effect to navigation menu items
  const navItems = document.querySelectorAll('nav a');
  
  navItems.forEach(item => {
    item.classList.add('rainbow-highlight');
  });
  
  // =================================================
  // DYNAMIC BUBBLE ANIMATION
  // =================================================
  
  // Add bubbles to hero and wash sections
  const bubbleSections = document.querySelectorAll('.hero-gradient, #mobile-washing');
  
  bubbleSections.forEach(section => {
    // Mark as bubble container
    section.classList.add('bubble-container');
    
    // Create random number of bubbles (5-10)
    const bubbleCount = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      
      // Randomize bubble properties
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.width = `${Math.random() * 20 + 10}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.animationDelay = `${Math.random() * 10}s`;
      bubble.style.animationDuration = `${Math.random() * 7 + 3}s`;
      
      section.appendChild(bubble);
    }
  });
  
  // =================================================
  // FLOATING ANIMATION FOR CARDS
  // =================================================
  
  // Add floating animation to service cards
  const serviceCards = document.querySelectorAll('.bg-gray-800.rounded-xl');
  
  serviceCards.forEach((card, index) => {
    card.classList.add('float-animation');
    
    // Stagger the animation for a wave effect
    card.style.animationDelay = `${index * 0.2}s`;
  });
  
  // =================================================
  // PULSE ANIMATION FOR CTA BUTTONS
  // =================================================
  
  // Add pulse animation to main call-to-action buttons
  const ctaButtons = document.querySelectorAll('.bg-gradient-to-r.from-purple-600.to-pink-500');
  
  ctaButtons.forEach(button => {
    button.classList.add('pulse-element');
  });
  
  // =================================================
  // SHINE EFFECT FOR IMAGES
  // =================================================
  
  // Add shine effect to images
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.classList.add('shine-effect');
  });
  
  // =================================================
  // WATER RIPPLE EFFECT FOR MOBILE WASHING SECTION
  // =================================================
  
  const washingSection = document.querySelector('#mobile-washing');
  
  if (washingSection) {
    washingSection.classList.add('water-ripple');
  }
  
  // =================================================
  // APPLY RAINBOW BORDER EFFECT TO PREMIUM PACKAGES
  // =================================================
  
  const premiumPackage = document.querySelector('.bg-purple-600.text-white');
  
  if (premiumPackage && premiumPackage.closest('.bg-gray-800.rounded-xl')) {
    const packageCard = premiumPackage.closest('.bg-gray-800.rounded-xl');
    packageCard.classList.add('rainbow-button');
  }
  
  // =================================================
  // AUTOMATIC ANIMATION CLASS APPLICATION
  // =================================================
  
  // Find headings with gradient-text and add glowing effect
  const gradientHeadings = document.querySelectorAll('.gradient-text');
  gradientHeadings.forEach(heading => {
    heading.classList.add('glowing-text-intense');
  });
  
  // Add slight floating animation to testimonials
  const testimonials = document.querySelectorAll('.bg-gray-800.rounded-xl.p-8.text-left.relative');
  testimonials.forEach((testimonial, index) => {
    testimonial.classList.add('float-animation');
    testimonial.style.animationDelay = `${index * 0.3}s`;
  });
  
  // Add rainbow hover effect to footer links
  const footerLinks = document.querySelectorAll('footer a');
  footerLinks.forEach(link => {
    link.classList.add('rainbow-text-hover');
  });

  // =================================================
  // INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
  // =================================================
  
  // Create intersection observer to trigger animations when elements are in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If element is in view
      if (entry.isIntersecting) {
        // Add animation classes based on data attribute
        const animationType = entry.target.dataset.animateOnScroll;
        
        if (animationType === 'glow') {
          entry.target.classList.add('glowing-text');
        } else if (animationType === 'float') {
          entry.target.classList.add('float-animation');
        } else if (animationType === 'pulse') {
          entry.target.classList.add('pulse-element');
        }
        
        // Unobserve after animation is added
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1, // Trigger when at least 10% of the element is visible
    rootMargin: '0px'
  });
  
  // Find all elements with data-animate-on-scroll attribute
  const scrollAnimElements = document.querySelectorAll('[data-animate-on-scroll]');
  
  // Observe each element
  scrollAnimElements.forEach(el => {
    observer.observe(el);
  });
  
  // =================================================
  // PERFORMANCE OPTIMIZATIONS
  // =================================================
  
  // Throttle intensive animations on mobile devices
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  function optimizeForMobile() {
    if (isMobile()) {
      // Remove some animations on mobile for better performance
      document.querySelectorAll('.bubble').forEach(bubble => {
        bubble.style.display = 'none';
      });
      
      document.querySelectorAll('.float-animation').forEach(el => {
        el.classList.remove('float-animation');
      });
    }
  }
  
  // Call initially
  optimizeForMobile();
  
  // Update on resize
  window.addEventListener('resize', optimizeForMobile);
  
  // Clean up animations when tab is not visible for performance
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.body.classList.add('animations-paused');
    } else {
      document.body.classList.remove('animations-paused');
    }
  });
  
  // Add a global CSS class to pause animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .animations-paused * {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(styleSheet);
});
