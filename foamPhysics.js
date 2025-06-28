/**
 * Foam Physics Module for Jay's Mobile Wash
 * Handles foam particle physics and behavior
 */

const FoamPhysics = {
    gravity: 0.3,
    friction: 0.98,
    magnetStrength: 0.5,
    
    /**
     * Apply physics to a foam particle
     */
    applyPhysics: function(particle, deltaTime) {
        // Apply gravity
        particle.vy += this.gravity;
        
        // Apply friction
        particle.vx *= this.friction;
        particle.vy *= this.friction;
        
        return particle;
    },
    
    /**
     * Apply magnetic attraction to McLaren
     */
    applyMagneticField: function(particle, targetX, targetY) {
        if (!targetX || !targetY) return particle;
        
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
            const magnetForce = particle.magnetStrength || this.magnetStrength;
            particle.vx += (dx / distance) * magnetForce;
            particle.vy += (dy / distance) * magnetForce;
        }
        
        return particle;
    },
    
    /**
     * Create foam burst pattern
     */
    createBurstPattern: function(centerX, centerY, count = 30) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 5 + Math.random() * 10;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 5 + Math.random() * 10,
                color: '#FFFFFF',
                life: 1,
                maxLife: 3000,
                type: 'foam',
                active: true,
                magnetStrength: 0.2 + Math.random() * 0.3
            });
        }
        
        return particles;
    },
    
    /**
     * Update particle lifecycle
     */
    updateLifecycle: function(particle, deltaTime) {
        // Update life
        particle.life -= deltaTime / particle.maxLife;
        
        // Check bounds
        const isOffScreen = particle.y > window.innerHeight + 100 || 
                           particle.x < -100 || 
                           particle.x > window.innerWidth + 100;
        
        // Remove if dead or off screen
        if (particle.life <= 0 || isOffScreen) {
            particle.active = false;
            return false;
        }
        
        return true;
    },
    
    /**
     * Calculate foam density effect
     */
    calculateDensity: function(particles) {
        const density = particles.filter(p => p.active && p.type === 'foam').length;
        return Math.min(density / 100, 1); // Normalize to 0-1
    },
    
    /**
     * Apply wind effect to foam particles
     */
    applyWindEffect: function(particle, windStrength = 0.1) {
        if (particle.type === 'foam') {
            particle.vx += (Math.random() - 0.5) * windStrength;
        }
        return particle;
    }
};

// Export for use
window.FoamPhysics = FoamPhysics;