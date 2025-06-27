/**
 * Main JavaScript - Minimal Version
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Main JS initialized");
  
  // Fix background styling
  document.body.classList.add('classic-bg');
  
  // Fix header scrolling issue
  const header = document.querySelector('.site-header');
  if (header) {
    header.classList.add('fixed-header');
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
  }
  
  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
  }
  
  // Animation for service cards
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length) {
    serviceCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.classList.add('hover');
      });
      card.addEventListener('mouseleave', function() {
        this.classList.remove('hover');
      });
    });
  }
});
