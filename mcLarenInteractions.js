/**
 * McLaren Interactions Module for Jay's Mobile Wash
 * Handles interactive elements and animations for the McLaren SVG
 */

const McLarenInteractions = {
    svg: null,
    wheels: [],
    animationFrames: new Map(),
    
    init: function() {
        this.svg = document.querySelector('.mclaren-svg');
        if (!this.svg) {
            ErrorHandler.log('McLaren SVG not found', 'McLarenInteractions');
            return;
        }
        
        this.bindInteractions();
        perfMark('mclarenInteractionsInitialized');
    },
    
    bindInteractions: function() {
        const hoverZones = this.svg.querySelectorAll('.hover-zone');
        
        hoverZones.forEach(zone => {
            zone.addEventListener('click', ErrorHandler.wrap((e) => {
                e.preventDefault();
                const action = e.currentTarget.dataset.action;
                this.handleAction(action, e.currentTarget);
            }, 'McLarenClick'));
            
            zone.addEventListener('mouseenter', ErrorHandler.wrap((e) => {
                e.currentTarget.style.fill = 'rgba(255, 107, 53, 0.1)';
            }, 'McLarenHover'));
            
            zone.addEventListener('mouseleave', ErrorHandler.wrap((e) => {
                e.currentTarget.style.fill = 'transparent';
            }, 'McLarenLeave'));
        });
    },
    
    handleAction: function(action, element) {
        switch(action) {
            case 'spin-wheel':
                this.spinWheel(element);
                break;
            case 'open-door':
                this.openDoor();
                break;
            case 'rev-engine':
                this.revEngine();
                break;
            case 'wiper':
                this.activateWiper();
                break;
        }
    },
    
    spinWheel: function(element) {
        const isRear = element.classList.contains('rear');
        const wheel = this.svg.querySelector(isRear ? '.rear-wheel' : '.front-wheel');
        
        if (wheel && !wheel.classList.contains('spinning')) {
            wheel.classList.add('spinning');
            
            // Create tire smoke particles
            const rect = wheel.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.bottom;
            
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const particle = ParticleSystem.getParticle();
                    if (particle) {
                        particle.x = x + (Math.random() - 0.5) * 20;
                        particle.y = y;
                        particle.vx = (Math.random() - 0.5) * 3;
                        particle.vy = -Math.random() * 5;
                        particle.size = 15 + Math.random() * 10;
                        particle.color = '#CCCCCC';
                        particle.life = 1;
                        particle.maxLife = 1500;
                        particle.type = 'smoke';
                        particle.active = true;
                    }
                }, i * 50);
            }
            
            setTimeout(() => {
                wheel.classList.remove('spinning');
            }, 1000);
        }
    },
    
    openDoor: function() {
        const doorPath = this.svg.querySelector('.door-outline');
        const doorGroup = doorPath?.parentElement;
        
        if (doorGroup && !doorGroup.classList.contains('door-opening')) {
            doorGroup.classList.add('door-opening');
            
            setTimeout(() => {
                doorGroup.classList.remove('door-opening');
            }, 2000);
        }
    },
    
    revEngine: function() {
        const carBody = this.svg.querySelector('#mclarenBody');
        if (carBody && !carBody.classList.contains('engine-revving')) {
            carBody.classList.add('engine-revving');
            
            // Create exhaust particles
            const exhaustX = 700;
            const exhaustY = 270;
            
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const particle = ParticleSystem.getParticle();
                    if (particle) {
                        particle.x = exhaustX;
                        particle.y = exhaustY;
                        particle.vx = 5 + Math.random() * 10;
                        particle.vy = (Math.random() - 0.5) * 5;
                        particle.size = 10 + Math.random() * 20;
                        particle.color = '#666666';
                        particle.life = 1;
                        particle.maxLife = 2000;
                        particle.type = 'exhaust';
                        particle.active = true;
                    }
                }, i * 30);
            }
            
            setTimeout(() => {
                carBody.classList.remove('engine-revving');
            }, 500);
        }
    },
    
    activateWiper: function() {
        const windshield = this.svg.querySelector('.windshield');
        if (windshield && !windshield.classList.contains('wiper-active')) {
            windshield.classList.add('wiper-active');
            
            // Create water droplet particles
            const rect = windshield.getBoundingClientRect();
            
            for (let i = 0; i < 15; i++) {
                const particle = ParticleSystem.getParticle();
                if (particle) {
                    particle.x = rect.left + Math.random() * rect.width;
                    particle.y = rect.top + Math.random() * rect.height;
                    particle.vx = (Math.random() - 0.5) * 10;
                    particle.vy = -Math.random() * 10;
                    particle.size = 3 + Math.random() * 5;
                    particle.color = '#00D4FF';
                    particle.life = 1;
                    particle.maxLife = 1000;
                    particle.type = 'water';
                    particle.active = true;
                }
            }
            
            setTimeout(() => {
                windshield.classList.remove('wiper-active');
            }, 1000);
        }
    }
};

// Export for use
window.McLarenInteractions = McLarenInteractions;