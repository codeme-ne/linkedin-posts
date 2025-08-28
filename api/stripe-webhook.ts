import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Initialize Supabase with service role key (for bypassing RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify webhook signature from Stripe using Web Crypto API
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const elements = signature.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.slice(2);
  const signatures = elements
    .filter(e => e.startsWith('v1='))
    .map(e => e.slice(3));

  if (!timestamp || !signatures.length) {
    return false;
  }

  // Create the signed payload string
  const signedPayload = `${timestamp}.${body}`;
  
  // Use Web Crypto API to create HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );
  
  // Convert to hex string
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Check if any of the signatures match
  return signatures.some(sig => sig === expectedSignature);
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature', { status: 401 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    // Verify the webhook signature
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid Stripe signature');
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    console.log('Stripe Event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        // Payment successful - activate subscription
        const paymentIntent = event.data.object;
        const userEmail = paymentIntent.receipt_email || paymentIntent.charges?.data?.[0]?.billing_details?.email;
        const userId = paymentIntent.metadata?.user_id || paymentIntent.client_reference_id;
        
        console.log('Processing payment for:', { userEmail, userId });

        // Try to find user by ID first, then by email
        let user = null;
        
        if (userId) {
          // Get user by ID
          const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
          if (!error && userData?.user) {
            user = userData.user;
          }
        }
        
        if (!user && userEmail) {
          // Fall back to email lookup
          const { data: userData, error } = await supabase.auth.admin.listUsers();
          if (!error && userData?.users) {
            user = userData.users.find(u => u.email === userEmail);
          }
        }
        
        if (user) {
          console.log('Found user:', user.id);
          
          // Create or update subscription record
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: user.id,
            stripe_customer_id: paymentIntent.customer || null,
            stripe_payment_intent_id: paymentIntent.id,
            payment_provider: 'stripe',
            status: 'active', // Beta Lifetime Deal = always active
            trial_ends_at: null, // No trial for lifetime deal
            renews_at: null, // No renewal for lifetime deal
            ends_at: null, // Never expires
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

          if (error) {
            console.error('Error updating subscription:', error);
            return new Response('Database error', { status: 500 });
          }

          console.log('Subscription activated for user:', user.id);
        } else {
          console.error('User not found for payment:', { userEmail, userId });
          // Still return 200 to acknowledge receipt
        }
        break;
      }

      case 'checkout.session.completed': {
        // Alternative event for Stripe Checkout
        const session = event.data.object;
        const userEmail = session.customer_email;
        const userId = session.client_reference_id;
        
        console.log('Checkout completed for:', { userEmail, userId });

        // Similar logic as payment_intent.succeeded
        let user = null;
        
        if (userId) {
          const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
          if (!error && userData?.user) {
            user = userData.user;
          }
        }
        
        if (!user && userEmail) {
          const { data: userData, error } = await supabase.auth.admin.listUsers();
          if (!error && userData?.users) {
            user = userData.users.find(u => u.email === userEmail);
          }
        }
        
        if (user) {
          console.log('Found user:', user.id);
          
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: user.id,
            stripe_customer_id: session.customer || null,
            stripe_payment_intent_id: session.payment_intent || null,
            payment_provider: 'stripe',
            status: 'active',
            trial_ends_at: null,
            renews_at: null,
            ends_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

          if (error) {
            console.error('Error updating subscription:', error);
            return new Response('Database error', { status: 500 });
          }

          console.log('Subscription activated for user:', user.id);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // For future subscription-based pricing
        console.log('Subscription event received but not processed (lifetime deal only)');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}