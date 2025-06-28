/**
 * Circuit Breaker Module for Jay's Mobile Wash
 * Provides error handling, retry logic, and system resilience
 */

const CircuitBreaker = {
    circuits: new Map(),
    defaultConfig: {
        failureThreshold: 5,
        timeout: 60000, // 1 minute
        monitoringPeriod: 60000 // 1 minute
    },
    
    /**
     * Create a new circuit breaker
     */
    create: function(name, config = {}) {
        const circuitConfig = { ...this.defaultConfig, ...config };
        
        const circuit = {
            name: name,
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            failureCount: 0,
            successCount: 0,
            lastFailureTime: null,
            config: circuitConfig,
            stats: {
                totalRequests: 0,
                totalFailures: 0,
                totalSuccesses: 0
            }
        };
        
        this.circuits.set(name, circuit);
        return circuit;
    },
    
    /**
     * Execute a function with circuit breaker protection
     */
    execute: function(circuitName, fn, fallback = null) {
        const circuit = this.circuits.get(circuitName) || this.create(circuitName);
        
        // Check if circuit is open
        if (circuit.state === 'OPEN') {
            if (this.shouldAttemptReset(circuit)) {
                circuit.state = 'HALF_OPEN';
            } else {
                // Circuit is open, use fallback
                if (fallback) return fallback();
                throw new Error(`Circuit breaker ${circuitName} is OPEN`);
            }
        }
        
        circuit.stats.totalRequests++;
        
        try {
            const result = fn();
            this.onSuccess(circuit);
            return result;
        } catch (error) {
            this.onFailure(circuit, error);
            
            if (fallback) return fallback();
            throw error;
        }
    },
    
    /**
     * Execute async function with circuit breaker protection
     */
    executeAsync: async function(circuitName, fn, fallback = null) {
        const circuit = this.circuits.get(circuitName) || this.create(circuitName);
        
        // Check if circuit is open
        if (circuit.state === 'OPEN') {
            if (this.shouldAttemptReset(circuit)) {
                circuit.state = 'HALF_OPEN';
            } else {
                // Circuit is open, use fallback
                if (fallback) return await fallback();
                throw new Error(`Circuit breaker ${circuitName} is OPEN`);
            }
        }
        
        circuit.stats.totalRequests++;
        
        try {
            const result = await fn();
            this.onSuccess(circuit);
            return result;
        } catch (error) {
            this.onFailure(circuit, error);
            
            if (fallback) return await fallback();
            throw error;
        }
    },
    
    /**
     * Handle successful execution
     */
    onSuccess: function(circuit) {
        circuit.failureCount = 0;
        circuit.successCount++;
        circuit.stats.totalSuccesses++;
        
        if (circuit.state === 'HALF_OPEN') {
            circuit.state = 'CLOSED';
        }
    },
    
    /**
     * Handle failed execution
     */
    onFailure: function(circuit, error) {
        circuit.failureCount++;
        circuit.stats.totalFailures++;
        circuit.lastFailureTime = Date.now();
        
        ErrorHandler.log(error, `CircuitBreaker-${circuit.name}`, 'warn');
        
        if (circuit.failureCount >= circuit.config.failureThreshold) {
            circuit.state = 'OPEN';
            ErrorHandler.log(
                `Circuit breaker ${circuit.name} opened due to ${circuit.failureCount} failures`,
                'CircuitBreaker',
                'error'
            );
        }
    },
    
    /**
     * Check if circuit should attempt reset
     */
    shouldAttemptReset: function(circuit) {
        return Date.now() - circuit.lastFailureTime > circuit.config.timeout;
    },
    
    /**
     * Get circuit status
     */
    getStatus: function(circuitName) {
        const circuit = this.circuits.get(circuitName);
        if (!circuit) return null;
        
        return {
            name: circuit.name,
            state: circuit.state,
            failureCount: circuit.failureCount,
            successCount: circuit.successCount,
            stats: { ...circuit.stats },
            uptime: circuit.stats.totalRequests > 0 
                ? (circuit.stats.totalSuccesses / circuit.stats.totalRequests) * 100 
                : 100
        };
    },
    
    /**
     * Reset a circuit breaker
     */
    reset: function(circuitName) {
        const circuit = this.circuits.get(circuitName);
        if (circuit) {
            circuit.state = 'CLOSED';
            circuit.failureCount = 0;
            circuit.successCount = 0;
            circuit.lastFailureTime = null;
        }
    },
    
    /**
     * Get all circuit statuses
     */
    getAllStatuses: function() {
        const statuses = {};
        this.circuits.forEach((circuit, name) => {
            statuses[name] = this.getStatus(name);
        });
        return statuses;
    },
    
    /**
     * Wrap a function with circuit breaker
     */
    wrap: function(name, fn, config = {}) {
        this.create(name, config);
        
        return (...args) => {
            return this.execute(name, () => fn(...args));
        };
    },
    
    /**
     * Wrap an async function with circuit breaker
     */
    wrapAsync: function(name, fn, config = {}) {
        this.create(name, config);
        
        return async (...args) => {
            return await this.executeAsync(name, () => fn(...args));
        };
    }
};

// Export for use
window.CircuitBreaker = CircuitBreaker;