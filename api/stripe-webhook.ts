import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Initialize Supabase with service role key (for bypassing RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe Product IDs (from Stripe Dashboard) - to be configured
const PRODUCT_CONFIG: Record<string, { interval: 'lifetime' | 'monthly' | 'yearly'; name: string }> = {
  // These IDs need to be updated with actual Stripe product IDs
  'prod_lifetime': { interval: 'lifetime', name: 'Lifetime Deal' },
  'prod_monthly': { interval: 'monthly', name: 'Monthly Pro' }
};

// Minimal shape we read from Stripe session/payment objects
type PaymentData = {
  customer?: string | null;
  payment_intent?: string | null;
  subscription?: string | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  id?: string;
};

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

// Helper function: Detect subscription type from Stripe data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectSubscriptionType(session: any): {
  interval: 'lifetime' | 'monthly' | 'yearly';
  amount: number;
  currency: string;
  priceId?: string;
  productId?: string;
} {
  // Extract from line_items
  const lineItem = session.line_items?.data?.[0];
  const price = lineItem?.price;

  // Check product ID
  const productId = price?.product || session.subscription?.items?.data?.[0]?.price?.product;
  const productConfig = productId ? PRODUCT_CONFIG[productId] : null;

  // Determine interval
  let interval: 'lifetime' | 'monthly' | 'yearly' = 'lifetime';
  if (productConfig) {
    interval = productConfig.interval;
  } else if (price?.recurring) {
    interval = price.recurring.interval === 'month' ? 'monthly' : 'yearly';
  } else if (!session.subscription) {
    interval = 'lifetime';
  }

  return {
    interval,
    amount: session.amount_total || price?.unit_amount || 0,
    currency: session.currency || 'eur',
    priceId: price?.id,
    productId: productId
  };
}

// Main function: Activate user subscription
async function activateUserSubscription(
  userId: string,
  paymentData: PaymentData,
  subscriptionType: ReturnType<typeof detectSubscriptionType>
) {
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: paymentData.customer,
    stripe_payment_intent_id: paymentData.payment_intent,
    stripe_subscription_id: paymentData.subscription,
    status: 'active',
    interval: subscriptionType.interval,
    amount: subscriptionType.amount,
    currency: subscriptionType.currency,
    stripe_price_id: subscriptionType.priceId,
    stripe_product_id: subscriptionType.productId,
    payment_provider: 'stripe',
    updated_at: new Date().toISOString(),
    // For monthly subscriptions, add period dates
    ...(paymentData.subscription && subscriptionType.interval === 'monthly' ? {
      current_period_start: paymentData.current_period_start ? 
        new Date(paymentData.current_period_start * 1000).toISOString() : null,
      current_period_end: paymentData.current_period_end ? 
        new Date(paymentData.current_period_end * 1000).toISOString() : null,
    } : {})
  };

  if (existing) {
    // Update existing
    return await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('user_id', userId);
  } else {
    // Insert new
    return await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString()
      });
  }
}

// Main function: Create pending subscription
async function createPendingSubscription(
  email: string,
  paymentData: PaymentData,
  subscriptionType: ReturnType<typeof detectSubscriptionType>
) {
  // First check if pending subscription already exists
  const { data: existing } = await supabase
    .from('pending_subscriptions')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existing) {
    // Update existing pending subscription
    return await supabase
      .from('pending_subscriptions')
      .update({
        stripe_customer_id: paymentData.customer,
        stripe_payment_intent_id: paymentData.payment_intent,
        stripe_subscription_id: paymentData.subscription,
        stripe_session_id: paymentData.id,
        interval: subscriptionType.interval,
        amount: subscriptionType.amount,
        currency: subscriptionType.currency,
        metadata: {
          stripe_price_id: subscriptionType.priceId,
          stripe_product_id: subscriptionType.productId
        },
        created_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  }

  return await supabase
    .from('pending_subscriptions')
    .insert({
      email,
      stripe_customer_id: paymentData.customer,
      stripe_payment_intent_id: paymentData.payment_intent,
      stripe_subscription_id: paymentData.subscription,
      stripe_session_id: paymentData.id,
      interval: subscriptionType.interval,
      amount: subscriptionType.amount,
      currency: subscriptionType.currency,
      status: 'pending',
      metadata: {
        stripe_price_id: subscriptionType.priceId,
        stripe_product_id: subscriptionType.productId
      }
    });
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
    console.log('📨 Stripe Event:', event.type);

    // Handle different event types
    switch (event.type) {
      // MAIN EVENT: Checkout completed
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Fallback: some setups don't populate customer_email; use customer_details.email
        const email: string | null | undefined =
          session.customer_email ?? session.customer_details?.email ?? null;
        const subscriptionType = detectSubscriptionType(session);

        console.log('💳 Payment received:', {
          email,
          type: subscriptionType.interval,
          amount: subscriptionType.amount / 100, // Convert cents to euros
          currency: subscriptionType.currency
        });

        // 1. Try to find user
        let user: { id: string; email?: string } | null = null;
        
        if (session.client_reference_id) {
          // User ID was provided
          const { data: userData } = await supabase.auth.admin.getUserById(
            session.client_reference_id
          );
          if (userData?.user) {
            user = { id: userData.user.id, email: userData.user.email };
          }
        }

        if (!user && email) {
          // Search by email
          const { data: userData } = await supabase.auth.admin.listUsers();
          if (userData?.users) {
            const found = userData.users.find((u: User) => u.email === email) || null;
            if (found) {
              user = { id: found.id, email: found.email ?? undefined };
            }
          }
        }

        if (user) {
          // User exists → Activate subscription
          console.log('✅ Activating subscription for user:', user.id);
          const { error } = await activateUserSubscription(
            user.id,
            session,
            subscriptionType
          );

          if (error) {
            console.error('❌ Activation error:', error);
            throw error;
          }
        } else if (email) {
          // User doesn't exist → Create pending subscription
          console.log('⏳ Creating pending subscription for:', email);
          const { error } = await createPendingSubscription(
            email,
            session,
            subscriptionType
          );

          if (error) {
            console.error('❌ Pending creation error:', error);
            throw error;
          }
        }
        break;
      }

      // MONTHLY: Subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('📅 Monthly subscription created:', subscription.id);

        // Update subscription with period data if we have a user
        if (subscription.metadata?.user_id) {
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscription.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              status: subscription.status,
              cancel_at_period_end: false
            })
            .eq('user_id', subscription.metadata.user_id);
        }
        break;
      }

      // MONTHLY: Subscription updated (renewals, changes)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('📝 Subscription updated:', subscription.id);

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      // MONTHLY: Payment succeeded (renewal)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Skip first payment (handled by checkout.session.completed)
        if (invoice.billing_reason === 'subscription_create') {
          break;
        }

        if (invoice.subscription) {
          console.log('💰 Monthly payment succeeded for subscription:', invoice.subscription);

          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      // MONTHLY: Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          console.log('⚠️ Monthly payment failed for subscription:', invoice.subscription);

          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      // MONTHLY: Subscription canceled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('🚫 Subscription canceled:', subscription.id);

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      // Legacy payment intent handler (kept for backward compatibility)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Only process if not already handled by checkout.session.completed
        if (paymentIntent.metadata?.processed_by_checkout !== 'true') {
          console.log('Legacy payment_intent.succeeded event (keeping for compatibility)');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    
    // Log critical errors for monitoring
    if (error instanceof Error) {
      console.error('CRITICAL: Webhook processing failed', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return 500 to trigger Stripe retry
    return new Response('Internal Server Error', { status: 500 });
  }
}