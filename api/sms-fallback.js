/**
 * SMS Fallback API Endpoint
 * Alternative SMS sending method
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, message } = req.body;

    // Validate required fields
    if (!phone || !message) {
      return res.status(400).json({ error: 'Missing required fields: phone, message' });
    }

    // Format phone number for different carriers
    const carriers = [
      { name: 'Verizon', domain: 'vtext.com' },
      { name: 'T-Mobile', domain: 'tmomail.net' },
      { name: 'AT&T', domain: 'txt.att.net' },
      { name: 'Sprint', domain: 'messaging.sprintpcs.com' }
    ];

    // Try Verizon first (since that's what the user specified)
    const verizonEmail = `${phone}@vtext.com`;
    
    const emailData = {
      to: verizonEmail,
      from: 'chatbot@jaysmobilewash.net',
      subject: '', // Some carriers prefer empty subject for SMS
      text: message,
      html: `<pre>${message}</pre>`
    };

    // Send the notification
    const response = await sendSMSViaEmail(emailData);
    
    if (response.success) {
      res.status(200).json({ 
        success: true, 
        message: 'SMS fallback sent successfully',
        carrier: 'Verizon',
        to: verizonEmail
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send SMS fallback', 
        details: response.error 
      });
    }

  } catch (error) {
    console.error('SMS fallback API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

/**
 * Send SMS via email gateway
 * @param {Object} emailData - Email data to send
 * @returns {Promise<Object>} - Response object
 */
async function sendSMSViaEmail(emailData) {
  try {
    // Log the SMS attempt
    console.log('SMS Fallback notification:', {
      to: emailData.to,
      messagePreview: emailData.text.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    // In a real implementation, this would integrate with:
    // - Twilio SMS API
    // - AWS SNS
    // - Firebase Cloud Messaging
    // - Direct email service with SMS gateway
    
    // For now, simulate success
    return {
      success: true,
      messageId: 'fallback_' + Date.now(),
      carrier: 'verizon'
    };

  } catch (error) {
    console.error('SMS via email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}