/**
 * Bookings database operations for Jay's Mobile Wash
 * Handles booking storage, conflict checking, and retrieval
 */

import { getDatabase } from './connection.js';

/**
 * Create a new booking
 */
export function createBooking(bookingData) {
  const db = getDatabase();
  
  // Check for time slot conflict
  const existingBooking = db.prepare(`
    SELECT id FROM bookings 
    WHERE preferred_date = ? AND preferred_time = ? AND status != 'cancelled'
  `).get(bookingData.preferredDate, bookingData.preferredTime);
  
  if (existingBooking) {
    throw new Error(`Time slot ${bookingData.preferredTime} on ${bookingData.preferredDate} is already booked`);
  }
  
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      booking_id, customer_name, customer_phone, customer_email, car_type,
      package_type, custom_services, total_price, preferred_date, preferred_time,
      address, special_instructions, photo_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = insertBooking.run(
    bookingData.bookingId,
    bookingData.customerName,
    bookingData.customerPhone,
    bookingData.customerEmail,
    bookingData.carType,
    bookingData.packageType || null,
    bookingData.customServices || null,
    bookingData.totalPrice,
    bookingData.preferredDate,
    bookingData.preferredTime,
    bookingData.address,
    bookingData.specialInstructions || null,
    bookingData.photoCount || 0,
    'confirmed'
  );
  
  return getBookingById(result.lastInsertRowid);
}

/**
 * Get booking by ID
 */
export function getBookingById(id) {
  const db = getDatabase();
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  return booking;
}

/**
 * Get booking by booking ID
 */
export function getBookingByBookingId(bookingId) {
  const db = getDatabase();
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ?').get(bookingId);
  return booking;
}

/**
 * Get all bookings
 */
export function getAllBookings() {
  const db = getDatabase();
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  return bookings;
}

/**
 * Get bookings for a specific date
 */
export function getBookingsByDate(date) {
  const db = getDatabase();
  const bookings = db.prepare('SELECT * FROM bookings WHERE preferred_date = ? AND status != \'cancelled\' ORDER BY preferred_time').all(date);
  return bookings;
}

/**
 * Get booked time slots for a specific date
 */
export function getBookedTimeSlots(date) {
  const db = getDatabase();
  const bookings = db.prepare(`
    SELECT preferred_time 
    FROM bookings 
    WHERE preferred_date = ? AND status != 'cancelled'
    ORDER BY preferred_time
  `).all(date);
  
  return bookings.map(booking => booking.preferred_time);
}

/**
 * Check if a time slot is available
 */
export function isTimeSlotAvailable(date, time) {
  const db = getDatabase();
  const existingBooking = db.prepare(`
    SELECT id FROM bookings 
    WHERE preferred_date = ? AND preferred_time = ? AND status != 'cancelled'
  `).get(date, time);
  
  return !existingBooking;
}

/**
 * Update booking status
 */
export function updateBookingStatus(bookingId, status) {
  const db = getDatabase();
  const updateBooking = db.prepare('UPDATE bookings SET status = ? WHERE booking_id = ?');
  const result = updateBooking.run(status, bookingId);
  
  if (result.changes === 0) {
    throw new Error(`Booking ${bookingId} not found`);
  }
  
  return getBookingByBookingId(bookingId);
}

/**
 * Cancel booking
 */
export function cancelBooking(bookingId) {
  return updateBookingStatus(bookingId, 'cancelled');
}

/**
 * Search bookings by customer name or phone
 */
export function searchBookings(query) {
  const db = getDatabase();
  const searchQuery = `%${query}%`;
  const bookings = db.prepare(`
    SELECT * FROM bookings 
    WHERE customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?
    ORDER BY created_at DESC
  `).all(searchQuery, searchQuery, searchQuery);
  
  return bookings;
}

/**
 * Get bookings by date range
 */
export function getBookingsByDateRange(startDate, endDate) {
  const db = getDatabase();
  const bookings = db.prepare(`
    SELECT * FROM bookings 
    WHERE preferred_date BETWEEN ? AND ?
    ORDER BY preferred_date, preferred_time
  `).all(startDate, endDate);
  
  return bookings;
}

/**
 * Get today's bookings
 */
export function getTodaysBookings() {
  const today = new Date().toISOString().split('T')[0];
  return getBookingsByDate(today);
}

/**
 * Get upcoming bookings (next 7 days)
 */
export function getUpcomingBookings() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const startDate = today.toISOString().split('T')[0];
  const endDate = nextWeek.toISOString().split('T')[0];
  
  return getBookingsByDateRange(startDate, endDate);
}