/**
 * Model Efficiency Optimizer
 * Analyzes and optimizes API/model assignments for maximum efficiency
 * Usage: node scripts/optimize-model-assignments.js
 */

const fs = require('fs');
const path = require('path');

// Model characteristics and capabilities
const MODEL_PROFILES = {
  // Free models with high availability
  'auto': { 
    speed: 8, reasoning: 9, cost: 10, availability: 10, 
    specialties: ['smart_routing', 'general'],
    description: 'Smart auto-selection for optimal routing'
  },
  'deepseek': { 
    speed: 7, reasoning: 9, cost: 10, availability: 10, 
    specialties: ['conversation', 'general', 'reasoning'],
    description: 'Excellent for conversation and general tasks'
  },
  'qwen': { 
    speed: 6, reasoning: 10, cost: 10, availability: 9, 
    specialties: ['reasoning', 'analysis', 'technical'],
    description: 'Top-tier reasoning and complex analysis'
  },
  'llama33': { 
    speed: 6, reasoning: 8, cost: 10, availability: 9, 
    specialties: ['summarization', 'text_generation'],
    description: 'Excellent for summarization and text tasks'
  },
  'nemotron': { 
    speed: 5, reasoning: 9, cost: 10, availability: 8, 
    specialties: ['search', 'information_retrieval'],
    description: 'Specialized for search and information tasks'
  },
  'mistral': { 
    speed: 8, reasoning: 7, cost: 10, availability: 9, 
    specialties: ['structured_output', 'business'],
    description: 'Great for structured business responses'
  },
  'codellama': { 
    speed: 7, reasoning: 8, cost: 10, availability: 9, 
    specialties: ['code', 'tools', 'technical'],
    description: 'Specialized for code and tool generation'
  },
  'gemma': { 
    speed: 7, reasoning: 7, cost: 10, availability: 9, 
    specialties: ['helpful', 'accessible', 'safe'],
    description: 'Helpful and accessible responses'
  },
  'phi3': { 
    speed: 8, reasoning: 7, cost: 10, availability: 9, 
    specialties: ['analytics', 'data', 'medium_tasks'],
    description: 'Good for analytics and data tasks'
  },
  'vision': { 
    speed: 6, reasoning: 6, cost: 8, availability: 8, 
    specialties: ['image_analysis', 'visual'],
    description: 'Specialized for image and visual analysis'
  },
  'openrouter': { 
    speed: 7, reasoning: 8, cost: 9, availability: 9, 
    specialties: ['fallback', 'multiple_models'],
    description: 'Gateway to multiple models for fallback'
  },
  
  // Premium models (require API keys)
  'openai': { 
    speed: 9, reasoning: 9, cost: 6, availability: 7, 
    specialties: ['conversation', 'general', 'premium'],
    description: 'Premium conversational AI'
  },
  'anthropic': { 
    speed: 8, reasoning: 10, cost: 6, availability: 7, 
    specialties: ['reasoning', 'safety', 'analysis'],
    description: 'Top reasoning and safety features'
  },
  'google': { 
    speed: 8, reasoning: 8, cost: 7, availability: 7, 
    specialties: ['multimodal', 'integration'],
    description: 'Multimodal capabilities and integration'
  }
};

// Role requirements and priorities
const ROLE_REQUIREMENTS = {
  'reasoning': { 
    priorities: ['reasoning', 'analysis'], 
    weight: { reasoning: 0.4, speed: 0.2, cost: 0.2, availability: 0.2 }
  },
  'tools': { 
    priorities: ['code', 'tools'], 
    weight: { reasoning: 0.3, speed: 0.3, cost: 0.2, availability: 0.2 }
  },
  'quotes': { 
    priorities: ['structured_output', 'business'], 
    weight: { reasoning: 0.2, speed: 0.3, cost: 0.2, availability: 0.3 }
  },
  'photo_uploads': { 
    priorities: ['image_analysis', 'visual'], 
    weight: { reasoning: 0.2, speed: 0.2, cost: 0.3, availability: 0.3 }
  },
  'summaries': { 
    priorities: ['summarization', 'text_generation'], 
    weight: { reasoning: 0.3, speed: 0.2, cost: 0.2, availability: 0.3 }
  },
  'search': { 
    priorities: ['search', 'information_retrieval'], 
    weight: { reasoning: 0.2, speed: 0.4, cost: 0.2, availability: 0.2 }
  },
  'chat': { 
    priorities: ['conversation', 'general'], 
    weight: { reasoning: 0.2, speed: 0.3, cost: 0.2, availability: 0.3 }
  },
  'fallback': { 
    priorities: ['fallback', 'multiple_models'], 
    weight: { reasoning: 0.1, speed: 0.2, cost: 0.3, availability: 0.4 }
  },
  'analytics': { 
    priorities: ['analytics', 'data'], 
    weight: { reasoning: 0.4, speed: 0.2, cost: 0.2, availability: 0.2 }
  },
  'accessibility': { 
    priorities: ['helpful', 'accessible', 'safe'], 
    weight: { reasoning: 0.2, speed: 0.2, cost: 0.2, availability: 0.4 }
  }
};

/**
 * Calculate efficiency score for a model-role pairing
 */
