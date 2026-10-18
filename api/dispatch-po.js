export default async function handler(req, res) {
  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Load configuration from environment variables
  const targetUrl = process.env.VITE_API_URL || process.env.API_URL;
  const apiKey = process.env.VITE_API_KEY || process.env.API_KEY || '';
  const headerName = process.env.VITE_API_KEY_HEADER || process.env.API_KEY_HEADER || 'x-api-key';

  if (!targetUrl) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'Target API endpoint is not configured. Please set VITE_API_URL or API_URL in your environment variables.'
    });
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers[headerName] = apiKey;
    }

    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: bodyString
    });

    const responseText = await apiResponse.text();

    res.status(apiResponse.status);
    res.setHeader('Content-Type', apiResponse.headers.get('content-type') || 'application/json');

    if (responseText) {
      res.send(responseText);
    } else {
      res.json({
        message: 'Order submitted successfully',
        status: apiResponse.status
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
}
