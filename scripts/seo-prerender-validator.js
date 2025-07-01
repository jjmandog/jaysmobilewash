#!/usr/bin/env node

/**
 * SEO and Prerender Verification Script
 * Verifies static pre-rendering, canonical tags, meta descriptions, and structured data
 * Production-grade SEO compliance checker for Jay's Mobile Wash
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class SEOPrerenderValidator {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.routes = options.routes || [
      { file: 'index.html', route: '/', title: 'Mobile Detailing Los Angeles' },
      { file: 'services-exterior-detailing.html', route: '/services/exterior-detailing/', title: 'Exterior Car Detailing' },
      { file: 'services-interior-detailing.html', route: '/services/interior-detailing/', title: 'Interior Car Detailing' },
      { file: 'services-ceramic-coating.html', route: '/services/ceramic-coating/', title: 'Ceramic Coating' },
      { file: 'locations-los-angeles.html', route: '/locations/los-angeles/', title: 'Los Angeles Services' },
      { file: 'locations-orange-county.html', route: '/locations/orange-county/', title: 'Orange County Services' },
      { file: 'locations-beverly-hills.html', route: '/locations/beverly-hills/', title: 'Beverly Hills Services' },
      { file: 'about.html', route: '/about/', title: 'About Jay\'s Mobile Wash' },
      { file: 'privacy.html', route: '/privacy/', title: 'Privacy Policy' },
      { file: 'terms.html', route: '/terms/', title: 'Terms of Service' },
      { file: 'products.html', route: '/products/', title: 'Products' }
    ];
    
    this.requiredMeta = [
      'description',
      'og:title',
      'og:description',
      'og:url',
      'og:type',
      'twitter:card',
      'twitter:title',
      'twitter:description'
    ];
    
    this.results = [];
    this.baseUrl = options.baseUrl || 'https://www.jaysmobilewash.net';
  }

  /**
   * Run comprehensive SEO validation
   */
  async validateSEO() {
    console.log('🔍 Starting SEO and Prerender Validation');
    console.log(`📄 Checking ${this.routes.length} routes`);
    console.log('');

    for (const route of this.routes) {
      console.log(`🔍 Validating: ${route.route} (${route.file})`);
      try {
        const result = await this.validateRoute(route);
        this.results.push(result);
        this.logRouteResult(result);
      } catch (error) {
        console.error(`❌ Failed to validate ${route.route}:`, error.message);
        this.results.push({
          route: route.route,
          file: route.file,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      console.log('');
    }

    await this.generateSEOReport();
    this.validateOverallSEO();
  }

  /**
   * Validate a single route
   */
  async validateRoute(route) {
    const filePath = path.join(this.baseDir, route.file);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;

      const result = {
        route: route.route,
        file: route.file,
        timestamp: new Date().toISOString(),
        prerendered: true, // Static files are pre-rendered by default
        title: this.validateTitle(document, route),
        canonical: this.validateCanonical(document, route),
        metaTags: this.validateMetaTags(document),
        structuredData: this.validateStructuredData(document),
        openGraph: this.validateOpenGraph(document),
        twitterCard: this.validateTwitterCard(document),
        headings: this.validateHeadings(document),
        images: this.validateImages(document),
        performance: this.validatePerformanceOptimizations(document),
        accessibility: this.validateAccessibility(document),
        scores: {}
      };

      // Calculate scores
      result.scores = this.calculateScores(result);

      return result;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          route: route.route,
          file: route.file,
          prerendered: false,
          error: 'File not found - route not pre-rendered',
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Validate page title
   */
  validateTitle(document, route) {
    const titleElement = document.querySelector('title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    return {
      present: !!title,
      content: title,
      length: title.length,
      containsKeywords: title.toLowerCase().includes('mobile') || title.toLowerCase().includes('detailing'),
      optimalLength: title.length >= 30 && title.length <= 60,
      issues: this.getTitleIssues(title, route)
    };
  }

  /**
   * Get title validation issues
   */
  getTitleIssues(title, route) {
    const issues = [];
    
    if (!title) {
      issues.push('Missing title tag');
    } else {
      if (title.length < 30) issues.push('Title too short (< 30 characters)');
      if (title.length > 60) issues.push('Title too long (> 60 characters)');
      if (!title.toLowerCase().includes('mobile') && !title.toLowerCase().includes('detailing')) {
        issues.push('Title missing key business terms');
      }
      if (!title.includes('Jay\'s') && !title.includes('Jay')) {
        issues.push('Title missing brand name');
      }
    }
    
    return issues;
  }

  /**
   * Validate canonical URL
   */
  validateCanonical(document, route) {
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    const canonical = canonicalElement ? canonicalElement.href : '';
    const expectedCanonical = `${this.baseUrl}${route.route}`;
    
    return {
      present: !!canonical,
      url: canonical,
      correct: canonical === expectedCanonical,
      expected: expectedCanonical,
      issues: this.getCanonicalIssues(canonical, expectedCanonical)
    };
  }

  /**
   * Get canonical URL issues
   */
  getCanonicalIssues(actual, expected) {
    const issues = [];
    
    if (!actual) {
      issues.push('Missing canonical tag');
    } else {
      if (actual !== expected) {
        issues.push(`Canonical URL mismatch. Expected: ${expected}, Found: ${actual}`);
      }
      if (!actual.startsWith('https://')) {
        issues.push('Canonical URL should use HTTPS');
      }
    }
    
    return issues;
  }

  /**
   * Validate meta tags
   */
  validateMetaTags(document) {
    const metaTags = {};
    
    // Standard meta tags
    const description = document.querySelector('meta[name="description"]');
    metaTags.description = {
      present: !!description,
      content: description ? description.content : '',
      length: description ? description.content.length : 0,
      optimalLength: description ? (description.content.length >= 120 && description.content.length <= 160) : false
    };

    const keywords = document.querySelector('meta[name="keywords"]');
    metaTags.keywords = {
      present: !!keywords,
      content: keywords ? keywords.content : ''
    };

    const robots = document.querySelector('meta[name="robots"]');
    metaTags.robots = {
      present: !!robots,
      content: robots ? robots.content : ''
    };

    // Geo tags
    const geoRegion = document.querySelector('meta[name="geo.region"]');
    metaTags.geoRegion = {
      present: !!geoRegion,
      content: geoRegion ? geoRegion.content : ''
    };

    return metaTags;
  }

  /**
   * Validate structured data (JSON-LD)
   */
  validateStructuredData(document) {
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData = [];

    structuredDataScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        structuredData.push({
          type: data['@type'] || 'Unknown',
          context: data['@context'] || 'Unknown',
          valid: true,
          data: data
        });
      } catch (error) {
        structuredData.push({
          valid: false,
          error: error.message,
          content: script.textContent
        });
      }
    });

    return {
      present: structuredData.length > 0,
      count: structuredData.length,
      types: structuredData.map(d => d.type).filter(t => t !== 'Unknown'),
      data: structuredData,
      hasLocalBusiness: structuredData.some(d => d.type === 'LocalBusiness'),
      hasOrganization: structuredData.some(d => d.type === 'Organization'),
      issues: this.getStructuredDataIssues(structuredData)
    };
  }

  /**
   * Get structured data issues
   */
  getStructuredDataIssues(structuredData) {
    const issues = [];
    
    if (structuredData.length === 0) {
      issues.push('No structured data found');
    }
    
    structuredData.forEach((data, index) => {
      if (!data.valid) {
        issues.push(`Invalid JSON-LD at index ${index}: ${data.error}`);
      }
    });

    const hasLocalBusiness = structuredData.some(d => d.type === 'LocalBusiness');
    if (!hasLocalBusiness) {
      issues.push('Missing LocalBusiness structured data');
    }

    return issues;
  }

  /**
   * Validate Open Graph tags
   */
  validateOpenGraph(document) {
    const ogTags = {};
    const requiredOGTags = ['og:title', 'og:description', 'og:url', 'og:type', 'og:image'];
    
    requiredOGTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      ogTags[tag] = {
        present: !!element,
        content: element ? element.content : ''
      };
    });

    return {
      tags: ogTags,
      complete: requiredOGTags.every(tag => ogTags[tag].present),
      issues: this.getOpenGraphIssues(ogTags, requiredOGTags)
    };
  }

  /**
   * Get Open Graph issues
   */
  getOpenGraphIssues(ogTags, requiredTags) {
    const issues = [];
    
    requiredTags.forEach(tag => {
      if (!ogTags[tag].present) {
        issues.push(`Missing ${tag} tag`);
      } else if (!ogTags[tag].content) {
        issues.push(`Empty ${tag} tag`);
      }
    });

    return issues;
  }

  /**
   * Validate Twitter Card tags
   */
  validateTwitterCard(document) {
    const twitterTags = {};
    const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    
    requiredTwitterTags.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      twitterTags[tag] = {
        present: !!element,
        content: element ? element.content : ''
      };
    });

    return {
      tags: twitterTags,
      complete: requiredTwitterTags.every(tag => twitterTags[tag].present),
      issues: this.getTwitterCardIssues(twitterTags, requiredTwitterTags)
    };
  }

  /**
   * Get Twitter Card issues
   */
  getTwitterCardIssues(twitterTags, requiredTags) {
    const issues = [];
    
    requiredTags.forEach(tag => {
      if (!twitterTags[tag].present) {
        issues.push(`Missing ${tag} tag`);
      } else if (!twitterTags[tag].content) {
        issues.push(`Empty ${tag} tag`);
      }
    });

    return issues;
  }

  /**
   * Validate heading structure
   */
  validateHeadings(document) {
    const headings = [];
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    headingTags.forEach(tag => {
      const elements = document.querySelectorAll(tag);
      elements.forEach(element => {
        headings.push({
          tag: tag,
          text: element.textContent.trim(),
          level: parseInt(tag.substring(1))
        });
      });
    });

    return {
      count: headings.length,
      h1Count: headings.filter(h => h.tag === 'h1').length,
      headings: headings,
      issues: this.getHeadingIssues(headings)
    };
  }

  /**
   * Get heading structure issues
   */
  getHeadingIssues(headings) {
    const issues = [];
    const h1Count = headings.filter(h => h.tag === 'h1').length;
    
    if (h1Count === 0) {
      issues.push('Missing H1 tag');
    } else if (h1Count > 1) {
      issues.push('Multiple H1 tags found');
    }

    if (headings.length === 0) {
      issues.push('No heading tags found');
    }

    return issues;
  }

  /**
   * Validate images
   */
  validateImages(document) {
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    let total = images.length;

    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        missingAlt++;
      }
    });

    return {
      total: total,
      missingAlt: missingAlt,
      altCoverage: total > 0 ? ((total - missingAlt) / total * 100).toFixed(1) : 100,
      issues: missingAlt > 0 ? [`${missingAlt} images missing alt text`] : []
    };
  }

  /**
   * Validate performance optimizations
   */
  validatePerformanceOptimizations(document) {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    const preconnectLinks = document.querySelectorAll('link[rel="preconnect"]');
    const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
    
    return {
      preloadCount: preloadLinks.length,
      preconnectCount: preconnectLinks.length,
      dnsPrefetchCount: dnsPrefetch.length,
      hasPreloads: preloadLinks.length > 0,
      issues: this.getPerformanceIssues(preloadLinks, preconnectLinks)
    };
  }

  /**
   * Get performance optimization issues
   */
  getPerformanceIssues(preloadLinks, preconnectLinks) {
    const issues = [];
    
    if (preloadLinks.length === 0) {
      issues.push('No critical resources preloaded');
    }
    
    if (preconnectLinks.length === 0) {
      issues.push('No external domains preconnected');
    }

    return issues;
  }

  /**
   * Validate accessibility features
   */
  validateAccessibility(document) {
    const langAttribute = document.documentElement.lang;
    const skipLinks = document.querySelectorAll('a[href^="#"]:first-of-type');
    const ariaLabels = document.querySelectorAll('[aria-label]');
    
    return {
      hasLang: !!langAttribute,
      lang: langAttribute || '',
      skipLinks: skipLinks.length,
      ariaLabels: ariaLabels.length,
      issues: this.getAccessibilityIssues(langAttribute)
    };
  }

  /**
   * Get accessibility issues
   */
  getAccessibilityIssues(langAttribute) {
    const issues = [];
    
    if (!langAttribute) {
      issues.push('Missing lang attribute on html element');
    }

    return issues;
  }

  /**
   * Calculate SEO scores for a route
   */
  calculateScores(result) {
    let score = 100;
    let issues = 0;

    // Title validation (20 points)
    if (!result.title.present) score -= 20;
    else if (!result.title.optimalLength) score -= 5;
    issues += result.title.issues.length;

    // Canonical validation (15 points)
    if (!result.canonical.present) score -= 15;
    else if (!result.canonical.correct) score -= 10;
    issues += result.canonical.issues.length;

    // Meta description (15 points)
    if (!result.metaTags.description.present) score -= 15;
    else if (!result.metaTags.description.optimalLength) score -= 5;

    // Structured data (20 points)
    if (!result.structuredData.present) score -= 20;
    else if (!result.structuredData.hasLocalBusiness) score -= 10;
    issues += result.structuredData.issues.length;

    // Open Graph (15 points)
    if (!result.openGraph.complete) score -= 15;
    issues += result.openGraph.issues.length;

    // Twitter Card (10 points)
    if (!result.twitterCard.complete) score -= 10;
    issues += result.twitterCard.issues.length;

    // Accessibility (5 points)
    if (!result.accessibility.hasLang) score -= 5;
    issues += result.accessibility.issues.length;

    return {
      seo: Math.max(0, score),
      issues: issues,
      maxScore: 100
    };
  }

  /**
   * Log route validation results
   */
  logRouteResult(result) {
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
      return;
    }

    const score = result.scores.seo;
    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    
    console.log(`  ${scoreEmoji} SEO Score: ${score}/100`);
    console.log(`  📄 Pre-rendered: ${result.prerendered ? '✅' : '❌'}`);
    console.log(`  📝 Title: ${result.title.present ? '✅' : '❌'} ${result.title.content ? `"${result.title.content.substring(0, 50)}..."` : ''}`);
    console.log(`  🔗 Canonical: ${result.canonical.present && result.canonical.correct ? '✅' : '❌'}`);
    console.log(`  📊 Structured Data: ${result.structuredData.present ? '✅' : '❌'} (${result.structuredData.count} items)`);
    console.log(`  📱 Open Graph: ${result.openGraph.complete ? '✅' : '❌'}`);
    console.log(`  🐦 Twitter Card: ${result.twitterCard.complete ? '✅' : '❌'}`);
    
    if (result.scores.issues > 0) {
      console.log(`  ⚠️  Issues: ${result.scores.issues}`);
    }
  }

  /**
   * Generate comprehensive SEO report
   */
  async generateSEOReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.generateSEOSummary(),
      routes: this.results,
      recommendations: this.generateSEORecommendations()
    };

    const reportPath = path.join(this.baseDir, `seo-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`📋 SEO audit report saved: ${reportPath}`);
  }

  /**
   * Generate SEO summary
   */
  generateSEOSummary() {
    const validResults = this.results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return { error: 'No valid results to summarize' };
    }

    const avgScore = Math.round(validResults.reduce((sum, r) => sum + r.scores.seo, 0) / validResults.length);
    const totalIssues = validResults.reduce((sum, r) => sum + r.scores.issues, 0);

    return {
      totalRoutes: this.routes.length,
      validatedRoutes: validResults.length,
      averageScore: avgScore,
      totalIssues: totalIssues,
      prerenderedRoutes: validResults.filter(r => r.prerendered).length,
      routesWithCanonical: validResults.filter(r => r.canonical.present).length,
      routesWithStructuredData: validResults.filter(r => r.structuredData.present).length,
      routesWithOpenGraph: validResults.filter(r => r.openGraph.complete).length
    };
  }

  /**
   * Generate SEO recommendations
   */
  generateSEORecommendations() {
    const recommendations = [];
    const issueMap = new Map();

    this.results.forEach(result => {
      if (result.error) return;

      // Collect all issues
      const allIssues = [
        ...result.title.issues,
        ...result.canonical.issues,
        ...result.structuredData.issues,
        ...result.openGraph.issues,
        ...result.twitterCard.issues,
        ...result.accessibility.issues
      ];

      allIssues.forEach(issue => {
        if (!issueMap.has(issue)) {
          issueMap.set(issue, { count: 0, routes: [] });
        }
        const issueData = issueMap.get(issue);
        issueData.count++;
        issueData.routes.push(result.route);
      });
    });

    // Convert to sorted recommendations
    return Array.from(issueMap.entries())
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        affectedRoutes: data.routes,
        priority: this.getIssuePriority(issue)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 15);
  }

  /**
   * Get issue priority for recommendations
   */
  getIssuePriority(issue) {
    const priorities = {
      'Missing title tag': 10,
      'Missing canonical tag': 9,
      'Missing LocalBusiness structured data': 8,
      'Missing og:title tag': 7,
      'Missing twitter:card tag': 6,
      'Title too short': 5,
      'Title too long': 5,
      'Missing lang attribute': 4
    };

    return priorities[issue] || 3;
  }

  /**
   * Validate overall SEO compliance
   */
  validateOverallSEO() {
    console.log('🎯 Overall SEO Validation Results:');
    console.log('==================================');
    
    const summary = this.generateSEOSummary();
    
    if (summary.error) {
      console.log('❌ No valid results to validate');
      process.exit(1);
    }

    console.log(`📊 Average SEO Score: ${summary.averageScore}/100`);
    console.log(`📄 Pre-rendered Routes: ${summary.prerenderedRoutes}/${summary.totalRoutes} ${summary.prerenderedRoutes === summary.totalRoutes ? '✅' : '❌'}`);
    console.log(`🔗 Routes with Canonical: ${summary.routesWithCanonical}/${summary.totalRoutes} ${summary.routesWithCanonical === summary.totalRoutes ? '✅' : '❌'}`);
    console.log(`📊 Routes with Structured Data: ${summary.routesWithStructuredData}/${summary.totalRoutes} ${summary.routesWithStructuredData === summary.totalRoutes ? '✅' : '❌'}`);
    console.log(`📱 Routes with Open Graph: ${summary.routesWithOpenGraph}/${summary.totalRoutes} ${summary.routesWithOpenGraph === summary.totalRoutes ? '✅' : '❌'}`);
    console.log(`⚠️  Total Issues: ${summary.totalIssues}`);

    const passed = summary.averageScore >= 85 && summary.prerenderedRoutes === summary.totalRoutes;
    
    console.log('');
    if (passed) {
      console.log('🎉 SEO validation passed!');
    } else {
      console.log('⚠️  SEO validation issues found. Check detailed report for recommendations.');
    }

    return passed;
  }
}

// Add JSDOM dependency installation check
async function checkDependencies() {
  try {
    require('jsdom');
  } catch (error) {
    console.error('❌ Missing dependency: jsdom');
    console.log('Install with: npm install --save-dev jsdom');
    process.exit(1);
  }
}

// CLI execution
async function main() {
  await checkDependencies();
  
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
        case 'base-url':
          options.baseUrl = value;
          break;
      }
    }
  }

  const validator = new SEOPrerenderValidator(options);
  
  try {
    await validator.validateSEO();
  } catch (error) {
    console.error('💥 SEO validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SEOPrerenderValidator;