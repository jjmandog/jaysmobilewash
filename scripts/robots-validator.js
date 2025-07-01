#!/usr/bin/env node

/**
 * Robots.txt Validation Script
 * Validates robots.txt format, hash URL blocking, and SEO compliance
 * Production-grade robots.txt checker for Jay's Mobile Wash
 */

const fs = require('fs').promises;
const path = require('path');

class RobotsValidator {
  constructor(options = {}) {
    this.robotsPath = options.robotsPath || path.join(process.cwd(), 'robots.txt');
    this.baseUrl = options.baseUrl || 'https://www.jaysmobilewash.net';
    this.requiredDisallows = [
      '/api/',
      '/admin/',
      '/*#*',
      '/#'
    ];
    this.requiredSitemaps = [
      'sitemap.xml',
      'sitemap-services.xml', 
      'sitemap-locations.xml'
    ];
  }

  /**
   * Validate robots.txt file
   */
  async validateRobots() {
    console.log('🤖 Starting Robots.txt Validation');
    console.log(`📄 Checking: ${this.robotsPath}`);
    console.log('');

    try {
      const content = await fs.readFile(this.robotsPath, 'utf-8');
      const result = this.parseAndValidate(content);
      
      this.logResults(result);
      await this.generateReport(result);
      
      return result.isValid;
    } catch (error) {
      console.error(`❌ Failed to read robots.txt: ${error.message}`);
      return false;
    }
  }

  /**
   * Parse and validate robots.txt content
   */
  parseAndValidate(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const result = {
      isValid: true,
      content: content,
      lineCount: lines.length,
      userAgents: [],
      directives: [],
      sitemaps: [],
      issues: [],
      warnings: [],
      scores: {}
    };

    let currentUserAgent = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip comments
      if (line.startsWith('#')) {
        continue;
      }

      // Parse directives
      const directive = this.parseDirective(line, lineNumber);
      if (directive) {
        result.directives.push(directive);
        
        switch (directive.type) {
          case 'user-agent':
            currentUserAgent = directive.value;
            if (!result.userAgents.includes(currentUserAgent)) {
              result.userAgents.push(currentUserAgent);
            }
            break;
          case 'sitemap':
            result.sitemaps.push(directive.value);
            break;
        }
      }
    }

    // Validate requirements
    this.validateHashBlocking(result);
    this.validateRequiredDisallows(result);
    this.validateSitemaps(result);
    this.validateFormat(result);
    this.validateUserAgents(result);
    
    // Calculate scores
    result.scores = this.calculateScores(result);
    result.isValid = result.issues.length === 0;

