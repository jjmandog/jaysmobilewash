/**
 * SMS Fallback API Endpoint
 * Alternative SMS sending method
 */

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// SMS fallback API fully disabled for compliance and privacy. All outgoing SMS/email notification code removed.
export default function handler(req, res) {
  return res.status(410).json({ error: 'SMS fallback feature is disabled.' });
}