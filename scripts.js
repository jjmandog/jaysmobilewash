/**
 * Main JavaScript for Jay's Mobile Wash
 * Version: 1.0.0
 * Last Updated: 2025-06-27 00:36:38
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    initializeMobileMenu();
    
    // Initialize all interactive elements
    initializeInteractiveElements();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Form submission handler
    initializeFormHandling();
    
    // Apply hover-glow class to headings
    initializeHoverEffects();
    
    // Update timestamps
    updateTimestamps();
});

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

/**
 * Toggle details visibility with animation
 */
function toggleDetails(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add a nice animation when expanding
        if (element.classList.contains('active')) {
            // Collapsing
            element.style.maxHeight = element.scrollHeight + 'px';
            setTimeout(() => {
                element.style.maxHeight = '0px';
                element.style.opacity = '0';
            }, 10);
            setTimeout(() => {
                element.classList.remove('active');
            }, 500);
        } else {
            // Expanding
            element.classList.add('active');
            element.style.maxHeight = '0px';
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.maxHeight = element.scrollHeight + 'px';
                element.style.opacity = '1';
            }, 10);
        }
    }
}

/**
 * Initialize all interactive elements
 */
function initializeInteractiveElements() {
    // Make all expandable elements use the toggleDetails function
    const expandButtons = document.querySelectorAll('.expand-details');
    expandButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering parent card clicks
            const targetId = this.getAttribute('data-target');
            const icon = this.querySelector('i');
            
            if (icon) {
                icon.classList.toggle('rotate-180');
            }
            
            toggleDetails(targetId);
            
            // Update aria-expanded attribute for accessibility
            const isExpanded = document.getElementById(targetId).classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
    });
    
    // Make service cards clickable
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const detailId = this.getAttribute('data-details');
            if (detailId) {
                toggleDetails(detailId);
            }
        });
    });
    
    // FAQ toggle with accordion behavior
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const answer = this.nextElementSibling;
            
            // Close other open FAQs
            faqToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    const otherIcon = otherToggle.querySelector('i');
                    const otherAnswer = otherToggle.nextElementSibling;
                    if (otherAnswer.classList.contains('active')) {
                        otherIcon.classList.remove('rotate-180');
                        otherAnswer.classList.remove('active');
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle current FAQ
            icon.classList.toggle('rotate-180');
            answer.classList.toggle('active');
            this.setAttribute('aria-expanded', answer.classList.contains('active'));
        });
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Offset for fixed header
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize form handling
 */
function initializeFormHandling() {
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            let valid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('border-red-500');
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            if (valid) {
                // Normally we would submit the form here
                // For now, just show a success message
                alert('Thank you for your message! We will contact you within 24 hours.');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }
}

/**
 * Initialize hover effects
 */
function initializeHoverEffects() {
    // Add hover-glow class to headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        if (!heading.classList.contains('hover-glow')) {
            heading.classList.add('hover-glow');
        }
    });
    
    // Add btn-glow to buttons that don't have it
    const buttons = document.querySelectorAll('a.bg-gradient-to-r, button:not(.btn-glow)');
    buttons.forEach(button => {
        if (!button.classList.contains('btn-glow')) {
            button.classList.add('btn-glow');
        }
    });
}

/**
 * Update timestamps across site
 */
function updateTimestamps() {
    const currentDateTime = "2025-06-27 00:36:38";
    const timestampElements = document.querySelectorAll('.timestamp');
    timestampElements.forEach(el => {
        el.textContent = currentDateTime;
    });
    
    // Update footer timestamp
    const footerTimestamp = document.querySelector('footer .text-xs.text-gray-500');
    if (footerTimestamp) {
        footerTimestamp.textContent = `Last updated: ${currentDateTime}`;
    }
}
