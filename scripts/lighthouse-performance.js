#!/usr/bin/env node

/**
 * Lighthouse Performance Verification Script
 * Automated CLI script for running Lighthouse audits and reporting on CLS, LCP, and overall score
 * Production-grade performance monitoring for Jay's Mobile Wash
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

class LighthousePerformanceValidator {
  constructor(options = {}) {
    this.urls = options.urls || [
      'https://www.jaysmobilewash.net',
      'https://www.jaysmobilewash.net/services/exterior-detailing',
      'https://www.jaysmobilewash.net/services/interior-detailing', 
      'https://www.jaysmobilewash.net/services/ceramic-coating',
      'https://www.jaysmobilewash.net/locations/los-angeles',
      'https://www.jaysmobilewash.net/locations/orange-county'
    ];
    
    this.thresholds = {
      performance: options.performanceThreshold || 90,
      accessibility: options.accessibilityThreshold || 95,
      bestPractices: options.bestPracticesThreshold || 90,
      seo: options.seoThreshold || 95,
      cls: options.clsThreshold || 0.1,
      lcp: options.lcpThreshold || 2.5,
      fid: options.fidThreshold || 100
    };
    
    this.outputDir = options.outputDir || 'lighthouse-reports';
    this.results = [];
  }

  /**
   * Run Lighthouse audits for all URLs
   */
  async runAudits() {
    console.log('🚀 Starting Lighthouse Performance Audits');
    console.log(`📊 Testing ${this.urls.length} URLs`);
    console.log(`🎯 Thresholds: Performance ${this.thresholds.performance}%, CLS ${this.thresholds.cls}, LCP ${this.thresholds.lcp}s`);
    console.log('');

    // Ensure output directory exists
    await this.ensureOutputDir();

    for (const url of this.urls) {
      console.log(`🔍 Auditing: ${url}`);
      try {
        const result = await this.auditUrl(url);
        this.results.push(result);
        this.logResult(result);
      } catch (error) {
        console.error(`❌ Failed to audit ${url}:`, error.message);
        this.results.push({
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      console.log('');
    }

    await this.generateReport();
    this.validateThresholds();
  }

  /**
   * Audit a single URL with Lighthouse
   */
  async auditUrl(url) {
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions'
      ]
    });

    const options = {
      logLevel: 'error',
      output: ['json', 'html'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      throttlingMethod: 'simulate',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      }
    };

    try {
      const runnerResult = await lighthouse(url, options);
      await chrome.kill();

      // Extract key metrics
      const result = this.extractMetrics(url, runnerResult);
      
      // Save detailed reports
      await this.saveReports(url, runnerResult);
      
      return result;
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  /**
   * Extract key performance metrics from Lighthouse results
   */
  extractMetrics(url, runnerResult) {
    const { lhr } = runnerResult;
    const audits = lhr.audits;

    return {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100)
      },
      metrics: {
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        si: audits['speed-index']?.numericValue || 0,
        tti: audits['interactive']?.numericValue || 0
      },
      opportunities: this.extractOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits)
    };
  }

  /**
   * Extract performance opportunities
   */
  extractOpportunities(audits) {
    const opportunities = [];
    
    const opportunityAudits = [
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'duplicated-javascript'
    ];

    opportunityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score < 1 && audit.details) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          numericValue: audit.numericValue,
          displayValue: audit.displayValue
        });
      }
    });

    return opportunities;
  }

  /**
   * Extract diagnostic information
   */
  extractDiagnostics(audits) {
    const diagnostics = [];
    
    const diagnosticAudits = [
      'critical-request-chains',
      'mainthread-work-breakdown',
      'bootup-time',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'dom-size'
    ];

    diagnosticAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          numericValue: audit.numericValue,
          displayValue: audit.displayValue
        });
      }
    });

    return diagnostics;
  }

  /**
   * Save detailed HTML and JSON reports
   */
  async saveReports(url, runnerResult) {
    const urlSlug = url.replace(/https?:\/\//, '').replace(/[^\w]/g, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const htmlPath = path.join(this.outputDir, `${urlSlug}-${timestamp}.html`);
    const jsonPath = path.join(this.outputDir, `${urlSlug}-${timestamp}.json`);

    await fs.writeFile(htmlPath, runnerResult.report[1]);
    await fs.writeFile(jsonPath, JSON.stringify(runnerResult.lhr, null, 2));
  }

  /**
   * Log result summary to console
   */
  logResult(result) {
    const { scores, metrics } = result;
    
    console.log(`  📈 Performance: ${scores.performance}% ${this.getScoreEmoji(scores.performance, this.thresholds.performance)}`);
    console.log(`  ♿ Accessibility: ${scores.accessibility}% ${this.getScoreEmoji(scores.accessibility, this.thresholds.accessibility)}`);
    console.log(`  ✨ Best Practices: ${scores.bestPractices}% ${this.getScoreEmoji(scores.bestPractices, this.thresholds.bestPractices)}`);
    console.log(`  🔍 SEO: ${scores.seo}% ${this.getScoreEmoji(scores.seo, this.thresholds.seo)}`);
    console.log(`  🎭 CLS: ${metrics.cls.toFixed(3)} ${this.getMetricEmoji(metrics.cls, this.thresholds.cls, true)}`);
    console.log(`  🖼️  LCP: ${(metrics.lcp / 1000).toFixed(2)}s ${this.getMetricEmoji(metrics.lcp / 1000, this.thresholds.lcp, true)}`);
    console.log(`  👆 FID: ${metrics.fid}ms ${this.getMetricEmoji(metrics.fid, this.thresholds.fid, true)}`);
  }

  /**
   * Get emoji for score comparison
   */
  getScoreEmoji(score, threshold) {
    return score >= threshold ? '✅' : '❌';
  }

  /**
   * Get emoji for metric comparison (lower is better for most metrics)
   */
  getMetricEmoji(value, threshold, lowerIsBetter = true) {
    if (lowerIsBetter) {
      return value <= threshold ? '✅' : '❌';
    } else {
      return value >= threshold ? '✅' : '❌';
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      summary: this.generateSummary(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.outputDir, `lighthouse-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`📋 Detailed report saved: ${reportPath}`);
  }

  /**
   * Generate performance summary
   */
  generateSummary() {
    const validResults = this.results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return { error: 'No valid results to summarize' };
    }

    const avgScores = {
      performance: Math.round(validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length),
      accessibility: Math.round(validResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / validResults.length),
      bestPractices: Math.round(validResults.reduce((sum, r) => sum + r.scores.bestPractices, 0) / validResults.length),
      seo: Math.round(validResults.reduce((sum, r) => sum + r.scores.seo, 0) / validResults.length)
    };

    const avgMetrics = {
      cls: (validResults.reduce((sum, r) => sum + r.metrics.cls, 0) / validResults.length).toFixed(3),
      lcp: Math.round(validResults.reduce((sum, r) => sum + r.metrics.lcp, 0) / validResults.length),
      fid: Math.round(validResults.reduce((sum, r) => sum + r.metrics.fid, 0) / validResults.length)
    };

    return {
      totalUrls: this.urls.length,
      successfulAudits: validResults.length,
      averageScores: avgScores,
      averageMetrics: avgMetrics,
      thresholdsMet: {
        performance: avgScores.performance >= this.thresholds.performance,
        accessibility: avgScores.accessibility >= this.thresholds.accessibility,
        bestPractices: avgScores.bestPractices >= this.thresholds.bestPractices,
        seo: avgScores.seo >= this.thresholds.seo,
        cls: parseFloat(avgMetrics.cls) <= this.thresholds.cls,
        lcp: avgMetrics.lcp <= this.thresholds.lcp * 1000
      }
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = new Map();
    
    this.results.forEach(result => {
      if (result.opportunities) {
        result.opportunities.forEach(opp => {
          if (!recommendations.has(opp.id)) {
            recommendations.set(opp.id, {
              title: opp.title,
              description: opp.description,
              count: 0,
              totalSavings: 0
            });
          }
          const rec = recommendations.get(opp.id);
          rec.count++;
          if (opp.numericValue) {
            rec.totalSavings += opp.numericValue;
          }
        });
      }
    });

    return Array.from(recommendations.values())
      .sort((a, b) => b.totalSavings - a.totalSavings)
      .slice(0, 10);
  }

  /**
   * Validate results against thresholds
   */
  validateThresholds() {
    console.log('🎯 Threshold Validation Results:');
    console.log('================================');
    
    const summary = this.generateSummary();
    
    if (summary.error) {
      console.log('❌ No valid results to validate');
      process.exit(1);
    }

    const { averageScores, averageMetrics, thresholdsMet } = summary;
    let allPassed = true;

    console.log(`📊 Performance: ${averageScores.performance}% (threshold: ${this.thresholds.performance}%) ${thresholdsMet.performance ? '✅' : '❌'}`);
    console.log(`♿ Accessibility: ${averageScores.accessibility}% (threshold: ${this.thresholds.accessibility}%) ${thresholdsMet.accessibility ? '✅' : '❌'}`);
    console.log(`✨ Best Practices: ${averageScores.bestPractices}% (threshold: ${this.thresholds.bestPractices}%) ${thresholdsMet.bestPractices ? '✅' : '❌'}`);
    console.log(`🔍 SEO: ${averageScores.seo}% (threshold: ${this.thresholds.seo}%) ${thresholdsMet.seo ? '✅' : '❌'}`);
    console.log(`🎭 CLS: ${averageMetrics.cls} (threshold: ${this.thresholds.cls}) ${thresholdsMet.cls ? '✅' : '❌'}`);
    console.log(`🖼️  LCP: ${(averageMetrics.lcp / 1000).toFixed(2)}s (threshold: ${this.thresholds.lcp}s) ${thresholdsMet.lcp ? '✅' : '❌'}`);

    Object.values(thresholdsMet).forEach(passed => {
      if (!passed) allPassed = false;
    });

    console.log('');
    if (allPassed) {
      console.log('🎉 All performance thresholds met!');
    } else {
      console.log('⚠️  Some performance thresholds not met. Check individual results for details.');
    }

    return allPassed;
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
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
        case 'urls':
          options.urls = value.split(',');
          break;
        case 'performance-threshold':
          options.performanceThreshold = parseInt(value);
          break;
        case 'cls-threshold':
          options.clsThreshold = parseFloat(value);
          break;
        case 'lcp-threshold':
          options.lcpThreshold = parseFloat(value);
          break;
        case 'output-dir':
          options.outputDir = value;
          break;
      }
    }
  }

  const validator = new LighthousePerformanceValidator(options);
  
  try {
    await validator.runAudits();
  } catch (error) {
    console.error('💥 Performance validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LighthousePerformanceValidator;