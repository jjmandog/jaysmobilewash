/**
 * SPA SEO Head Manager Utility
 * Manages dynamic SEO meta tags, Open Graph, Twitter Cards, and structured data
 * for Single Page Applications and dynamic content updates
 * Version: 1.0.0
 */

class SPASEOHeadManager {
    constructor() {
        this.defaultMeta = this.getCurrentMeta();
        this.init();
    }

    /**
     * Initialize the SEO head manager
     */
    init() {
        // Store original meta data as fallback
        this.originalTitle = document.title;
        this.originalDescription = this.getMetaContent('description');
        this.originalCanonical = this.getCanonicalUrl();
        
        // Set up mutation observer for dynamic content changes
        this.setupMutationObserver();
        
        console.log('SPA SEO Head Manager initialized');
    }

    /**
     * Update page SEO meta data
     * @param {Object} seoData - SEO configuration object
     */
    updateSEO(seoData) {
        if (seoData.title) {
            this.updateTitle(seoData.title);
        }
        
        if (seoData.description) {
            this.updateMetaDescription(seoData.description);
        }
        
        if (seoData.canonical) {
            this.updateCanonical(seoData.canonical);
        }
        
        if (seoData.openGraph) {
            this.updateOpenGraph(seoData.openGraph);
        }
        
        if (seoData.twitterCard) {
            this.updateTwitterCard(seoData.twitterCard);
        }
        
        if (seoData.structuredData) {
            this.updateStructuredData(seoData.structuredData);
        }
        
        if (seoData.keywords) {
            this.updateKeywords(seoData.keywords);
        }
    }

    /**
     * Update page title
     * @param {String} title - New page title
     */
    updateTitle(title) {
        document.title = title;
        this.updateMetaProperty('og:title', title);
        this.updateMetaProperty('twitter:title', title);
    }

    /**
     * Update meta description
     * @param {String} description - New meta description
     */
    updateMetaDescription(description) {
        this.updateMetaContent('description', description);
        this.updateMetaProperty('og:description', description);
        this.updateMetaProperty('twitter:description', description);
    }

    /**
     * Update canonical URL
     * @param {String} url - New canonical URL
     */
    updateCanonical(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.href = url;
        } else {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = url;
            document.head.appendChild(canonical);
        }
        
        this.updateMetaProperty('og:url', url);
    }

    /**
     * Update Open Graph meta tags
     * @param {Object} ogData - Open Graph data object
     */
    updateOpenGraph(ogData) {
        Object.keys(ogData).forEach(key => {
            this.updateMetaProperty(`og:${key}`, ogData[key]);
        });
    }

    /**
     * Update Twitter Card meta tags
     * @param {Object} twitterData - Twitter Card data object
     */
    updateTwitterCard(twitterData) {
        Object.keys(twitterData).forEach(key => {
            this.updateMetaProperty(`twitter:${key}`, twitterData[key]);
        });
    }

    /**
     * Update or add structured data (JSON-LD)
     * @param {Object} structuredData - Structured data object
     * @param {String} id - Optional ID for the script tag
     */
    updateStructuredData(structuredData, id = 'spa-seo-structured-data') {
        // Remove existing structured data with this ID
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }
        
        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    /**
     * Update keywords meta tag
     * @param {String|Array} keywords - Keywords string or array
     */
    updateKeywords(keywords) {
        const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        this.updateMetaContent('keywords', keywordsString);
    }

    /**
     * Update meta content by name
     * @param {String} name - Meta name attribute
     * @param {String} content - Meta content value
     */
    updateMetaContent(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    /**
     * Update meta property (for Open Graph, Twitter Cards, etc.)
     * @param {String} property - Meta property attribute
     * @param {String} content - Meta content value
     */
    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.property = property;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    /**
     * Get current meta content by name
     * @param {String} name - Meta name attribute
     * @returns {String} Meta content value
     */
    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.content : '';
    }

    /**
     * Get current canonical URL
     * @returns {String} Canonical URL
     */
    getCanonicalUrl() {
        const canonical = document.querySelector('link[rel="canonical"]');
        return canonical ? canonical.href : window.location.href;
    }

    /**
     * Get current meta data
     * @returns {Object} Current meta data object
     */
    getCurrentMeta() {
        return {
            title: document.title,
            description: this.getMetaContent('description'),
            keywords: this.getMetaContent('keywords'),
            canonical: this.getCanonicalUrl()
        };
    }

    /**
     * Reset SEO data to original values
     */
    resetToOriginal() {
        this.updateSEO({
            title: this.originalTitle,
            description: this.originalDescription,
            canonical: this.originalCanonical
        });
    }

    /**
     * Setup mutation observer to track DOM changes
     */
    setupMutationObserver() {
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.target.nodeName === 'HEAD') {
                        // Head changes detected - useful for debugging
                        console.log('Head section changed - SPA SEO Manager tracking');
                    }
                });
            });

            observer.observe(document.head, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Generate structured data for local business
     * @param {Object} businessData - Business information
     * @returns {Object} Structured data object
     */
    generateLocalBusinessStructuredData(businessData) {
        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": businessData.name,
            "description": businessData.description,
            "url": businessData.url,
            "telephone": businessData.phone,
            "address": businessData.address,
            "geo": businessData.geo,
            "openingHours": businessData.hours,
            "priceRange": businessData.priceRange,
            "areaServed": businessData.areaServed
        };
    }
}

// Initialize global SPA SEO Head Manager
window.SPASEOManager = new SPASEOHeadManager();

// Expose utility functions globally
window.updatePageSEO = function(seoData) {
    window.SPASEOManager.updateSEO(seoData);
};

window.resetSEO = function() {
    window.SPASEOManager.resetToOriginal();
};