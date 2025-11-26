import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { parseJsonSafely } from '../utils/safeJson'

export const config = {
  runtime: 'edge',
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// ShipFast-inspired simple checkout creation
// Handles both one-time payments and subscriptions
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse with size limit (10KB is plenty for checkout requests)
    const parseResult = await parseJsonSafely<{
      priceId?: string;
      mode?: 'payment' | 'subscription';
      successUrl?: string;
      cancelUrl?: string;
    }>(req, 10 * 1024);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: parseResult.error }),
        { status: parseResult.error.includes('too large') ? 413 : 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { priceId, mode = 'payment', successUrl, cancelUrl } = parseResult.data

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price ID is required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Success and cancel URLs are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!['payment', 'subscription'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Mode must be either "payment" or "subscription"' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user from Authorization header if present
    let user = null
    let clientReferenceId = null
    
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const { data: userData } = await supabase.auth.getUser(token)
        user = userData.user
        clientReferenceId = user?.id
      } catch {
        // Continue without user if token is invalid
      }
    }

    // Create checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    }

    // Add client reference ID if we have a user
    if (clientReferenceId) {
      sessionParams.client_reference_id = clientReferenceId
    }

    // Configure customer handling based on auth state
    if (user?.email) {
      // User is logged in - prefill their email and link to existing customer if available
      const existingCustomer = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (existingCustomer.data.length > 0) {
        sessionParams.customer = existingCustomer.data[0].id
      } else {
        sessionParams.customer_email = user.email
        sessionParams.customer_creation = 'always'
      }
    } else {
      // User is not logged in - collect email and create customer
      sessionParams.customer_creation = 'always'
      sessionParams.tax_id_collection = { enabled: true }
    }

    // For one-time payments, set up future usage for cards
    if (mode === 'payment') {
      sessionParams.payment_intent_data = { 
        setup_future_usage: 'on_session' 
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Stripe checkout creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}