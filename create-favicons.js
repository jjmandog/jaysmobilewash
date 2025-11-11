// Create favicon files from your logo
import fs from 'fs';
import path from 'path';

// Copy your logo to create favicons (we'll use your existing logo)
// This will ensure your logo is used as the favicon

console.log('🎨 Setting up your logo as favicon...');

// Copy your logo to favicon locations
const logoPath = 'unnamed.png';
const faviconSizes = [
    { size: '16x16', filename: 'favicon-16x16.png' },
    { size: '32x32', filename: 'favicon-32x32.png' },
    { size: '192x192', filename: 'android-chrome-192x192.png' },
    { size: '512x512', filename: 'android-chrome-512x512.png' },
    { size: '180x180', filename: 'apple-touch-icon.png' }
];

try {
    // Use your existing logo file
    if (fs.existsSync(logoPath)) {
        console.log('✅ Using your logo: ' + logoPath);
        
        // Copy to standard favicon name
        fs.copyFileSync(logoPath, 'favicon.png');
        console.log('✅ Created favicon.png from your logo');
        
        // Create all favicon variants (simplified - using same logo)
        faviconSizes.forEach(({ filename }) => {
            fs.copyFileSync(logoPath, filename);
            console.log('✅ Created ' + filename);
        });
        
        console.log('🎉 All favicon files created from your logo!');
    } else {
        console.log('❌ Logo file not found: ' + logoPath);
    }
} catch (error) {
    console.error('Error creating favicons:', error);
}