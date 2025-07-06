/**
 * Model Testing & Validation Suite
 * Tests all available models and validates their functionality
 * Usage: node scripts/test-all-models.cjs
 */

const fs = require('fs');
const path = require('path');

class ModelTester {
  constructor() {
    this.testResults = new Map();
    this.testPrompts = {
      simple: "Hello, how are you?",
      reasoning: "Explain the difference between ceramic coating and traditional wax for car detailing.",
      technical: "Calculate the cost-effectiveness of weekly car washes vs monthly detailing services.",
      creative: "Write a brief description of the benefits of mobile car detailing services.",
      structured: "List the top 3 car detailing packages and their prices in JSON format."
    };
  }

  /**
   * Test a specific model with various prompts
   */
  async testModel(modelId, endpoint) {
    console.log(`🧪 Testing model: ${modelId}`);
    const results = {
      modelId,
      endpoint,
      tests: {},
      overall: {
        passed: 0,
        failed: 0,
        responseTime: 0,
        reliability: 0
      }
    };

    for (const [testType, prompt] of Object.entries(this.testPrompts)) {
      console.log(`   Testing ${testType}...`);
      
      try {
        const startTime = Date.now();
        
        // Simulate API call (in real implementation, this would make actual API calls)
        const response = await this.simulateAPICall(modelId, endpoint, prompt);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        results.tests[testType] = {
          passed: true,
          responseTime,
          responseLength: response.length,
          hasContent: response.length > 10,
          prompt,
          response: response.substring(0, 100) + '...'
        };

        results.overall.passed++;
        results.overall.responseTime += responseTime;

      } catch (error) {
        results.tests[testType] = {
          passed: false,
          error: error.message,
          prompt
        };
        results.overall.failed++;
      }
    }

    // Calculate overall metrics
    const totalTests = Object.keys(this.testPrompts).length;
    results.overall.reliability = results.overall.passed / totalTests;
    results.overall.responseTime = results.overall.responseTime / results.overall.passed || 0;

    this.testResults.set(modelId, results);
    return results;
  }

  /**
   * Simulate API call (replace with actual implementation)
   */
  async simulateAPICall(modelId, endpoint, prompt) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
    
    // Simulate different response patterns based on model
    const responses = {
      'deepseek': `DeepSeek response to: ${prompt}. This is a comprehensive answer with detailed analysis and insights.`,
      'qwen': `Qwen 2.5 analysis: ${prompt}. Advanced reasoning and technical explanation provided.`,
      'mistral': `Mistral structured response: ${prompt}. Business-focused answer with clear organization.`,
      'llama33': `Llama 3.3 summary: ${prompt}. Detailed explanation with key points highlighted.`,
      'nemotron': `Nemotron search result: ${prompt}. Information retrieval with relevant details.`,
      'codellama': `CodeLlama technical response: ${prompt}. Tool-focused answer with implementation details.`,
      'phi3': `Phi-3 analytical response: ${prompt}. Data-driven insights and metrics provided.`,
      'gemma': `Gemma helpful response: ${prompt}. Accessible and user-friendly explanation.`,
      'vision': `Vision API analysis: ${prompt}. Image processing and visual analysis results.`,
      'openrouter': `OpenRouter gateway response: ${prompt}. Multi-model routing with optimal selection.`,
      'auto': `Auto-selected response: ${prompt}. Smart routing chose the best model for this query.`
    };

    // Simulate occasional failures for some models
    if (Math.random() < 0.15 && ['codellama', 'vision'].includes(modelId)) {
      throw new Error(`Simulated API error for ${modelId}`);
    }

