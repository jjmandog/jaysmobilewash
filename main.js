document.addEventListener('DOMContentLoaded', function() {
    console.log("Main JS initialized");
    
    // Jay Mode Button Safety Net - Ensure always-on-top class is maintained
    function ensureJayModeButtonAccessibility() {
        const jayButton = document.getElementById('jay-mode-button');
        if (jayButton && !jayButton.classList.contains('always-on-top')) {
            console.log('[Jay Mode] Re-applying always-on-top class to Jay Mode button');
            jayButton.classList.add('always-on-top');
        }
    }
    
    // Initial check
    ensureJayModeButtonAccessibility();
    
    // Set up mutation observer to watch for class changes on the Jay Mode button
    const jayButton = document.getElementById('jay-mode-button');
    if (jayButton) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    ensureJayModeButtonAccessibility();
                }
            });
        });
        
        observer.observe(jayButton, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
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
    
    // Add cool hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(147, 51, 234, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Add subtle animation to benefit icons
    const benefitIcons = document.querySelectorAll('.benefit-item i');
    benefitIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0)';
        });
    });
});
// Function to open the chat widget
function openChat() {
    document.getElementById('chat-toggle').click();
    document.getElementById('chat-window').classList.remove('hidden');
}
