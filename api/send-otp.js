// Tank Tools - Send OTP API
// Version: 1.0
// Description: Send OTP verification code via Twilio Verify API

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
    const { phoneNumber } = req.body;

    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }

    // Validate phone number format (Kuwait +965XXXXXXXX)
    const phoneRegex = /^\+965\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format. Expected: +965XXXXXXXX' 
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

    console.log('📱 Sending OTP to:', phoneNumber);

    // Send OTP using Twilio Verify API
    const verifyResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Channel: 'sms'
        })
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error('❌ Twilio Verify API error:', verifyData);
      return res.status(500).json({ 
        success: false, 
        error: verifyData.message || 'Failed to send OTP' 
      });
    }

    console.log('✅ OTP sent successfully:', verifyData.status);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      status: verifyData.status,
      to: phoneNumber
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
