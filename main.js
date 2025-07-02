document.addEventListener('DOMContentLoaded', function() {
    // Helper function to log with centralized error handler if available
    function logMainInfo(message) {
        if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logInfo) {
            window.errorHandler.logInfo('General', message);
        } else {
            console.log(`[JAYS_CHAT_ERROR] [General] ${message}`);
        }
    }

    logMainInfo("Main JS initialized");
    
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
