/**
 * Secure serverless API endpoint for handling booking SMS notifications
 * Processes booking data and sends SMS notifications
 */

// Known bot/crawler/spider user-agents to block
const BLOCKED_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'curl',
  'wget',
  'python',
  'scrapy'
];

export default async function handler(req, res) {
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

  // Validate required fields
  const { name, phone, service, date, time, notes } = req.body;
  
  if (!name || !phone || !service) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, service' });
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    // For now, we'll simulate SMS sending with logging
    // In production, this would integrate with Twilio, AWS SNS, or similar service
    const bookingData = {
      name: name.trim(),
      phone: phone.trim(),
      service: service.trim(),
      date: date?.trim() || 'Not specified',
      time: time?.trim() || 'Not specified',
      notes: notes?.trim() || 'None',
      timestamp: new Date().toISOString(),
      source: 'Chat Widget'
    };

    console.log('New booking received:', bookingData);

    // Simulate SMS notification to business
    const businessMessage = `New booking from ${bookingData.name}
Phone: ${bookingData.phone}
Service: ${bookingData.service}
Date: ${bookingData.date}
Time: ${bookingData.time}
Notes: ${bookingData.notes}
Source: ${bookingData.source}`;

    console.log('SMS would be sent to business:', businessMessage);

    // Here you would integrate with your SMS service:
    // await sendSMS(process.env.BUSINESS_PHONE, businessMessage);
    // await sendSMS(bookingData.phone, confirmationMessage);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Booking request received successfully',
      booking: {
        id: `booking_${Date.now()}`,
        name: bookingData.name,
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time
      }
    });

  } catch (error) {
    console.error('Booking processing failed:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}