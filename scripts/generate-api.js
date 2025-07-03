#!/usr/bin/env node

/**
 * API Generator CLI Tool
 * Quick way to generate new APIs from templates
 * 
 * Usage: node scripts/generate-api.js [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function generateAPI() {
  log('🚀 API Generator for Jay\'s Mobile Wash', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    // Get API details from user
    const apiName = await askQuestion('Enter API name (e.g., "customers", "appointments"): ');
    if (!apiName) {
      log('❌ API name is required', 'red');
      process.exit(1);
    }
    
    const apiType = await askQuestion('Choose API type (1: Simple Data, 2: Full CRUD, 3: Action): ');
    if (!['1', '2', '3'].includes(apiType)) {
      log('❌ Invalid API type. Choose 1, 2, or 3', 'red');
      process.exit(1);
    }
    
    const fields = await askQuestion('Enter field names (comma-separated, e.g., "name,email,phone"): ');
    const fieldList = fields.split(',').map(f => f.trim()).filter(f => f);
    
    if (fieldList.length === 0) {
      log('❌ At least one field is required', 'red');
      process.exit(1);
    }
    
    const requiredFields = await askQuestion('Enter required fields (comma-separated, or press Enter for all): ');
    const requiredFieldList = requiredFields ? requiredFields.split(',').map(f => f.trim()) : fieldList;
    
    // Generate files
    log('\\n📁 Generating files...', 'blue');
    
    const templateMap = {
      '1': 'simple-data-api.js',
      '2': 'crud-api.js',
      '3': 'action-api.js'
    };
    
    const templateFile = templateMap[apiType];
    const templatePath = path.join(rootDir, 'api-templates', templateFile);
    
    if (!fs.existsSync(templatePath)) {
      log(`❌ Template file not found: ${templateFile}`, 'red');
      process.exit(1);
    }
    
    // Read template
    let apiTemplate = fs.readFileSync(templatePath, 'utf8');
    let dbTemplate = fs.readFileSync(path.join(rootDir, 'database/templates/simple-table.js'), 'utf8');
    
    // Replace placeholders
    const capitalizedName = apiName.charAt(0).toUpperCase() + apiName.slice(1);
    const pluralName = apiName.endsWith('s') ? apiName : apiName + 's';
    
    apiTemplate = apiTemplate.replace(/TEMPLATE/g, apiName);
    dbTemplate = dbTemplate.replace(/TEMPLATE/g, apiName);
    
    // Update field configurations
    const fieldTypes = {};
    const stringLimits = {};
    
    for (const field of fieldList) {
      if (field.includes('email')) {
        fieldTypes[field] = 'email';
        stringLimits[field] = 255;
      } else if (field.includes('phone')) {
        fieldTypes[field] = 'phone';
        stringLimits[field] = 15;
      } else if (field.includes('price') || field.includes('amount')) {
        fieldTypes[field] = 'number';
      } else {
        fieldTypes[field] = 'string';
        stringLimits[field] = field.includes('description') || field.includes('notes') ? 500 : 100;
      }
    }
    
    // Replace validation config
    const validationConfig = `  requiredFields: [${requiredFieldList.map(f => `'${f}'`).join(', ')}],
  fieldTypes: {
${Object.entries(fieldTypes).map(([field, type]) => `    ${field}: '${type}'`).join(',\\n')}
  },
  stringLimits: {
${Object.entries(stringLimits).map(([field, limit]) => `    ${field}: ${limit}`).join(',\\n')}
  }`;
    
    apiTemplate = apiTemplate.replace(/requiredFields: \[.*?\],\s*fieldTypes: \{.*?\},\s*stringLimits: \{.*?\}/s, validationConfig);
    
    // Create API file
    const apiFilePath = path.join(rootDir, 'api', `${apiName}.js`);
    if (fs.existsSync(apiFilePath)) {
      const overwrite = await askQuestion(`File ${apiName}.js already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        log('❌ Operation cancelled', 'yellow');
        process.exit(0);
      }
    }
    
    fs.writeFileSync(apiFilePath, apiTemplate);
    log(`✅ Created API file: api/${apiName}.js`, 'green');
    
    // Create database file
    const dbFilePath = path.join(rootDir, 'database', `${apiName}.js`);
    if (fs.existsSync(dbFilePath)) {
      const overwrite = await askQuestion(`File ${apiName}.js already exists in database/. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        log('❌ Database file creation cancelled', 'yellow');
      } else {
        fs.writeFileSync(dbFilePath, dbTemplate);
        log(`✅ Created database file: database/${apiName}.js`, 'green');
      }
    } else {
      fs.writeFileSync(dbFilePath, dbTemplate);
      log(`✅ Created database file: database/${apiName}.js`, 'green');
    }
    
    // Generate table schema
    const tableSchema = generateTableSchema(apiName, fieldList);
    
    log('\\n📋 Next steps:', 'blue');
    log('1. Add this table schema to database/connection.js in the initializeTables() function:', 'yellow');
    log('\\n' + tableSchema, 'cyan');
    log('\\n2. Test your API:', 'yellow');
    log(`   npm test tests/${apiName}-api.test.js`, 'cyan');
    log('\\n3. Update your frontend to use the new API:', 'yellow');
    log(`   fetch('/api/${apiName}')`, 'cyan');
    
    log('\\n🎉 API generation complete!', 'green');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

function generateTableSchema(tableName, fields) {
  const constraints = [];
  
  for (const field of fields) {
    if (field.includes('email')) {
      constraints.push(`${field} TEXT UNIQUE NOT NULL CHECK(length(${field}) > 0 AND length(${field}) <= 255)`);
    } else if (field.includes('phone')) {
      constraints.push(`${field} TEXT NOT NULL CHECK(length(${field}) > 0 AND length(${field}) <= 15)`);
    } else if (field.includes('price') || field.includes('amount')) {
      constraints.push(`${field} DECIMAL(7,2) NOT NULL CHECK(${field} >= 0)`);
    } else if (field.includes('description') || field.includes('notes')) {
      constraints.push(`${field} TEXT CHECK(length(${field}) <= 500)`);
    } else {
      constraints.push(`${field} TEXT NOT NULL CHECK(length(${field}) > 0 AND length(${field}) <= 100)`);
    }
  }
  
  return `// Add to database/connection.js in initializeTables() function:
const create${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Table = \`
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ${constraints.join(',\\n    ')},
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`;

db.exec(create${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Table);

// Create trigger for updated_at
const create${tableName.charAt(0).toUpperCase() + tableName.slice(1)}UpdateTrigger = \`
  CREATE TRIGGER IF NOT EXISTS update_${tableName}_updated_at
  AFTER UPDATE ON ${tableName}
  FOR EACH ROW
  BEGIN
    UPDATE ${tableName} SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
\`;

db.exec(create${tableName.charAt(0).toUpperCase() + tableName.slice(1)}UpdateTrigger);`;
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAPI();
}