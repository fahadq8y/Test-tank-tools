// Tank Tools - Verify OTP API
// Version: 1.0
// Description: Verify OTP code via Twilio Verify API

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { phoneNumber, code } = req.body;

    // Validate input
    if (!phoneNumber || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and code are required' 
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid code format. Expected 6 digits.' 
      });
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifySid) {
      console.error('❌ Missing Twilio credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

    console.log('🔐 Verifying OTP for:', phoneNumber);

    // Verify OTP using Twilio Verify API
    const verifyResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Code: code
        })
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error('❌ Twilio Verify API error:', verifyData);
      return res.status(500).json({ 
        success: false, 
        error: verifyData.message || 'Failed to verify OTP' 
      });
    }

    // Check if verification was successful
    if (verifyData.status === 'approved') {
      console.log('✅ OTP verified successfully');
      return res.status(200).json({
        success: true,
        message: 'Phone number verified successfully',
        status: verifyData.status,
        phoneNumber: phoneNumber
      });
    } else {
      console.log('❌ OTP verification failed:', verifyData.status);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired code',
        status: verifyData.status
      });
    }

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
