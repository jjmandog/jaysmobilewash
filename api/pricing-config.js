// API endpoint for managing global pricing configuration
const fs = require('fs').promises;
const path = require('path');

// Path to store the global pricing configuration
const CONFIG_FILE = path.join(__dirname, 'pricing-data.json');

// Default configuration (fallback if file doesn't exist)
const DEFAULT_CONFIG = {
    basePrices: {
        mini: { name: 'Mini Detail', price: 70, description: 'Basic exterior & interior' },
        luxury: { name: 'Luxury Detail', price: 130, description: 'Premium clean + protection' },
        max: { name: 'Max Detail', price: 200, description: 'Ultimate treatment' }
    },
    serviceLevels: {
        'not-included': { name: 'Not Included', price: 0, color: '#ef4444', strokeColor: '#dc2626' },
        'basic-clean': { name: 'Basic Clean', price: 0, color: '#22c55e', strokeColor: '#16a34a' },
        'premium-clean': { name: 'Premium Clean', price: 20, color: '#3b82f6', strokeColor: '#2563eb' },
        'luxury-treatment': { name: 'Luxury Treatment', price: 40, color: '#a855f7', strokeColor: '#9333ea' },
        'ceramic-protection': { name: 'Ceramic Protection', price: 150, color: '#f59e0b', strokeColor: '#d97706' },
        'graphene-shield': { name: 'Graphene Shield', price: 300, color: '#ec4899', strokeColor: '#db2777' }
    },
    partMultipliers: {
        'hood': 1.0,
        'roof': 1.0,
        'trunk': 1.0,
        'front-door': 0.8,
        'rear-door': 0.8,
        'front-fender': 0.6,
        'rear-fender': 0.6,
        'bumper-front': 0.7,
        'bumper-rear': 0.7,
        'mirror': 0.2,
        'dashboard': 0.8,
        'seats': 1.0,
        'door-panels': 0.6,
        'console': 0.4,
        'carpet': 0.8,
        'headliner': 0.6
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system'
};

// Load configuration from file
async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Config file not found, using defaults');
        // Create default config file
        await saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }
}

// Save configuration to file
async function saveConfig(config) {
    try {
        // Add metadata
        config.lastUpdated = new Date().toISOString();
        
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log('Configuration saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving configuration:', error);
        return false;
    }
}

// Verify admin password
function verifyAdmin(password) {
    return password === 'piepie';
}

// API handler function
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get current configuration
            const config = await loadConfig();
            res.status(200).json({
                success: true,
                config: config,
                message: 'Configuration loaded successfully'
            });

        } else if (req.method === 'POST' || req.method === 'PUT') {
            // Update configuration (requires admin password)
            const { password, config: newConfig } = req.body;

            // Verify admin password
            if (!verifyAdmin(password)) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid admin password'
                });
                return;
            }

            // Validate configuration structure
            if (!newConfig || !newConfig.basePrices || !newConfig.serviceLevels) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid configuration structure'
                });
                return;
            }

            // Add update metadata
            newConfig.updatedBy = 'admin';
            
            // Save configuration
            const success = await saveConfig(newConfig);
            
            if (success) {
                res.status(200).json({
                    success: true,
                    message: 'Configuration updated successfully for all users',
                    timestamp: newConfig.lastUpdated
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to save configuration'
                });
            }

        } else {
            res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
