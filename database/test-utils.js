/**
 * Test database utilities
 * Provides database setup/teardown for tests
 */

import { getTestDatabase } from './connection.js';

let testDbInstance = null;

/**
 * Setup test database
 */
export function setupTestDatabase() {
  testDbInstance = getTestDatabase();
  return testDbInstance;
}

/**
 * Teardown test database
 */
export function teardownTestDatabase() {
  if (testDbInstance) {
    testDbInstance.close();
    testDbInstance = null;
  }
}

/**
 * Reset test database (clear all data)
 */
export function resetTestDatabase() {
  if (testDbInstance) {
    testDbInstance.exec('DELETE FROM services');
  }
}

/**
 * Get test database instance
 */
export function getTestDatabaseInstance() {
  return testDbInstance;
}

/**
 * Services database functions that work with test database
 */

/**
 * Get all services (test version)
 */
export function getAllServicesTest() {
  const db = testDbInstance;
  const services = db.prepare('SELECT id, name, description, price FROM services ORDER BY id').all();
  
  return services.map(service => ({
    ...service,
    price: Number(service.price)
  }));
}

/**
 * Get service by ID (test version)
 */
export function getServiceByIdTest(id) {
  const db = testDbInstance;
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
 * Create a new service (test version)
 */
export function createServiceTest(serviceData) {
  const db = testDbInstance;
  const { name, description, price } = serviceData;
  
  try {
    const stmt = db.prepare('INSERT INTO services (name, description, price) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), description.trim(), price);
    
    return getServiceByIdTest(result.lastInsertRowid);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A service with this name already exists');
    }
    throw error;
  }
}

/**
 * Update an existing service (test version)
 */
export function updateServiceTest(id, serviceData) {
  const db = testDbInstance;
  
  const existingService = getServiceByIdTest(id);
  if (!existingService) {
    return null;
  }
  
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
    return existingService;
  }
  
  values.push(id);
  
  try {
    const stmt = db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return getServiceByIdTest(id);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('A service with this name already exists');
    }
    throw error;
  }
}

/**
 * Delete a service (test version)
 */
export function deleteServiceTest(id) {
  const db = testDbInstance;
  
  const service = getServiceByIdTest(id);
  if (!service) {
    return null;
  }
  
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
  
  return service;
}

/**
 * Check if service name exists (test version)
 */
export function serviceNameExistsTest(name, excludeId = null) {
  const db = testDbInstance;
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
 * Get services count (test version)
 */
export function getServicesCountTest() {
  const db = testDbInstance;
  const result = db.prepare('SELECT COUNT(*) as count FROM services').get();
  return result.count;
}