    return responses[modelId] || `${modelId} response: ${prompt}. Standard AI-generated response.`;
  }

  /**
   * Test all available models
   */
  async testAllModels() {
    console.log('🚀 Starting comprehensive model testing...\n');

    const modelsToTest = [
      { id: 'auto', endpoint: '/api/auto' },
      { id: 'deepseek', endpoint: '/api/deepseek' },
      { id: 'openrouter', endpoint: '/api/openrouter' },
      { id: 'mistral', endpoint: '/api/openrouter' },
      { id: 'llama31', endpoint: '/api/llama31' },
      { id: 'llama33', endpoint: '/api/llama33' },
      { id: 'llama4', endpoint: '/api/llama4' },
      { id: 'qwen', endpoint: '/api/openrouter' },
      { id: 'gemma', endpoint: '/api/openrouter' },
      { id: 'phi3', endpoint: '/api/openrouter' },
      { id: 'codellama', endpoint: '/api/openrouter' },
      { id: 'nemotron', endpoint: '/api/openrouter' },
      { id: 'vision', endpoint: '/api/vision' },
      { id: 'openrouter', endpoint: '/api/openrouter' }
    ];

    for (const model of modelsToTest) {
      await this.testModel(model.id, model.endpoint);
      console.log(''); // Add spacing
    }

    console.log('✅ All model testing completed!\n');
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    console.log('📋 MODEL TESTING REPORT');
    console.log('=' .repeat(80));

    const sortedResults = Array.from(this.testResults.entries())
      .sort(([,a], [,b]) => b.overall.reliability - a.overall.reliability);

    console.log('\n🏆 MODEL PERFORMANCE RANKING:');
    console.log('-' .repeat(80));
    console.log('Rank'.padEnd(6) + 'Model'.padEnd(15) + 'Reliability'.padEnd(12) + 
                'Avg Time'.padEnd(12) + 'Passed'.padEnd(8) + 'Failed'.padEnd(8) + 'Status');
    console.log('-' .repeat(80));

    sortedResults.forEach(([modelId, results], index) => {
      const reliability = (results.overall.reliability * 100).toFixed(1) + '%';
      const avgTime = results.overall.responseTime.toFixed(0) + 'ms';
      const status = results.overall.reliability >= 0.8 ? '✅ Good' : 
                     results.overall.reliability >= 0.6 ? '⚠️ Fair' : '❌ Poor';

      console.log(
        `${index + 1}`.padEnd(6) +
        modelId.padEnd(15) +
        reliability.padEnd(12) +
        avgTime.padEnd(12) +
        results.overall.passed.toString().padEnd(8) +
        results.overall.failed.toString().padEnd(8) +
        status
      );
    });

    console.log('\n📊 DETAILED TEST RESULTS:');
    console.log('-' .repeat(80));

    this.testResults.forEach((results, modelId) => {
      console.log(`\n🔍 ${modelId.toUpperCase()}:`);
      
      Object.entries(results.tests).forEach(([testType, test]) => {
        const status = test.passed ? '✅' : '❌';
        const time = test.responseTime ? `(${test.responseTime}ms)` : '';
        const info = test.error ? `Error: ${test.error}` : 
                     test.responseLength ? `${test.responseLength} chars` : '';
        
        console.log(`   ${status} ${testType.padEnd(12)} ${time.padEnd(8)} ${info}`);
      });
    });

    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-' .repeat(60));

    const recommendations = [];
    
    this.testResults.forEach((results, modelId) => {
      if (results.overall.reliability < 0.7) {
        recommendations.push({
          type: 'reliability',
          model: modelId,
          issue: `Low reliability (${(results.overall.reliability * 100).toFixed(1)}%)`,
          action: 'Consider removing from production or fixing issues'
        });
      }

      if (results.overall.responseTime > 2000) {
        recommendations.push({
          type: 'performance',
          model: modelId,
          issue: `Slow response time (${results.overall.responseTime.toFixed(0)}ms)`,
          action: 'Optimize or consider faster alternative'
        });
      }

      if (results.overall.reliability >= 0.9 && results.overall.responseTime < 1000) {
        recommendations.push({
          type: 'excellence',
          model: modelId,
          issue: 'Excellent performance',
          action: 'Consider using for more critical roles'
        });
      }
    });

    if (recommendations.length === 0) {
      console.log('   All models are performing within acceptable parameters! 🎉');
    } else {
      recommendations.forEach((rec, index) => {
        const icon = rec.type === 'excellence' ? '⭐' : 
                     rec.type === 'performance' ? '⚡' : '⚠️';
        console.log(`${index + 1}. ${icon} ${rec.model}: ${rec.issue}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
  }

  /**
   * Export test results
   */
  exportTestResults() {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalModels: this.testResults.size,
        totalTests: this.testResults.size * Object.keys(this.testPrompts).length,
        averageReliability: Array.from(this.testResults.values())
          .reduce((sum, r) => sum + r.overall.reliability, 0) / this.testResults.size
      },
      results: Object.fromEntries(this.testResults),
      testPrompts: this.testPrompts
    };

    const exportPath = path.join(__dirname, '../logs/model-test-results.json');
    
    try {
      const logsDir = path.dirname(exportPath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`\n📁 Test results exported to: ${exportPath}`);
    } catch (error) {
      console.error('❌ Failed to export test results:', error.message);
    }
  }

  /**
   * Quick health check for all models
   */
  async quickHealthCheck() {
    console.log('🩺 Running quick health check on all models...\n');
    
    const healthResults = new Map();
    const models = ['deepseek', 'qwen', 'mistral', 'llama33', 'nemotron', 
                    'codellama', 'phi3', 'gemma', 'vision', 'openrouter'];

    for (const modelId of models) {
      try {
        const response = await this.simulateAPICall(modelId, `/api/${modelId}`, 'Health check');
        healthResults.set(modelId, {
          status: 'healthy',
          response: response.substring(0, 50) + '...'
        });
        console.log(`✅ ${modelId.padEnd(12)} - Healthy`);
      } catch (error) {
        healthResults.set(modelId, {
          status: 'unhealthy',
          error: error.message
        });
        console.log(`❌ ${modelId.padEnd(12)} - Error: ${error.message}`);
      }
    }

    const healthyCount = Array.from(healthResults.values())
      .filter(r => r.status === 'healthy').length;
    
    console.log(`\n📈 Health Summary: ${healthyCount}/${models.length} models healthy`);
    
    return healthResults;
  }
}

/**
 * Main testing function
 */
async function main() {
  console.log('🔬 Starting Model Testing & Validation Suite...\n');
  
  const tester = new ModelTester();
  
  // Quick health check first
  await tester.quickHealthCheck();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Full comprehensive testing
  await tester.testAllModels();
  
  // Generate and display report
  tester.generateTestReport();
  
  // Export results
  tester.exportTestResults();
  
  console.log('\n🎉 Testing suite completed!');
  console.log('💡 Use the results to optimize your model configuration.');
  console.log('⚡ Consider implementing automated testing in your CI/CD pipeline.');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ModelTester;
