const axios = require('axios');

exports.handler = async function(event, context) {
  console.log('Function invoked');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
    console.log('Received email:', email);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
  }

  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

  console.log('API Key:', CONVERTKIT_API_KEY ? 'Present' : 'Missing');
  console.log('Form ID:', CONVERTKIT_FORM_ID ? 'Present' : 'Missing');

  if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
    console.error('Missing ConvertKit API key or form ID');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    console.log('Sending request to ConvertKit API');
    const response = await axios.post(
      `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
      {
        email,
        api_key: CONVERTKIT_API_KEY
      }
    );

    console.log('ConvertKit API response:', response.status, response.data);

    if (response.status === 200) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Thank you for subscribing! We\'ll notify you when we launch.' })
      };
    } else {
      console.error('ConvertKit API Error:', response.data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Subscription failed. Please try again later.' })
      };
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while processing your request. Please try again later.' })
    };
  }
};