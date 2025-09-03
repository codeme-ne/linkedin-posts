export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt für niedrige Latenz in Europa
};

export default async function handler(req: Request) {
  // CORS Headers für lokale Entwicklung
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Request Body durchreichen
    const body = await req.json();
    
    // Claude API Key aus Environment Variable (OHNE VITE_ prefix!)
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.error('CLAUDE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transparenter Proxy zu Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body), // Leitet den kompletten Body weiter
    });

    // Antwort durchreichen
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in claude edge function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
}