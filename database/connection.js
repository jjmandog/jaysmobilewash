/**
 * Database connection module for Jay's Mobile Wash Services
 * Uses SQLite for production-ready persistent storage
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path - use in-memory for tests
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const DB_PATH = isTest ? ':memory:' : path.join(__dirname, 'services.db');

let db = null;

/**
 * Get database connection
 */
export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    // Initialize database tables
    initializeTables();
  }
  
  return db;
}

/**
 * Reset database for tests
 */
export function resetDatabaseForTests() {
  if (isTest) {
    // Ensure database is initialized
    const database = getDatabase();
    
    try {
      // Check if table exists first
      const tableExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='services'").get();
      
      if (tableExists) {
        database.exec('DELETE FROM services');
        // Reset auto-increment counter
        database.exec("DELETE FROM sqlite_sequence WHERE name='services'");
      }
    } catch (error) {
      console.error('Error resetting test database:', error);
      // If there's an error, reinitialize the database
      reinitializeTables();
    }
  }
}

/**
 * Initialize database tables
 */
function initializeTables() {
  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
      description TEXT NOT NULL CHECK(length(description) > 0 AND length(description) <= 500),
      price DECIMAL(7,2) NOT NULL CHECK(price >= 0 AND price < 10000),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(createServicesTable);
  
  // Create trigger to update updated_at timestamp
  const createUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_services_updated_at
    AFTER UPDATE ON services
    FOR EACH ROW
    BEGIN
      UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `;
  
  db.exec(createUpdateTrigger);
  
  // Insert initial data if table is empty (not in test mode)
  if (!isTest) {
    insertInitialData();
  }
}

/**
 * Export initializeTables for use in reset function
 */
export function reinitializeTables() {
  if (db) {
    initializeTables();
  }
}

/**
 * Insert initial services data
 */
function insertInitialData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM services').get();
  
  if (count.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (name, description, price)
      VALUES (?, ?, ?)
    `);
    
    const initialServices = [
      {
        name: 'Basic Wash',
        description: 'Exterior wash and dry with premium soap and microfiber towels',
        price: 25.00
      },
      {
        name: 'Full Detailing',
        description: 'Complete interior and exterior detailing with wax and tire shine',
        price: 85.00
      },
      {
        name: 'Ceramic Coating',
        description: 'Professional ceramic coating application for long-lasting protection',
        price: 299.00
      }
    ];
    
    for (const service of initialServices) {
      insertService.run(service.name, service.description, service.price);
    }
  }
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Get a test database connection (separate from main database)
 */
export function getTestDatabase() {
  const testDb = new Database(':memory:');
  
  // Enable foreign key constraints
  testDb.pragma('foreign_keys = ON');
  
  // Initialize tables
  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
      description TEXT NOT NULL CHECK(length(description) > 0 AND length(description) <= 500),
      price DECIMAL(7,2) NOT NULL CHECK(price >= 0 AND price < 10000),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  testDb.exec(createServicesTable);
  
  // Create trigger to update updated_at timestamp
  const createUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_services_updated_at
    AFTER UPDATE ON services
    FOR EACH ROW
    BEGIN
      UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `;
  
  testDb.exec(createUpdateTrigger);
  
  return testDb;
}