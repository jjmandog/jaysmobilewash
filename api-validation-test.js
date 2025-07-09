// Test script to validate all API assignments are valid
const API_OPTIONS = [
  { id: 'auto', name: 'Auto (Let AI choose)', enabled: true },
  { id: 'deepseek', name: 'DeepSeek Chat (Free)', enabled: true },
  { id: 'qwq_32b', name: 'QWQ 32B (Free)', enabled: true },
  { id: 'glm_z1_32b', name: 'GLM-Z1 32B (Free)', enabled: true },
  { id: 'kimi_vl_a3b', name: 'Kimi VL A3B (Free)', enabled: true },
  { id: 'kimi_dev_72b', name: 'Kimi Dev 72B (Free)', enabled: true },
  { id: 'moonlight_16b', name: 'Moonlight 16B (Free)', enabled: true },
  { id: 'nemotron_super_49b', name: 'Nemotron Super 49B (Free)', enabled: true },
  { id: 'llama4_maverick', name: 'Llama 4 Maverick (Free)', enabled: true },
  { id: 'llama4_scout', name: 'Llama 4 Scout (Free)', enabled: true },
  { id: 'qwerky_72b', name: 'Qwerky 72B (Free)', enabled: true },
  { id: 'reka_flash_3', name: 'Reka Flash 3 (Free)', enabled: true },
  { id: 'dolphin_mistral_24b', name: 'Dolphin Mistral 24B (Free)', enabled: true },
  { id: 'llama32_vision', name: 'Llama 3.2 11B Vision (Free)', enabled: true },
  { id: 'qwen3_235b', name: 'Qwen 3 235B A22B (Free)', enabled: true },
  { id: 'none', name: 'AI Disabled', enabled: true }
];

const DEFAULT_ROLE_ASSIGNMENTS = {
  auto: 'auto',
  reasoning: 'qwq_32b',
  tools: 'kimi_dev_72b',
  quotes: 'llama4_maverick',
  photo_uploads: 'llama32_vision',
  summaries: 'reka_flash_3',
  summarize: 'reka_flash_3',
  search: 'deepseek',
  chat: 'llama4_scout',
  fallback: 'deepseek',
  analytics: 'glm_z1_32b',
  accessibility: 'deepseek',
  deep_analysis: 'qwen3_235b',
  multi_language: 'nemotron_super_49b'
};

console.log('🧪 API Assignment Validation Test');
console.log('=================================');

const apiIds = API_OPTIONS.map(api => api.id);
let hasErrors = false;

for (const [role, assignedApiId] of Object.entries(DEFAULT_ROLE_ASSIGNMENTS)) {
  const isValid = apiIds.includes(assignedApiId);
  
  if (isValid) {
    console.log(`✅ ${role}: ${assignedApiId} - VALID`);
  } else {
    console.error(`❌ ${role}: ${assignedApiId} - INVALID (API not found)`);
    hasErrors = true;
  }
}

console.log('=================================');
if (hasErrors) {
  console.error('🚨 VALIDATION FAILED - Some API assignments are invalid!');
} else {
  console.log('🎉 VALIDATION PASSED - All API assignments are valid!');
}

console.log('\n📊 Summary:');
console.log(`Available APIs: ${apiIds.length}`);
console.log(`Role assignments: ${Object.keys(DEFAULT_ROLE_ASSIGNMENTS).length}`);
console.log(`Unique assigned APIs: ${[...new Set(Object.values(DEFAULT_ROLE_ASSIGNMENTS))].length}`);
