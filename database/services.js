/**
 * Services database layer
 * Handles all CRUD operations for services with SQLite
 */

import { getDatabase } from './connection.js';

/**
 * Get all services
 */
export function getAllServices() {
  const db = getDatabase();
  const services = db.prepare('SELECT id, name, description, price FROM services ORDER BY id').all();
  
  // Convert price to number for consistency
  return services.map(service => ({
    ...service,
    price: Number(service.price)
  }));
}

/**
 * Get service by ID
 */
export function getServiceById(id) {
  const db = getDatabase();
  const service = db.prepare('SELECT id, name, description, price FROM services WHERE id = ?').get(id);
  
  if (!service) {
    return null;
  }
  
  return {
    ...service,
    price: Number(service.price)
  };
}

/**
 * Create a new service
 */
export function createService(serviceData) {
  const db = getDatabase();
  const { name, description, price } = serviceData;
  
  try {
    const stmt = db.prepare('INSERT INTO services (name, description, price) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), description.trim(), price);
    
    // Get the created service
    return getServiceById(result.lastInsertRowid);
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A service with this name already exists');
    }
    throw error;
  }
}

/**
 * Update an existing service
 */
export function updateService(id, serviceData) {
  const db = getDatabase();
  
  // First check if service exists
  const existingService = getServiceById(id);
  if (!existingService) {
    return null;
  }
  
  // Build update query dynamically based on provided fields
  const fields = [];
  const values = [];
  
  if (serviceData.name !== undefined) {
    fields.push('name = ?');
    values.push(serviceData.name.trim());
  }
  
  if (serviceData.description !== undefined) {
    fields.push('description = ?');
    values.push(serviceData.description.trim());
  }
  
  if (serviceData.price !== undefined) {
    fields.push('price = ?');
    values.push(serviceData.price);
  }
  
  if (fields.length === 0) {
    // No fields to update, return existing service
    return existingService;
  }
  
  values.push(id);
  
  try {
    const stmt = db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    // Return updated service
    return getServiceById(id);
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A service with this name already exists');
    }
    throw error;
  }
}

/**
 * Delete a service
 */
export function deleteService(id) {
  const db = getDatabase();
  
  // First get the service to return it
  const service = getServiceById(id);
  if (!service) {
    return null;
  }
  
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
  
  return service;
}

/**
 * Check if service name exists (excluding a specific ID)
 */
export function serviceNameExists(name, excludeId = null) {
  const db = getDatabase();
  let stmt;
  
  if (excludeId) {
    stmt = db.prepare('SELECT COUNT(*) as count FROM services WHERE LOWER(name) = LOWER(?) AND id != ?');
    const result = stmt.get(name.trim(), excludeId);
    return result.count > 0;
  } else {
    stmt = db.prepare('SELECT COUNT(*) as count FROM services WHERE LOWER(name) = LOWER(?)');
    const result = stmt.get(name.trim());
    return result.count > 0;
  }
}

/**
 * Get services count
 */
export function getServicesCount() {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM services').get();
  return result.count;
}