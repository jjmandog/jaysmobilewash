/**
 * Particle Canvas System for Jay's Mobile Wash
 * Handles foam particle effects and canvas-based animations
 */

const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    particlePool: [],
    maxParticles: 200,
    isActive: true,
    mouseX: 0,
    mouseY: 0,
    isDragging: false,
    audioContext: null,
    analyser: null,
    dataArray: null,
    
    init: function() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) {
            ErrorHandler.log('Particle canvas not found', 'ParticleSystem');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            ErrorHandler.log('Canvas context not available', 'ParticleSystem');
            return;
        }
        
        this.resize();
        this.createParticlePool();
        this.bindEvents();
        this.startAnimation();
        this.initAudioContext();
        
        perfMark('particleSystemInitialized');
    },
    
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticlePool: function() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 0,
                color: '',
                life: 0,
                maxLife: 0,
                type: 'foam',
                active: false,
                targetX: null,
                targetY: null,
                magnetStrength: 0
            });
        }
    },
    
    getParticle: function() {
        return this.particlePool.find(p => !p.active) || null;
    },
    
    bindEvents: function() {
        // Mouse events
        const handleMove = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };
        
        const handleClick = (e) => {
            this.createFoamBurst(e.clientX, e.clientY);
        };
        
        const handleMouseDown = () => { this.isDragging = true; };
        const handleMouseUp = () => { this.isDragging = false; };
        
        document.addEventListener('mousemove', handleMove, { passive: true });
        document.addEventListener('click', handleClick, { passive: true });
        document.addEventListener('mousedown', handleMouseDown, { passive: true });
        document.addEventListener('mouseup', handleMouseUp, { passive: true });
        
        // Touch events
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        document.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            if (e.touches.length > 0) {
                this.createFoamBurst(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            this.isDragging = false;
        }, { passive: true });
        
        // Window resize
        window.addEventListener('resize', ErrorHandler.wrap(() => {
            this.resize();
        }, 'ParticleResize'));
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
        });
    },
    
    initAudioContext: function() {
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            } catch (error) {
                ErrorHandler.log(error, 'AudioContext', 'warn');
            }
        }
    },
    
    createFoamBurst: function(x, y) {
        const burstCount = 30;
        
        for (let i = 0; i < burstCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = (Math.PI * 2 * i) / burstCount;
            const velocity = 5 + Math.random() * 10;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * velocity;
            particle.vy = Math.sin(angle) * velocity;
            particle.size = 5 + Math.random() * 10;
            particle.color = '#FFFFFF';
            particle.life = 1;
            particle.maxLife = 3000;
            particle.type = 'foam';
            particle.active = true;
            particle.magnetStrength = 0.2 + Math.random() * 0.3;
            
            // Set McLaren as magnetic target
            const mclarenBounds = document.querySelector('.mclaren-svg')?.getBoundingClientRect();
            if (mclarenBounds) {
                particle.targetX = mclarenBounds.left + mclarenBounds.width / 2;
                particle.targetY = mclarenBounds.top + mclarenBounds.height / 2;
            }
        }
    },
    
    updateParticles: function(deltaTime) {
        const gravity = 0.3;
        const friction = 0.98;
        
        this.particles = this.particles.filter(particle => {
            if (!particle.active) return false;
            
            // Apply physics
            particle.vy += gravity;
            particle.vx *= friction;
            particle.vy *= friction;
            
            // Magnetic attraction to McLaren
            if (particle.targetX && particle.targetY) {
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 50) {
                    particle.vx += (dx / distance) * particle.magnetStrength;
                    particle.vy += (dy / distance) * particle.magnetStrength;
                }
            }
            
            // Update position
            particle.x += particle.vx * (deltaTime / 16);
            particle.y += particle.vy * (deltaTime / 16);
            
            // Update life
            particle.life -= deltaTime / particle.maxLife;
            
            // Remove if dead or off screen
            if (particle.life <= 0 || particle.y > window.innerHeight + 100) {
                particle.active = false;
                return false;
            }
            
            return true;
        });
        
        // Add active particles from pool
        this.particles = this.particles.concat(
            this.particlePool.filter(p => p.active)
        );
    },
    
    render: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            if (!particle.active) return;
            
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, particle.life);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = particle.color;
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            this.ctx.restore();
        });
    },
    
    startAnimation: function() {
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.isActive) {
                requestAnimationFrame(animate);
                return;
            }
            
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            this.updateParticles(deltaTime);
            this.render();
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    },
    
    cleanup: function() {
        // Reset all particles
        this.particlePool.forEach(p => p.active = false);
        this.particles = [];
    }
};

// Export for use
window.ParticleSystem = ParticleSystem;