    return result;
  }

  /**
   * Parse individual directive
   */
  parseDirective(line, lineNumber) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      return null;
    }

    const type = line.substring(0, colonIndex).toLowerCase().trim();
    const value = line.substring(colonIndex + 1).trim();

    return {
      type,
      value,
      lineNumber,
      originalLine: line
    };
  }

  /**
   * Validate hash URL blocking
   */
  validateHashBlocking(result) {
    const hashDisallows = result.directives.filter(d => 
      d.type === 'disallow' && (d.value.includes('#') || d.value.includes('/*#*'))
    );

    const hasSpecificHashBlock = hashDisallows.some(d => d.value === '/#');
    const hasGeneralHashBlock = hashDisallows.some(d => d.value === '/*#*');

    if (!hasSpecificHashBlock) {
      result.issues.push('Missing specific hash URL blocking (Disallow: /#)');
    }

    if (!hasGeneralHashBlock) {
      result.issues.push('Missing general hash URL blocking (Disallow: /*#*)');
    }

    if (hashDisallows.length === 0) {
      result.issues.push('No hash URL blocking found');
    }

    result.hashBlocking = {
      present: hashDisallows.length > 0,
      specific: hasSpecificHashBlock,
      general: hasGeneralHashBlock,
      patterns: hashDisallows.map(d => d.value)
    };
  }

  /**
   * Validate required disallow patterns
   */
  validateRequiredDisallows(result) {
    const disallows = result.directives
      .filter(d => d.type === 'disallow')
      .map(d => d.value);

    result.requiredDisallows = [];
    
    this.requiredDisallows.forEach(required => {
      const found = disallows.includes(required);
      result.requiredDisallows.push({
        pattern: required,
        present: found
      });
      
      if (!found) {
        result.issues.push(`Missing required disallow pattern: ${required}`);
      }
    });
  }

  /**
   * Validate sitemaps
   */
  validateSitemaps(result) {
    result.sitemapValidation = [];
    
    this.requiredSitemaps.forEach(required => {
      const found = result.sitemaps.some(sitemap => sitemap.includes(required));
      result.sitemapValidation.push({
        filename: required,
        present: found,
        url: found ? result.sitemaps.find(s => s.includes(required)) : null
      });
      
      if (!found) {
        result.warnings.push(`Missing sitemap: ${required}`);
      }
    });

    if (result.sitemaps.length === 0) {
      result.issues.push('No sitemaps declared');
    }

    // Validate sitemap URLs
    result.sitemaps.forEach(sitemap => {
      if (!sitemap.startsWith('http')) {
        result.issues.push(`Sitemap URL should be absolute: ${sitemap}`);
      }
      if (!sitemap.startsWith('https://')) {
        result.warnings.push(`Sitemap should use HTTPS: ${sitemap}`);
      }
    });
  }

  /**
   * Validate overall format
   */
  validateFormat(result) {
    // Check for duplicate user-agent declarations
    const userAgentCounts = {};
    result.directives
      .filter(d => d.type === 'user-agent')
      .forEach(d => {
        userAgentCounts[d.value] = (userAgentCounts[d.value] || 0) + 1;
      });

    Object.entries(userAgentCounts).forEach(([ua, count]) => {
      if (count > 1) {
        result.warnings.push(`Duplicate User-agent declaration: ${ua}`);
      }
    });

    // Check for empty directives
    result.directives.forEach(d => {
      if (!d.value || d.value.trim() === '') {
        result.issues.push(`Empty directive at line ${d.lineNumber}: ${d.type}`);
      }
    });
  }

  /**
   * Validate user agents
   */
  validateUserAgents(result) {
    const hasWildcard = result.userAgents.includes('*');
    const hasGooglebot = result.userAgents.includes('Googlebot');
    const hasBingbot = result.userAgents.includes('Bingbot');

    if (!hasWildcard) {
      result.warnings.push('Missing wildcard User-agent (*)');
    }

    result.userAgentValidation = {
      hasWildcard,
      hasGooglebot,
      hasBingbot,
      count: result.userAgents.length
    };
  }

  /**
   * Calculate validation scores
   */
  calculateScores(result) {
    let score = 100;

    // Hash blocking (30 points)
    if (!result.hashBlocking.present) {
      score -= 30;
    } else {
      if (!result.hashBlocking.specific) score -= 10;
      if (!result.hashBlocking.general) score -= 10;
    }

    // Required disallows (25 points)
    const missingDisallows = result.requiredDisallows.filter(r => !r.present).length;
    score -= missingDisallows * 6.25;

    // Sitemaps (20 points)
    if (result.sitemaps.length === 0) {
      score -= 20;
    } else {
      const missingSitemaps = result.sitemapValidation.filter(s => !s.present).length;
      score -= missingSitemaps * 6.67;
    }

    // Format issues (15 points)
    score -= result.issues.filter(i => i.includes('Empty directive')).length * 15;

    // User agents (10 points)
    if (!result.userAgentValidation.hasWildcard) score -= 10;

    return {
      overall: Math.max(0, Math.round(score)),
      maxScore: 100,
      issueCount: result.issues.length,
      warningCount: result.warnings.length
    };
  }

  /**
   * Log validation results
   */
  logResults(result) {
    const score = result.scores.overall;
    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    
    console.log(`${scoreEmoji} Robots.txt Validation Score: ${score}/100`);
    console.log(`📝 Lines: ${result.lineCount}`);
    console.log(`👥 User Agents: ${result.userAgents.length} (${result.userAgents.join(', ')})`);
    console.log(`🚫 Hash URL Blocking: ${result.hashBlocking.present ? '✅' : '❌'}`);
    console.log(`   - Specific (/#): ${result.hashBlocking.specific ? '✅' : '❌'}`);
    console.log(`   - General (/*#*): ${result.hashBlocking.general ? '✅' : '❌'}`);
    console.log(`📊 Sitemaps: ${result.sitemaps.length}`);
    console.log(`❌ Issues: ${result.issues.length}`);
    console.log(`⚠️  Warnings: ${result.warnings.length}`);
    
    if (result.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      result.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log('\n📋 Required Disallow Patterns:');
    result.requiredDisallows.forEach(r => {
      console.log(`   ${r.present ? '✅' : '❌'} ${r.pattern}`);
    });

    console.log('\n🗺️  Sitemap Validation:');
    result.sitemapValidation.forEach(s => {
      console.log(`   ${s.present ? '✅' : '❌'} ${s.filename}`);
    });

    console.log('');
    if (result.isValid) {
      console.log('🎉 Robots.txt validation passed!');
    } else {
      console.log('⚠️  Robots.txt validation issues found. Please fix the issues above.');
    }
  }

  /**
   * Generate validation report
   */
  async generateReport(result) {
    const reportData = {
      timestamp: new Date().toISOString(),
      robotsPath: this.robotsPath,
      validation: result,
      recommendations: this.generateRecommendations(result)
    };

    const reportPath = path.join(path.dirname(this.robotsPath), `robots-validation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`📋 Robots.txt validation report saved: ${reportPath}`);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(result) {
    const recommendations = [];

    if (!result.hashBlocking.specific) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing specific hash URL blocking',
        solution: 'Add "Disallow: /#" to block hash-based URLs',
        impact: 'Prevents crawling of SPA hash routes'
      });
    }

    if (!result.hashBlocking.general) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing general hash URL blocking',
        solution: 'Add "Disallow: /*#*" to block all hash URLs',
        impact: 'Comprehensive hash URL blocking'
      });
    }

    result.requiredDisallows.forEach(r => {
      if (!r.present) {
        recommendations.push({
          priority: 'medium',
          issue: `Missing disallow pattern: ${r.pattern}`,
          solution: `Add "Disallow: ${r.pattern}" directive`,
          impact: 'Protects sensitive directories from crawling'
        });
      }
    });

    if (result.sitemaps.length === 0) {
      recommendations.push({
        priority: 'medium',
        issue: 'No sitemaps declared',
        solution: 'Add sitemap URLs using "Sitemap: https://domain.com/sitemap.xml"',
        impact: 'Helps search engines discover and index content'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
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
        case 'robots-path':
          options.robotsPath = value;
          break;
        case 'base-url':
          options.baseUrl = value;
          break;
      }
    }
  }

  const validator = new RobotsValidator(options);
  
  try {
    const isValid = await validator.validateRobots();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('💥 Robots.txt validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = RobotsValidator;