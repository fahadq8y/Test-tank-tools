/**
 * Firebase Config API Endpoint
 * Returns Firebase configuration from environment variables
 * 
 * This Edge Function protects Firebase credentials by:
 * - Storing them in Vercel Environment Variables
 * - Not exposing them in GitHub repository
 * - Serving them only at runtime
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
  
  // Return Firebase configuration from environment variables
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  
  // Check if all required variables are set
  const missingVars = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    res.status(500).json({ 
      error: 'Firebase configuration incomplete',
      missing: missingVars
    });
    return;
  }
  
  // Return configuration
  res.status(200).json(firebaseConfig);
}
