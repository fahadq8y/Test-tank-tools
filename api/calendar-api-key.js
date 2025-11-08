/**
 * Google Calendar API Key Endpoint
 * Returns Google Calendar API key from environment variables
 * 
 * This Edge Function protects the API key by:
 * - Storing it in Vercel Environment Variables
 * - Not exposing it in GitHub repository
 * - Serving it only at runtime
 */

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Get API key from environment
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_CALENDAR_API_KEY not set');
    res.status(500).json({ error: 'API key not configured' });
    return;
  }
  
  // Return API key
  res.status(200).json({ apiKey });
}
