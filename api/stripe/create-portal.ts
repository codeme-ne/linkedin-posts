import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Initialize Supabase with anon key for auth validation
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Initialize Supabase with service role for database queries
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RequestBody {
  returnUrl: string;
}

interface SubscriptionRow {
  id: string;
  stripe_customer_id: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Nicht angemeldet', { status: 401 });
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response('Ungültiger Auth Token', { status: 401 });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    
    if (!body.returnUrl) {
      return new Response('Return URL ist erforderlich', { status: 400 });
    }

    // Get user's subscription with customerId
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single() as { data: SubscriptionRow | null; error: any };

    if (subscriptionError || !subscription) {
      console.error('Subscription fetch error:', subscriptionError);
      return new Response('Du hast noch kein Billing-Konto. Kaufe zuerst ein Abo.', { status: 400 });
    }

    if (!subscription.stripe_customer_id) {
      return new Response('Kein Stripe Customer ID gefunden. Kontaktiere den Support.', { status: 400 });
    }

    // Initialize Stripe
    const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY!);

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: body.returnUrl,
    });

    if (!portalSession.url) {
      throw new Error('Portal session URL nicht erhalten');
    }

    return new Response(JSON.stringify({
      url: portalSession.url
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Customer Portal Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}