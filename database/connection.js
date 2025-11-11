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
      // Reset services table
      const servicesTableExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='services'").get();
      if (servicesTableExists) {
        database.exec('DELETE FROM services');
        // Reset auto-increment counter
        database.exec("DELETE FROM sqlite_sequence WHERE name='services'");
      }

      // Reset customers table
      const customersTableExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'").get();
      if (customersTableExists) {
        database.exec('DELETE FROM customers');
        // Reset auto-increment counter
        database.exec("DELETE FROM sqlite_sequence WHERE name='customers'");
      }

      // Reset bookings table
      const bookingsTableExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'").get();
      if (bookingsTableExists) {
        database.exec('DELETE FROM bookings');
        // Reset auto-increment counter
        database.exec("DELETE FROM sqlite_sequence WHERE name='bookings'");
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

  // Create customers table
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
      email TEXT UNIQUE NOT NULL CHECK(length(email) > 0 AND length(email) <= 255),
      phone TEXT NOT NULL CHECK(length(phone) > 0 AND length(phone) <= 15),
      address TEXT CHECK(length(address) <= 255),
      notes TEXT CHECK(length(notes) <= 500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createCustomersTable);

  // Create trigger to update customers updated_at timestamp
  const createCustomersUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_customers_updated_at
    AFTER UPDATE ON customers
    FOR EACH ROW
    BEGIN
      UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `;

  db.exec(createCustomersUpdateTrigger);

  // Create bookings table
  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL CHECK(length(customer_name) > 0 AND length(customer_name) <= 100),
      customer_phone TEXT NOT NULL CHECK(length(customer_phone) > 0 AND length(customer_phone) <= 15),
      customer_email TEXT NOT NULL CHECK(length(customer_email) > 0 AND length(customer_email) <= 255),
      car_type TEXT NOT NULL CHECK(length(car_type) > 0 AND length(car_type) <= 50),
      package_type TEXT CHECK(length(package_type) <= 50),
      custom_services TEXT CHECK(length(custom_services) <= 1000),
      surcharge DECIMAL(5,2) DEFAULT 0 CHECK(surcharge >= 0 AND surcharge < 1000),
      total_price DECIMAL(7,2) NOT NULL CHECK(total_price >= 0 AND total_price < 10000),
      preferred_date DATE NOT NULL,
      preferred_time TEXT NOT NULL CHECK(length(preferred_time) > 0 AND length(preferred_time) <= 20),
      address TEXT NOT NULL CHECK(length(address) > 0 AND length(address) <= 500),
      special_instructions TEXT CHECK(length(special_instructions) <= 1000),
      photo_count INTEGER DEFAULT 0 CHECK(photo_count >= 0),
      status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(preferred_date, preferred_time)
    )
  `;

  db.exec(createBookingsTable);

  // Create trigger to update bookings updated_at timestamp
  const createBookingsUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_bookings_updated_at
    AFTER UPDATE ON bookings
    FOR EACH ROW
    BEGIN
      UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `;

  db.exec(createBookingsUpdateTrigger);

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