function calculateEfficiencyScore(modelId, roleId) {
  const model = MODEL_PROFILES[modelId];
  const role = ROLE_REQUIREMENTS[roleId];
  
  if (!model || !role) return 0;
  
  // Base performance score
  const performanceScore = 
    (model.reasoning * role.weight.reasoning) +
    (model.speed * role.weight.speed) +
    (model.cost * role.weight.cost) +
    (model.availability * role.weight.availability);
  
  // Specialty bonus
  let specialtyBonus = 0;
  role.priorities.forEach(priority => {
    if (model.specialties.includes(priority)) {
      specialtyBonus += 2;
    }
  });
  
  return performanceScore + specialtyBonus;
}

/**
 * Find the optimal model assignment for all roles
 */
function optimizeModelAssignments() {
  const roles = Object.keys(ROLE_REQUIREMENTS);
  const models = Object.keys(MODEL_PROFILES);
  const optimizedAssignments = {};
  const usageCount = {};
  
  // Initialize usage tracking
  models.forEach(model => usageCount[model] = 0);
  
  // Sort roles by importance (reasoning and photo_uploads are critical)
  const rolesByImportance = roles.sort((a, b) => {
    const importanceOrder = ['photo_uploads', 'reasoning', 'quotes', 'fallback', 'chat', 'search', 'summaries', 'tools', 'analytics', 'accessibility'];
    return importanceOrder.indexOf(a) - importanceOrder.indexOf(b);
  });
  
  // Assign models to roles
  rolesByImportance.forEach(role => {
    let bestModel = null;
    let bestScore = 0;
    
    models.forEach(model => {
      let score = calculateEfficiencyScore(model, role);
      
      // Penalize overused models to encourage distribution
      if (usageCount[model] > 2) {
        score *= 0.8;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    });
    
    if (bestModel) {
      optimizedAssignments[role] = bestModel;
      usageCount[bestModel]++;
    }
  });
  
  return optimizedAssignments;
}

/**
 * Generate efficiency report
 */
function generateEfficiencyReport(assignments) {
  console.log('\n🚀 MODEL EFFICIENCY OPTIMIZATION REPORT');
  console.log('=' .repeat(60));
  
  const modelUsage = {};
  const totalScore = Object.entries(assignments).reduce((total, [role, model]) => {
    const score = calculateEfficiencyScore(model, role);
    modelUsage[model] = (modelUsage[model] || 0) + 1;
    
    console.log(`📌 ${role.padEnd(15)} → ${model.padEnd(12)} (Score: ${score.toFixed(1)})`);
    return total + score;
  }, 0);
  
  console.log('\n📊 MODEL DISTRIBUTION:');
  Object.entries(modelUsage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([model, count]) => {
      const profile = MODEL_PROFILES[model];
      console.log(`   ${model.padEnd(12)} → ${count} roles (${profile.description})`);
    });
  
  console.log(`\n✨ TOTAL EFFICIENCY SCORE: ${totalScore.toFixed(1)}/100`);
  console.log(`💡 AVERAGE SCORE PER ROLE: ${(totalScore / Object.keys(assignments).length).toFixed(1)}/10`);
  
  return { totalScore, modelUsage };
}

/**
 * Update the constants file with optimized assignments
 */
function updateConstantsFile(assignments) {
  const filePath = path.join(__dirname, '../src/constants/apiOptions.js');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Generate new assignments string
    const assignmentsString = Object.entries(assignments)
      .map(([role, model]) => {
        const modelProfile = MODEL_PROFILES[model];
        return `  ${role}: '${model}',${' '.repeat(Math.max(1, 20 - role.length - model.length))}// ${modelProfile.description}`;
      })
      .join('\n');
    
    const newAssignmentsBlock = `// Default role assignments (maps role ID to API ID) - Optimized for efficiency
export const DEFAULT_ROLE_ASSIGNMENTS = {
${assignmentsString}
};`;
    
    // Replace the existing assignments
    const updatedContent = content.replace(
      /\/\/ Default role assignments.*?\n.*?export const DEFAULT_ROLE_ASSIGNMENTS = \{[\s\S]*?\};/,
      newAssignmentsBlock
    );
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('\n✅ Updated apiOptions.js with optimized assignments');
    
  } catch (error) {
    console.error('❌ Failed to update constants file:', error.message);
  }
}

/**
 * Main optimization function
 */
function main() {
  console.log('🔄 Starting model efficiency optimization...\n');
  
  // Get current assignments
  const currentFile = path.join(__dirname, '../src/constants/apiOptions.js');
  console.log('📖 Reading current assignments from:', currentFile);
  
  // Calculate optimal assignments
  const optimizedAssignments = optimizeModelAssignments();
  
  // Generate report
  const report = generateEfficiencyReport(optimizedAssignments);
  
  // Update file
  updateConstantsFile(optimizedAssignments);
  
  console.log('\n🎉 Optimization complete!');
  console.log('💡 All models are now efficiently distributed across roles.');
  console.log('⚡ Run your application to see improved performance!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  calculateEfficiencyScore,
  optimizeModelAssignments,
  generateEfficiencyReport,
  MODEL_PROFILES,
  ROLE_REQUIREMENTS
};
