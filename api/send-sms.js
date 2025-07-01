/**
 * Production-ready SMS notification endpoint for Jay's Mobile Wash
 * Sends booking notifications via Gmail to Verizon SMS gateway
 */

import nodemailer from 'nodemailer';

// Known bot/crawler/spider user-agents to block
const BLOCKED_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'curl',
  'wget',
  'python',
  'scrapy',
  'postman'
];

// Verizon SMS gateway
const VERIZON_SMS_GATEWAY = '5622289429@vtext.com';

// Maximum SMS length (standard SMS limit)
const MAX_SMS_LENGTH = 160;

/**
 * Validates booking request data
 */
function validateBookingData(data) {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }
  
  if (!data.service || typeof data.service !== 'string' || data.service.trim().length === 0) {
    errors.push('Service is required');
  }
  
  if (!data.date || typeof data.date !== 'string' || data.date.trim().length === 0) {
    errors.push('Date is required');
  }
  
  if (!data.time || typeof data.time !== 'string' || data.time.trim().length === 0) {
    errors.push('Time is required');
  }
  
  return errors;
}

/**
 * Formats booking data into SMS message and trims to 160 characters
 */
function formatSMSMessage(data) {
  const { name, phone, service, date, time, notes } = data;
  
  // Create concise message
  let message = `New Booking: ${name} (${phone}) - ${service} on ${date} at ${time}`;
  
  // Add notes if there's space
  if (notes && notes.trim().length > 0) {
    const notesText = ` - ${notes.trim()}`;
    if (message.length + notesText.length <= MAX_SMS_LENGTH) {
      message += notesText;
    }
  }
  
  // Trim to SMS limit
  if (message.length > MAX_SMS_LENGTH) {
    message = message.substring(0, MAX_SMS_LENGTH - 3) + '...';
  }
  
  return message;
}

/**
 * Creates Gmail transporter for sending SMS
 */
function createGmailTransporter(gmailUser, gmailAppPassword) {
  return nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  });
}

export default async function handler(req, res) {
  // Set CORS headers for SPA compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Block known bot/crawler/spider user-agents
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBlocked = BLOCKED_USER_AGENTS.some(blockedAgent => 
    userAgent.includes(blockedAgent.toLowerCase())
  );
  
  if (isBlocked) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Validate environment variables
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser || !gmailAppPassword) {
    console.error('Gmail credentials not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Validate request body
    const bookingData = req.body;
    const validationErrors = validateBookingData(bookingData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Format SMS message
    const smsMessage = formatSMSMessage(bookingData);
    
    // Create Gmail transporter
    const transporter = createGmailTransporter(gmailUser, gmailAppPassword);
    
    // Email configuration for SMS gateway
    const mailOptions = {
      from: gmailUser,
      to: VERIZON_SMS_GATEWAY,
      subject: '', // Empty subject for SMS
      text: smsMessage
    };

    // Send email to SMS gateway
    await transporter.sendMail(mailOptions);
    
    // Success response
    return res.status(200).json({ 
      success: true, 
      message: 'SMS notification sent successfully',
      messageLength: smsMessage.length 
    });

  } catch (error) {
    console.error('SMS notification failed:', error.message);
    
    // Check for specific Gmail/SMTP errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: 'Email authentication failed' });
    } else if (error.code === 'ECONNECTION') {
      return res.status(500).json({ error: 'Email service connection failed' });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}