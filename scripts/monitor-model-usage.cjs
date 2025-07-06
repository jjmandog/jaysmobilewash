/**
 * Model Load Balancer & Usage Monitor
 * Tracks model usage and provides load balancing recommendations
 * Usage: node scripts/monitor-model-usage.cjs
 */

const fs = require('fs');
const path = require('path');

class ModelUsageMonitor {
  constructor() {
    this.usageStats = new Map();
    this.performanceMetrics = new Map();
    this.loadBalancingRules = new Map();
    this.initializeStats();
  }

  initializeStats() {
    // Initialize stats for all available models - Updated with new individual endpoints
    const models = [
      // Core handlers
      'auto', 'deepseek', 'none',
      
      // Individual OpenRouter model endpoints
      'qwq-32b', 'glm-z1-32b', 'llama4-maverick', 'qwen3-235b',
      'kimi-dev-72b', 'dolphin-mistral-24b', 'qwerky-72b', 'moonlight-16b',
      'kimi-vl-a3b', 'llama32-vision', 'reka-flash-3', 'llama4-scout', 
      'nemotron-super-49b'
    ];

    models.forEach(model => {
      this.usageStats.set(model, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: null,
        roles: [],
        specialization: this.getModelSpecialization(model)
      });

      this.performanceMetrics.set(model, {
        reliability: 0.95, // Default reliability score
        speed: 0.8,        // Default speed score
        costEfficiency: 0.9, // Default cost efficiency
        availability: 0.9,   // Default availability
        specializationScore: 0.8 // How well it performs its specialized tasks
      });
    });
  }

  /**
   * Get model specialization for better balancing
   */
  getModelSpecialization(modelId) {
    const specializations = {
      'auto': 'intelligent-routing',
      'deepseek': 'general-reasoning',
      'none': 'disabled-state',
      'qwq-32b': 'analytical-reasoning',
      'glm-z1-32b': 'technical-analysis',
      'llama4-maverick': 'advanced-problem-solving',
      'qwen3-235b': 'enterprise-analysis',
      'kimi-dev-72b': 'development-tasks',
      'dolphin-mistral-24b': 'assisted-tasks',
      'qwerky-72b': 'creative-tasks',
      'moonlight-16b': 'business-queries',
      'kimi-vl-a3b': 'visual-reasoning',
      'llama32-vision': 'image-analysis',
      'reka-flash-3': 'quick-responses',
      'llama4-scout': 'general-purpose',
      'nemotron-super-49b': 'performance-tasks'
    };
    
    return specializations[modelId] || 'general-purpose';
  }

  /**
   * Update usage statistics for a model
   */
  recordUsage(modelId, roleId, success = true, responseTime = 1000) {
    const stats = this.usageStats.get(modelId);
    if (!stats) return;

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // Update average response time
    stats.averageResponseTime = 
      (stats.averageResponseTime + responseTime) / 2;
    
    stats.lastUsed = new Date();
    
    if (!stats.roles.includes(roleId)) {
      stats.roles.push(roleId);
    }

    this.usageStats.set(modelId, stats);
    this.updatePerformanceMetrics(modelId);
  }

  /**
   * Update performance metrics based on usage stats
   */
  updatePerformanceMetrics(modelId) {
    const stats = this.usageStats.get(modelId);
    const metrics = this.performanceMetrics.get(modelId);
    
    if (stats.totalRequests > 0) {
      // Calculate reliability based on success rate
      metrics.reliability = stats.successfulRequests / stats.totalRequests;
      
      // Calculate speed based on response time (lower is better)
      metrics.speed = Math.max(0.1, 1 - (stats.averageResponseTime / 5000));
      
      // Availability based on recent usage
      const hoursSinceLastUse = stats.lastUsed ? 
        (Date.now() - stats.lastUsed.getTime()) / (1000 * 60 * 60) : 24;
      metrics.availability = Math.max(0.1, 1 - (hoursSinceLastUse / 24));
    }

    this.performanceMetrics.set(modelId, metrics);
  }

  /**
   * Get load balancing recommendations
   */
  getLoadBalancingRecommendations() {
    const recommendations = [];
    const usageByModel = new Map();
    
    // Calculate total usage for each model
    this.usageStats.forEach((stats, modelId) => {
      usageByModel.set(modelId, stats.totalRequests);
    });

    // Sort models by usage (ascending)
    const sortedByUsage = Array.from(usageByModel.entries())
      .sort(([,a], [,b]) => a - b);

    const underutilized = sortedByUsage.slice(0, 5);
    const overutilized = sortedByUsage.slice(-3);

    // Recommend shifting load from overutilized to underutilized
    if (overutilized.length > 0 && underutilized.length > 0) {
      recommendations.push({
        type: 'load_balance',
        action: 'Consider shifting some roles from heavily used models to underutilized ones',
        overutilized: overutilized.map(([model]) => model),
        underutilized: underutilized.map(([model]) => model)
      });
    }

    // Check for models with poor performance
    this.performanceMetrics.forEach((metrics, modelId) => {
      if (metrics.reliability < 0.8) {
        recommendations.push({
          type: 'performance_issue',
          model: modelId,
          action: `Model ${modelId} has low reliability (${(metrics.reliability * 100).toFixed(1)}%). Consider using alternative.`
        });
      }

      if (metrics.speed < 0.5) {
        recommendations.push({
          type: 'performance_issue',
          model: modelId,
          action: `Model ${modelId} has slow response times. Consider optimizing or using faster alternative.`
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate comprehensive usage report
   */
  generateUsageReport() {
    console.log('\n📊 MODEL USAGE & PERFORMANCE REPORT');
    console.log('=' .repeat(80));
    
    // Sort models by total requests
    const sortedModels = Array.from(this.usageStats.entries())
      .sort(([,a], [,b]) => b.totalRequests - a.totalRequests);

    console.log('\n🚀 MODEL USAGE STATISTICS:');
    console.log('-' .repeat(80));
    console.log('Model'.padEnd(15) + 'Requests'.padEnd(10) + 'Success%'.padEnd(10) + 
                'Avg Time'.padEnd(12) + 'Roles'.padEnd(10) + 'Last Used');
    console.log('-' .repeat(80));

    sortedModels.forEach(([modelId, stats]) => {
      const successRate = stats.totalRequests > 0 ? 
        (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) : '0.0';
      const avgTime = stats.averageResponseTime.toFixed(0) + 'ms';
      const lastUsed = stats.lastUsed ? 
        stats.lastUsed.toLocaleString() : 'Never';
      
      console.log(
        modelId.padEnd(15) +
        stats.totalRequests.toString().padEnd(10) +
        (successRate + '%').padEnd(10) +
        avgTime.padEnd(12) +
        stats.roles.length.toString().padEnd(10) +
        lastUsed
      );
    });

    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log('-' .repeat(60));
    console.log('Model'.padEnd(15) + 'Reliability'.padEnd(12) + 'Speed'.padEnd(8) + 
                'Available'.padEnd(12) + 'Overall');
    console.log('-' .repeat(60));

    this.performanceMetrics.forEach((metrics, modelId) => {
      const overall = (metrics.reliability + metrics.speed + metrics.availability) / 3;
      console.log(
        modelId.padEnd(15) +
        (metrics.reliability * 100).toFixed(1).padEnd(11) + '%' +
        (metrics.speed * 100).toFixed(1).padEnd(7) + '%' +
        (metrics.availability * 100).toFixed(1).padEnd(11) + '%' +
        (overall * 100).toFixed(1) + '%'
      );
    });

    // Load balancing recommendations
    const recommendations = this.getLoadBalancingRecommendations();
    
    if (recommendations.length > 0) {
      console.log('\n🎯 LOAD BALANCING RECOMMENDATIONS:');
      console.log('-' .repeat(60));
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.action}`);
        if (rec.overutilized) {
          console.log(`   Overutilized: ${rec.overutilized.join(', ')}`);
        }
        if (rec.underutilized) {
          console.log(`   Underutilized: ${rec.underutilized.join(', ')}`);
        }
      });
    }

    return {
      totalModels: this.usageStats.size,
      activeModels: sortedModels.filter(([, stats]) => stats.totalRequests > 0).length,
      recommendations: recommendations.length
    };
  }

  /**
   * Simulate usage for testing
   */
  simulateUsage() {
    console.log('🔄 Simulating model usage patterns...\n');
    
    // Simulate realistic usage patterns
    const roles = ['reasoning', 'tools', 'quotes', 'photo_uploads', 'summaries', 
                   'search', 'chat', 'fallback', 'analytics', 'accessibility'];
    
    const models = ['deepseek', 'qwen', 'mistral', 'vision', 'llama33', 
                    'nemotron', 'codellama', 'gemma', 'phi3', 'openrouter'];

    // Simulate 100 requests
    for (let i = 0; i < 100; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const success = Math.random() > 0.1; // 90% success rate
      const responseTime = 500 + Math.random() * 2000; // 500-2500ms
      
      this.recordUsage(model, role, success, responseTime);
    }
    
    console.log('✅ Simulation complete - generated 100 sample requests');
  }

  /**
   * Export usage data for analysis
   */
  exportUsageData() {
    const data = {
      timestamp: new Date().toISOString(),
      usageStats: Object.fromEntries(this.usageStats),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      recommendations: this.getLoadBalancingRecommendations()
    };

    const exportPath = path.join(__dirname, '../logs/model-usage-report.json');
    
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(exportPath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
      console.log(`\n📁 Usage data exported to: ${exportPath}`);
    } catch (error) {
      console.error('❌ Failed to export usage data:', error.message);
    }
  }
}

/**
 * Main monitoring function
 */
function main() {
  console.log('🔍 Starting Model Usage Monitor...\n');
  
  const monitor = new ModelUsageMonitor();
  
  // Simulate some usage for demonstration
  monitor.simulateUsage();
  
  // Generate and display report
  const summary = monitor.generateUsageReport();
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Models: ${summary.totalModels}`);
  console.log(`   Active Models: ${summary.activeModels}`);
  console.log(`   Recommendations: ${summary.recommendations}`);
  
  // Export data
  monitor.exportUsageData();
  
  console.log('\n🎉 Monitoring complete!');
  console.log('💡 Use this data to optimize your model assignments.');
  console.log('⚡ Consider implementing automatic load balancing based on these metrics.');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ModelUsageMonitor;
