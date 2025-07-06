// Script to sync DEFAULT_ROLE_ASSIGNMENTS from public/advanced-chatbot.js to advanced-chatbot.js
// Usage: node scripts/sync-role-assignments.js

const fs = require('fs');
const path = require('path');

const NEW_BOT_PATH = path.join(__dirname, '../public/advanced-chatbot.js');
const OLD_BOT_PATH = path.join(__dirname, '../advanced-chatbot.js');

function extractRoleAssignments(fileContent) {
  const match = fileContent.match(/const DEFAULT_ROLE_ASSIGNMENTS = ([\s\S]*?);\n/);
  if (!match) throw new Error('DEFAULT_ROLE_ASSIGNMENTS not found');
  return match[0];
}

function replaceRoleAssignments(fileContent, newAssignments) {
  return fileContent.replace(/const DEFAULT_ROLE_ASSIGNMENTS = ([\s\S]*?);\n/, newAssignments);
}

try {
  const newBotContent = fs.readFileSync(NEW_BOT_PATH, 'utf8');
  const oldBotContent = fs.readFileSync(OLD_BOT_PATH, 'utf8');
  const newAssignments = extractRoleAssignments(newBotContent);
  const updatedOldBot = replaceRoleAssignments(oldBotContent, newAssignments);
  fs.writeFileSync(OLD_BOT_PATH, updatedOldBot, 'utf8');
  console.log('✅ Synced DEFAULT_ROLE_ASSIGNMENTS from new to old chatbot.');
} catch (err) {
  console.error('❌ Sync failed:', err.message);
}
