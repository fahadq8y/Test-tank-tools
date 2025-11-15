// Twilio WhatsApp API Endpoint
// Send WhatsApp notifications via Twilio

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    // Validate environment variables
    if (!accountSid || !authToken) {
      console.error('❌ Missing Twilio credentials');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Twilio credentials not configured'
      });
    }

    // Get request body
    const { to, message, type } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both "to" and "message" are required'
      });
    }

    // Format phone number for WhatsApp
    let formattedTo = to;
    if (!to.startsWith('whatsapp:')) {
      // Add whatsapp: prefix if not present
      formattedTo = `whatsapp:${to}`;
    }

    // Ensure phone number starts with +
    if (!formattedTo.includes('+')) {
      formattedTo = formattedTo.replace('whatsapp:', 'whatsapp:+');
    }

    console.log(`📤 Sending WhatsApp message to ${formattedTo}`);
    console.log(`📝 Message type: ${type || 'general'}`);

    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', formattedTo);
    params.append('Body', message);

    // Send request to Twilio
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Twilio API error:', data);
      return res.status(response.status).json({
        error: 'Failed to send WhatsApp message',
        details: data.message || 'Unknown error',
        code: data.code
      });
    }

    console.log('✅ WhatsApp message sent successfully:', data.sid);

    // Return success response
    return res.status(200).json({
      success: true,
      messageSid: data.sid,
      status: data.status,
      to: formattedTo,
      type: type || 'general',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
