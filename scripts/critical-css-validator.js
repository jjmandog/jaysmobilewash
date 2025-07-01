#!/usr/bin/env node

/**
 * Critical CSS Preload Verification Script
 * Validates critical CSS preloading in HTML head and flags missing critical resources
 * Production-grade performance optimization checker for Jay's Mobile Wash
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class CriticalCSSValidator {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.htmlFiles = options.htmlFiles || [
      'index.html',
      'services-exterior-detailing.html',
      'services-interior-detailing.html',
      'services-ceramic-coating.html',
      'locations-los-angeles.html',
      'locations-orange-county.html',
      'locations-beverly-hills.html',
      'about.html',
      'privacy.html',
      'terms.html',
      'products.html'
    ];
    
    this.criticalResources = {
      fonts: [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'font',
        '.woff2',
        '.woff',
        '.ttf'
      ],
      css: [
        'tailwindcss',
        'font-awesome',
        'cdnjs.cloudflare.com',
        '.css'
      ],
      images: [
        'hero',
        'logo',
        'banner',
        'above-the-fold'
      ]
    };
    
    this.results = [];
  }

  /**
   * Run comprehensive critical CSS validation
   */
  async validateCriticalCSS() {
    console.log('⚡ Starting Critical CSS Preload Validation');
    console.log(`📄 Checking ${this.htmlFiles.length} HTML files`);
    console.log('');

    for (const file of this.htmlFiles) {
      console.log(`🔍 Validating: ${file}`);
      try {
        const result = await this.validateFile(file);
        this.results.push(result);
        this.logFileResult(result);
      } catch (error) {
        console.error(`❌ Failed to validate ${file}:`, error.message);
        this.results.push({
          file: file,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      console.log('');
    }

    await this.generateCriticalCSSReport();
    this.validateOverallOptimization();
  }

  /**
   * Validate a single HTML file
   */
  async validateFile(filename) {
    const filePath = path.join(this.baseDir, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;

      const result = {
        file: filename,
        timestamp: new Date().toISOString(),
        preloadLinks: this.analyzePreloadLinks(document),
        preconnectLinks: this.analyzePreconnectLinks(document),
        dnsPrefetchLinks: this.analyzeDNSPrefetchLinks(document),
        inlineCSS: this.analyzeInlineCSS(document),
        externalCSS: this.analyzeExternalCSS(document),
        criticalFonts: this.analyzeCriticalFonts(document),
        criticalImages: this.analyzeCriticalImages(document),
        performanceOptimizations: this.analyzePerformanceOptimizations(document),
        issues: [],
        score: 0
      };

      // Identify issues and calculate score
      result.issues = this.identifyIssues(result);
      result.score = this.calculateOptimizationScore(result);

      return result;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          file: filename,
          error: 'File not found',
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Analyze preload links
   */
  analyzePreloadLinks(document) {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    const preloads = [];

    preloadLinks.forEach(link => {
      preloads.push({
        href: link.href,
        as: link.getAttribute('as'),
        type: link.getAttribute('type'),
        crossorigin: link.hasAttribute('crossorigin'),
        media: link.getAttribute('media'),
        isCritical: this.isCriticalResource(link.href, link.getAttribute('as'))
      });
    });

    return {
      count: preloads.length,
      resources: preloads,
      criticalCount: preloads.filter(p => p.isCritical).length,
      fontPreloads: preloads.filter(p => p.as === 'font').length,
      stylePreloads: preloads.filter(p => p.as === 'style').length,
      imagePreloads: preloads.filter(p => p.as === 'image').length
    };
  }

  /**
   * Analyze preconnect links
   */
  analyzePreconnectLinks(document) {
    const preconnectLinks = document.querySelectorAll('link[rel="preconnect"]');
    const preconnects = [];

    preconnectLinks.forEach(link => {
      preconnects.push({
        href: link.href,
        crossorigin: link.hasAttribute('crossorigin'),
        isCritical: this.isCriticalDomain(link.href)
      });
    });

    return {
      count: preconnects.length,
      domains: preconnects,
      criticalDomains: preconnects.filter(p => p.isCritical).length
    };
  }

  /**
   * Analyze DNS prefetch links
   */
  analyzeDNSPrefetchLinks(document) {
    const dnsPrefetchLinks = document.querySelectorAll('link[rel="dns-prefetch"]');
    const dnsPrefetches = [];

    dnsPrefetchLinks.forEach(link => {
      dnsPrefetches.push({
        href: link.href,
        isCritical: this.isCriticalDomain(link.href)
      });
    });

    return {
      count: dnsPrefetches.length,
      domains: dnsPrefetches
    };
  }

  /**
   * Analyze inline CSS
   */
  analyzeInlineCSS(document) {
    const styleElements = document.querySelectorAll('style');
    let totalInlineCSS = 0;
    let criticalCSS = false;

    styleElements.forEach(style => {
      const content = style.textContent;
      totalInlineCSS += content.length;
      
      // Check if it contains critical CSS patterns
      if (this.containsCriticalCSS(content)) {
        criticalCSS = true;
      }
    });

    return {
      count: styleElements.length,
      totalSize: totalInlineCSS,
      hasCriticalCSS: criticalCSS,
      sizeKB: (totalInlineCSS / 1024).toFixed(2)
    };
  }

  /**
   * Analyze external CSS
   */
  analyzeExternalCSS(document) {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const externalCSS = [];

    cssLinks.forEach(link => {
      externalCSS.push({
        href: link.href,
        media: link.getAttribute('media'),
        isBlocking: !link.hasAttribute('media') || link.getAttribute('media') === 'all',
        isCritical: this.isCriticalCSS(link.href)
      });
    });

    return {
      count: externalCSS.length,
      stylesheets: externalCSS,
      blockingCount: externalCSS.filter(css => css.isBlocking).length,
      criticalCount: externalCSS.filter(css => css.isCritical).length
    };
  }

  /**
   * Analyze critical fonts
   */
  analyzeCriticalFonts(document) {
    const fontLinks = document.querySelectorAll('link[href*="font"]');
    const fonts = [];

    fontLinks.forEach(link => {
      fonts.push({
        href: link.href,
        rel: link.rel,
        isPreloaded: link.rel === 'preload',
        crossorigin: link.hasAttribute('crossorigin')
      });
    });

    return {
      count: fonts.length,
      fonts: fonts,
      preloadedFonts: fonts.filter(f => f.isPreloaded).length
    };
  }

  /**
   * Analyze critical images
   */
  analyzeCriticalImages(document) {
    const images = document.querySelectorAll('img');
    const criticalImages = [];

    images.forEach(img => {
      const isCritical = this.isCriticalImage(img);
      if (isCritical) {
        criticalImages.push({
          src: img.src,
          alt: img.alt,
          loading: img.getAttribute('loading'),
          isLazyLoaded: img.getAttribute('loading') === 'lazy',
          hasPreload: this.hasImagePreload(document, img.src)
        });
      }
    });

    return {
      totalImages: images.length,
      criticalCount: criticalImages.length,
      criticalImages: criticalImages,
      preloadedCritical: criticalImages.filter(img => img.hasPreload).length
    };
  }

  /**
   * Analyze general performance optimizations
   */
  analyzePerformanceOptimizations(document) {
    const head = document.querySelector('head');
    const optimizations = {
      hasViewport: !!document.querySelector('meta[name="viewport"]'),
      hasCharset: !!document.querySelector('meta[charset]'),
      hasPreloadLinks: document.querySelectorAll('link[rel="preload"]').length > 0,
      hasPreconnectLinks: document.querySelectorAll('link[rel="preconnect"]').length > 0,
      hasDnsPrefetch: document.querySelectorAll('link[rel="dns-prefetch"]').length > 0,
      hasInlineCSS: document.querySelectorAll('style').length > 0,
      scriptsInHead: document.querySelectorAll('head script:not([async]):not([defer])').length,
      asyncScripts: document.querySelectorAll('script[async]').length,
      deferScripts: document.querySelectorAll('script[defer]').length
    };

    return optimizations;
  }

  /**
   * Check if resource is critical
   */
  isCriticalResource(href, asType) {
    if (!href) return false;
    
    const lowerHref = href.toLowerCase();
    
    // Critical fonts
    if (asType === 'font' || this.criticalResources.fonts.some(pattern => 
      lowerHref.includes(pattern.toLowerCase()))) {
      return true;
    }
    
    // Critical CSS
    if (asType === 'style' || this.criticalResources.css.some(pattern => 
      lowerHref.includes(pattern.toLowerCase()))) {
      return true;
    }
    
    // Critical images
    if (asType === 'image' || this.criticalResources.images.some(pattern => 
      lowerHref.includes(pattern.toLowerCase()))) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if domain is critical
   */
  isCriticalDomain(href) {
    if (!href) return false;
    
    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com',
      'cdn.tailwindcss.com'
    ];
    
    return criticalDomains.some(domain => href.includes(domain));
  }

  /**
   * Check if CSS contains critical styles
   */
  containsCriticalCSS(cssContent) {
    const criticalPatterns = [
      'body',
      'html',
      'above-the-fold',
      'hero',
      'header',
      'nav',
      'font-family',
      'background-color'
    ];
    
    return criticalPatterns.some(pattern => 
      cssContent.toLowerCase().includes(pattern.toLowerCase()));
  }

  /**
   * Check if CSS file is critical
   */
  isCriticalCSS(href) {
    if (!href) return false;
    
    const criticalCSS = [
      'tailwind',
      'font-awesome',
      'bootstrap',
      'critical',
      'above-the-fold'
    ];
    
    return criticalCSS.some(pattern => 
      href.toLowerCase().includes(pattern.toLowerCase()));
  }

  /**
   * Check if image is critical (above-the-fold)
   */
  isCriticalImage(img) {
    const src = img.src?.toLowerCase() || '';
    const alt = img.alt?.toLowerCase() || '';
    const className = img.className?.toLowerCase() || '';
    
    const criticalPatterns = [
      'hero',
      'logo',
      'banner',
      'above-the-fold',
      'header',
      'featured'
    ];
    
    return criticalPatterns.some(pattern => 
      src.includes(pattern) || alt.includes(pattern) || className.includes(pattern));
  }

  /**
   * Check if image has preload
   */
  hasImagePreload(document, src) {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
    return Array.from(preloadLinks).some(link => link.href === src);
  }

  /**
   * Identify performance issues
   */
  identifyIssues(result) {
    const issues = [];

    // Critical resource preloading issues
    if (result.preloadLinks.count === 0) {
      issues.push('No critical resources preloaded');
    }

    if (result.preloadLinks.fontPreloads === 0 && result.criticalFonts.count > 0) {
      issues.push('Critical fonts not preloaded');
    }

    if (result.criticalImages.criticalCount > 0 && result.criticalImages.preloadedCritical === 0) {
      issues.push('Critical images not preloaded');
    }

    // Connection optimization issues
    if (result.preconnectLinks.count === 0) {
      issues.push('No external domains preconnected');
    }

    if (result.preconnectLinks.criticalDomains < 2) {
      issues.push('Missing preconnect for critical domains (fonts, CDNs)');
    }

    // CSS optimization issues
    if (!result.inlineCSS.hasCriticalCSS) {
      issues.push('No critical CSS inlined');
    }

    if (result.externalCSS.blockingCount > 2) {
      issues.push('Too many render-blocking stylesheets');
    }

    // Script optimization issues
    if (result.performanceOptimizations.scriptsInHead > 0) {
      issues.push('Render-blocking scripts in head');
    }

    // Font optimization issues
    if (result.criticalFonts.preloadedFonts === 0 && result.criticalFonts.count > 0) {
      issues.push('Web fonts not preloaded');
    }

    return issues;
  }

  /**
   * Calculate optimization score
   */
  calculateOptimizationScore(result) {
    let score = 100;

    // Preload optimization (30 points)
    if (result.preloadLinks.count === 0) score -= 30;
    else if (result.preloadLinks.criticalCount < 2) score -= 15;

    // Connection optimization (25 points)
    if (result.preconnectLinks.count === 0) score -= 25;
    else if (result.preconnectLinks.criticalDomains < 2) score -= 15;

    // CSS optimization (25 points)
    if (!result.inlineCSS.hasCriticalCSS) score -= 15;
    if (result.externalCSS.blockingCount > 2) score -= 10;

    // Font optimization (15 points)
    if (result.criticalFonts.count > 0 && result.criticalFonts.preloadedFonts === 0) {
      score -= 15;
    }

    // Script optimization (5 points)
    if (result.performanceOptimizations.scriptsInHead > 0) score -= 5;

    return Math.max(0, score);
  }

  /**
   * Log file validation results
   */
  logFileResult(result) {
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
      return;
    }

    const score = result.score;
    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    
    console.log(`  ${scoreEmoji} Optimization Score: ${score}/100`);
    console.log(`  ⚡ Preload Links: ${result.preloadLinks.count} (${result.preloadLinks.criticalCount} critical)`);
    console.log(`  🔗 Preconnect Links: ${result.preconnectLinks.count} (${result.preconnectLinks.criticalDomains} critical domains)`);
    console.log(`  📝 Inline CSS: ${result.inlineCSS.hasCriticalCSS ? '✅' : '❌'} (${result.inlineCSS.sizeKB}KB)`);
    console.log(`  🎨 External CSS: ${result.externalCSS.count} files (${result.externalCSS.blockingCount} blocking)`);
    console.log(`  🔤 Font Preloads: ${result.criticalFonts.preloadedFonts}/${result.criticalFonts.count}`);
    console.log(`  🖼️  Critical Images: ${result.criticalImages.preloadedCritical}/${result.criticalImages.criticalCount} preloaded`);
    
    if (result.issues.length > 0) {
      console.log(`  ⚠️  Issues: ${result.issues.length}`);
      result.issues.forEach(issue => {
        console.log(`    • ${issue}`);
      });
    }
  }

  /**
   * Generate comprehensive critical CSS report
   */
  async generateCriticalCSSReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      files: this.results,
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.baseDir, `critical-css-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`📋 Critical CSS audit report saved: ${reportPath}`);
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const validResults = this.results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return { error: 'No valid results to summarize' };
    }

    const avgScore = Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length);
    const totalIssues = validResults.reduce((sum, r) => sum + r.issues.length, 0);

    return {
      totalFiles: this.htmlFiles.length,
      validatedFiles: validResults.length,
      averageScore: avgScore,
      totalIssues: totalIssues,
      filesWithPreloads: validResults.filter(r => r.preloadLinks.count > 0).length,
      filesWithPreconnects: validResults.filter(r => r.preconnectLinks.count > 0).length,
      filesWithInlineCSS: validResults.filter(r => r.inlineCSS.hasCriticalCSS).length,
      averagePreloads: Math.round(validResults.reduce((sum, r) => sum + r.preloadLinks.count, 0) / validResults.length)
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = new Map();

    this.results.forEach(result => {
      if (result.error || !result.issues) return;

      result.issues.forEach(issue => {
        if (!recommendations.has(issue)) {
          recommendations.set(issue, { count: 0, files: [] });
        }
        const rec = recommendations.get(issue);
        rec.count++;
        rec.files.push(result.file);
      });
    });

    return Array.from(recommendations.entries())
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        affectedFiles: data.files,
        priority: this.getRecommendationPriority(issue)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  /**
   * Get recommendation priority
   */
  getRecommendationPriority(issue) {
    const priorities = {
      'No critical resources preloaded': 10,
      'Critical fonts not preloaded': 9,
      'Missing preconnect for critical domains (fonts, CDNs)': 8,
      'No critical CSS inlined': 7,
      'Critical images not preloaded': 6,
      'Too many render-blocking stylesheets': 5,
      'Web fonts not preloaded': 4,
      'Render-blocking scripts in head': 3
    };

    return priorities[issue] || 2;
  }

  /**
   * Validate overall optimization
   */
  validateOverallOptimization() {
    console.log('🎯 Overall Critical CSS Optimization Results:');
    console.log('=============================================');
    
    const summary = this.generateSummary();
    
    if (summary.error) {
      console.log('❌ No valid results to validate');
      process.exit(1);
    }

    console.log(`⚡ Average Optimization Score: ${summary.averageScore}/100`);
    console.log(`📄 Files with Preloads: ${summary.filesWithPreloads}/${summary.totalFiles} ${summary.filesWithPreloads === summary.totalFiles ? '✅' : '❌'}`);
    console.log(`🔗 Files with Preconnects: ${summary.filesWithPreconnects}/${summary.totalFiles} ${summary.filesWithPreconnects === summary.totalFiles ? '✅' : '❌'}`);
    console.log(`📝 Files with Inline Critical CSS: ${summary.filesWithInlineCSS}/${summary.totalFiles} ${summary.filesWithInlineCSS === summary.totalFiles ? '✅' : '❌'}`);
    console.log(`📊 Average Preloads per File: ${summary.averagePreloads}`);
    console.log(`⚠️  Total Issues: ${summary.totalIssues}`);

    const passed = summary.averageScore >= 80 && summary.filesWithPreloads === summary.totalFiles;
    
    console.log('');
    if (passed) {
      console.log('🎉 Critical CSS optimization validation passed!');
    } else {
      console.log('⚠️  Critical CSS optimization issues found. Check detailed report for recommendations.');
    }

    return passed;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value) {
      switch (key) {
        case 'base-dir':
          options.baseDir = value;
          break;
        case 'files':
          options.htmlFiles = value.split(',');
          break;
      }
    }
  }

  const validator = new CriticalCSSValidator(options);
  
  try {
    await validator.validateCriticalCSS();
  } catch (error) {
    console.error('💥 Critical CSS validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CriticalCSSValidator;