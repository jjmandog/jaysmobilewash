document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    
    // FAQ toggles
    const faqButtons = document.querySelectorAll('.faq-question');
    
    if (faqButtons) {
        faqButtons.forEach(button => {
            button.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const icon = this.querySelector('.toggle-icon');
                
                answer.classList.toggle('active');
                if (icon) {
                    icon.classList.toggle('rotate-180');
                }
            });
        });
    }
    
    // Hidden content togglers
    const contentTogglers = document.querySelectorAll('[data-toggle="content"]');
    
    if (contentTogglers) {
        contentTogglers.forEach(toggler => {
            toggler.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                
                if (targetContent) {
                    targetContent.classList.toggle('active');
                    this.classList.toggle('active');
                }
            });
        });
    }
    
    // Testimonial carousel
    let currentSlide = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    const totalSlides = testimonials.length;
    
    if (testimonials.length > 0) {
        // Initial setup
        testimonials.forEach((slide, index) => {
            if (index !== 0) {
                slide.style.display = 'none';
            }
        });
        
        // Auto rotate testimonials
        setInterval(() => {
            testimonials[currentSlide].style.display = 'none';
            currentSlide = (currentSlide + 1) % totalSlides;
            testimonials[currentSlide].style.display = 'block';
        }, 5000);
    }
    
    // Glow effects for cards
    const glowCards = document.querySelectorAll('.card-glow');
    
    if (glowCards) {
        glowCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(168, 85, 247, 0.15), transparent 60%)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        });
    }
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    if (forms) {
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                let hasError = false;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        hasError = true;
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                });
                
                if (hasError) {
                    e.preventDefault();
                }
            });
        });
    }
});
