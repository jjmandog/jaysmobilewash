/**
 * Available Time Slots API Endpoint
 * Returns available time slots for a given date
 */

import { getBookedTimeSlots } from '../database/bookings.js';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Available time slots (30-minute intervals)
const ALL_TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM'
];

export default async function handler(req, res) {
  console.log('Available time slots API called:', req.method, req.url);

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get booked time slots for this date
    const bookedSlots = getBookedTimeSlots(date);

    // Filter out booked slots to get available ones
    const availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));

    console.log(`Available slots for ${date}:`, availableSlots.length, 'of', ALL_TIME_SLOTS.length);

    return res.status(200).json({
      date,
      availableSlots,
      bookedSlots,
      totalSlots: ALL_TIME_SLOTS.length,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length
    });

  } catch (error) {
    console.error('Available time slots error:', error);
    return res.status(500).json({
      error: 'Failed to get available time slots',
      message: error.message
    });
  }
}
