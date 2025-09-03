export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const adminToken = process.env.INTERNAL_ADMIN_TOKEN;
  const provided = req.headers.get('x-admin-token');
  if (!adminToken || !provided || provided !== adminToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response('RESEND_API_KEY missing', { status: 500 });
  }

  try {
    const { to } = (await req.json()) as { to?: string };
    if (!to) {
      return new Response('Missing { to }', { status: 400 });
    }

    const subject = 'Test: Social Transformer Mail (Resend)';
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#0f172a">
        <h2 style="margin:0 0 8px">Test-E-Mail</h2>
        <p>Diese Nachricht bestätigt, dass der Resend-Versand funktioniert.</p>
        <p style="margin-top:16px; font-size:12px; color:#475569">Automatische Nachricht • ${new Date().toISOString()}</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Social Transformer <no-reply@tranformer.social>',
        to,
        subject,
        html,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('Resend error', resp.status, data);
      return new Response(JSON.stringify({ ok: false, status: resp.status, data }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('test-email error', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
