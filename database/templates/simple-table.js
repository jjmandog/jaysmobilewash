/**
 * Database Template for Simple Table
 * Use this template for basic database operations
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to database/your-table-name.js
 * 2. Replace "TEMPLATE" with your actual table name (e.g., "customers", "appointments")
 * 3. Update the field names and types in the SQL queries
 * 4. Add your table creation to database/connection.js
 * 5. Test your database operations
 */

import { getDatabase } from './connection.js';

/**
 * Get all TEMPLATE records
 */
export function getAllTEMPLATES() {
  const db = getDatabase();
  
  // Replace with your actual field names
  const templates = db.prepare(`
    SELECT id, name, email, phone, created_at, updated_at 
    FROM TEMPLATE 
    ORDER BY id
  `).all();
  
  return templates;
}

/**
 * Get TEMPLATE by ID
 */
export function getTEMPLATEById(id) {
  const db = getDatabase();
  
  // Replace with your actual field names
  const template = db.prepare(`
    SELECT id, name, email, phone, created_at, updated_at 
    FROM TEMPLATE 
    WHERE id = ?
  `).get(id);
  
  return template || null;
}

/**
 * Create a new TEMPLATE
 */
export function createTEMPLATE(templateData) {
  const db = getDatabase();
  
  // Replace with your actual field names
  const { name, email, phone } = templateData;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO TEMPLATE (name, email, phone) 
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name.trim(), email.trim(), phone.trim());
    
    // Get the created record
    return getTEMPLATEById(result.lastInsertRowid);
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A TEMPLATE with this email already exists');
    }
    throw error;
  }
}

/**
 * Update an existing TEMPLATE
 */
export function updateTEMPLATE(id, templateData) {
  const db = getDatabase();
  
  // Build dynamic update query based on provided fields
  const updateFields = [];
  const values = [];
  
  // Replace with your actual field names
  if (templateData.name !== undefined) {
    updateFields.push('name = ?');
    values.push(templateData.name.trim());
  }
  
  if (templateData.email !== undefined) {
    updateFields.push('email = ?');
    values.push(templateData.email.trim());
  }
  
  if (templateData.phone !== undefined) {
    updateFields.push('phone = ?');
    values.push(templateData.phone.trim());
  }
  
  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // Add updated_at timestamp
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  try {
    const stmt = db.prepare(`
      UPDATE TEMPLATE 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null;
    }
    
    // Get the updated record
    return getTEMPLATEById(id);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A TEMPLATE with this email already exists');
    }
    throw error;
  }
}

/**
 * Delete a TEMPLATE
 */
export function deleteTEMPLATE(id) {
  const db = getDatabase();
  
  // First get the record to return it
  const template = getTEMPLATEById(id);
  if (!template) {
    return null;
  }
  
  const stmt = db.prepare('DELETE FROM TEMPLATE WHERE id = ?');
  stmt.run(id);
  
  return template;
}

/**
 * Check if TEMPLATE email exists (excluding a specific ID)
 */
export function templateEmailExists(email, excludeId = null) {
  const db = getDatabase();
  let stmt;
  
  if (excludeId) {
    stmt = db.prepare('SELECT COUNT(*) as count FROM TEMPLATE WHERE LOWER(email) = LOWER(?) AND id != ?');
    const result = stmt.get(email.trim(), excludeId);
    return result.count > 0;
  } else {
    stmt = db.prepare('SELECT COUNT(*) as count FROM TEMPLATE WHERE LOWER(email) = LOWER(?)');
    const result = stmt.get(email.trim());
    return result.count > 0;
  }
}

/**
 * Get TEMPLATE count
 */
export function getTEMPLATEsCount() {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM TEMPLATE').get();
  return result.count;
}

/**
 * Search TEMPLATE by name or email
 */
export function searchTEMPLATES(query) {
  const db = getDatabase();
  const searchTerm = `%${query.trim()}%`;
  
  const templates = db.prepare(`
    SELECT id, name, email, phone, created_at, updated_at 
    FROM TEMPLATE 
    WHERE name LIKE ? OR email LIKE ? 
    ORDER BY name
  `).all(searchTerm, searchTerm);
  
  return templates;
}

/**
 * Get TEMPLATE by email
 */
export function getTEMPLATEByEmail(email) {
  const db = getDatabase();
  
  const template = db.prepare(`
    SELECT id, name, email, phone, created_at, updated_at 
    FROM TEMPLATE 
    WHERE LOWER(email) = LOWER(?)
  `).get(email.trim());
  
  return template || null;
}

/**
 * Add this table creation to your database/connection.js file:
 * 
 * In the initializeTables() function, add:
 * 
 * // Create TEMPLATE table
 * const createTEMPLATETable = `
 *   CREATE TABLE IF NOT EXISTS TEMPLATE (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     name TEXT NOT NULL,
 *     email TEXT NOT NULL UNIQUE,
 *     phone TEXT,
 *     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 *     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 *   )
 * `;
 * db.exec(createTEMPLATETable);
 * 
 * // Create trigger for updated_at
 * const createTEMPLATEUpdateTrigger = `
 *   CREATE TRIGGER IF NOT EXISTS update_TEMPLATE_updated_at
 *   AFTER UPDATE ON TEMPLATE
 *   BEGIN
 *     UPDATE TEMPLATE SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
 *   END
 * `;
 * db.exec(createTEMPLATEUpdateTrigger);
 * 
 * USAGE EXAMPLE:
 * 
 * import { 
 *   getAllTEMPLATES, 
 *   getTEMPLATEById, 
 *   createTEMPLATE,
 *   updateTEMPLATE,
 *   deleteTEMPLATE 
 * } from './database/TEMPLATE.js';
 * 
 * // Get all records
 * const templates = getAllTEMPLATES();
 * 
 * // Get by ID
 * const template = getTEMPLATEById(1);
 * 
 * // Create new
 * const newTemplate = createTEMPLATE({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '555-1234'
 * });
 * 
 * // Update
 * const updatedTemplate = updateTEMPLATE(1, {
 *   name: 'Jane Doe',
 *   phone: '555-5678'
 * });
 * 
 * // Delete
 * const deletedTemplate = deleteTEMPLATE(1);
 */