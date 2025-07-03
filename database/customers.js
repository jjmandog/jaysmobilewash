/**
 * Example: Customers Database Layer
 * This shows how to implement the database layer for the customers API
 */

import { getDatabase } from './connection.js';

/**
 * Get all customers
 */
export function getAllCustomers() {
  const db = getDatabase();
  
  const customers = db.prepare(`
    SELECT id, name, email, phone, address, notes, created_at, updated_at 
    FROM customers 
    ORDER BY name
  `).all();
  
  return customers;
}

/**
 * Get customer by ID
 */
export function getCustomerById(id) {
  const db = getDatabase();
  
  const customer = db.prepare(`
    SELECT id, name, email, phone, address, notes, created_at, updated_at 
    FROM customers 
    WHERE id = ?
  `).get(id);
  
  return customer || null;
}

/**
 * Create a new customer
 */
export function createCustomer(customerData) {
  const db = getDatabase();
  
  const { name, email, phone, address = '', notes = '' } = customerData;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, notes) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), email.trim(), phone.trim(), address.trim(), notes.trim());
    
    // Get the created customer
    return getCustomerById(result.lastInsertRowid);
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A customer with this email already exists');
    }
    throw error;
  }
}

/**
 * Update an existing customer
 */
export function updateCustomer(id, customerData) {
  const db = getDatabase();
  
  // Build dynamic update query based on provided fields
  const updateFields = [];
  const values = [];
  
  if (customerData.name !== undefined) {
    updateFields.push('name = ?');
    values.push(customerData.name.trim());
  }
  
  if (customerData.email !== undefined) {
    updateFields.push('email = ?');
    values.push(customerData.email.trim());
  }
  
  if (customerData.phone !== undefined) {
    updateFields.push('phone = ?');
    values.push(customerData.phone.trim());
  }
  
  if (customerData.address !== undefined) {
    updateFields.push('address = ?');
    values.push(customerData.address.trim());
  }
  
  if (customerData.notes !== undefined) {
    updateFields.push('notes = ?');
    values.push(customerData.notes.trim());
  }
  
  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // Add updated_at timestamp
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  try {
    const stmt = db.prepare(`
      UPDATE customers 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null;
    }
    
    // Get the updated customer
    return getCustomerById(id);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A customer with this email already exists');
    }
    throw error;
  }
}

/**
 * Delete a customer
 */
export function deleteCustomer(id) {
  const db = getDatabase();
  
  // First get the customer to return it
  const customer = getCustomerById(id);
  if (!customer) {
    return null;
  }
  
  const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
  stmt.run(id);
  
  return customer;
}

/**
 * Check if customer email exists (excluding a specific ID)
 */
export function customerEmailExists(email, excludeId = null) {
  const db = getDatabase();
  let stmt;
  
  if (excludeId) {
    stmt = db.prepare('SELECT COUNT(*) as count FROM customers WHERE LOWER(email) = LOWER(?) AND id != ?');
    const result = stmt.get(email.trim(), excludeId);
    return result.count > 0;
  } else {
    stmt = db.prepare('SELECT COUNT(*) as count FROM customers WHERE LOWER(email) = LOWER(?)');
    const result = stmt.get(email.trim());
    return result.count > 0;
  }
}

/**
 * Get customers count
 */
export function getCustomersCount() {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  return result.count;
}

/**
 * Search customers by name or email
 */
export function searchCustomers(query) {
  const db = getDatabase();
  const searchTerm = `%${query.trim()}%`;
  
  const customers = db.prepare(`
    SELECT id, name, email, phone, address, notes, created_at, updated_at 
    FROM customers 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
    ORDER BY name
  `).all(searchTerm, searchTerm, searchTerm);
  
  return customers;
}

/**
 * Get customer by email
 */
export function getCustomerByEmail(email) {
  const db = getDatabase();
  
  const customer = db.prepare(`
    SELECT id, name, email, phone, address, notes, created_at, updated_at 
    FROM customers 
    WHERE LOWER(email) = LOWER(?)
  `).get(email.trim());
  
  return customer || null;
}

/**
 * Get customers created in the last N days
 */
export function getRecentCustomers(days = 30) {
  const db = getDatabase();
  
  const customers = db.prepare(`
    SELECT id, name, email, phone, address, notes, created_at, updated_at 
    FROM customers 
    WHERE created_at >= datetime('now', '-${days} days')
    ORDER BY created_at DESC
  `).all();
  
  return customers;
}

/**
 * Get customers with appointments (if you have an appointments table)
 */
export function getCustomersWithAppointments() {
  const db = getDatabase();
  
  const customers = db.prepare(`
    SELECT DISTINCT c.id, c.name, c.email, c.phone, c.address, c.notes, c.created_at, c.updated_at 
    FROM customers c 
    INNER JOIN appointments a ON c.id = a.customer_id
    ORDER BY c.name
  `).all();
  
  return customers;
}