/**
 * SMS Notification API Endpoint
 * Sends SMS notifications via email-to-SMS gateway
 * Handles CORS preflight requests and validates HTTP methods
 */

// CORS headers for local development and production
// These headers are set for ALL responses to ensure proper cross-origin access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// SMS API fully disabled for compliance and privacy. All outgoing SMS/email notification code removed.
export default function handler(req, res) {
  return res.status(410).json({ error: 'SMS notification feature is disabled.' });
}

/**
 * Send email function (placeholder - would integrate with actual email service)
 * @param {Object} emailData - Email data to send
 * @returns {Promise<Object>} - Response object
 */
async function sendEmail(emailData) {
  try {
    // This is a placeholder implementation
    // In a real app, you'd integrate with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log('SMS notification request:', {
      to: emailData.to,
      subject: emailData.subject,
      textPreview: emailData.text.substring(0, 50) + '...'
    });

    // For now, just log the request and return success
    // In production, replace this with actual email service integration
    
    return {
      success: true,
      messageId: 'simulated_' + Date.now()
    };

  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}