import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader?.toLowerCase().startsWith('bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }
    const accessToken = authHeader.split(' ')[1]
    if (!accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Validate token and get user
    const { data: userData, error: getUserError } = await supabase.auth.getUser(accessToken)
    if (getUserError || !userData?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = userData.user
    const email = user.email
    if (!email) {
      return new Response('No email on user', { status: 400 })
    }

    // Find pending subscriptions for this email
    const { data: pendings, error: pendingError } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingError) {
      console.error('Error fetching pending_subscriptions:', pendingError)
      return new Response('Database error', { status: 500 })
    }

    if (!pendings || pendings.length === 0) {
      return Response.json({ activated: 0 })
    }

    // Use the newest pending entry
    const pending = pendings[0]

    // Upsert into subscriptions
    const subscriptionData: Record<string, unknown> = {
      user_id: user.id,
      stripe_customer_id: pending.stripe_customer_id,
      stripe_payment_intent_id: pending.stripe_payment_intent_id,
      stripe_subscription_id: pending.stripe_subscription_id,
      status: 'active',
      interval: pending.interval,
      amount: pending.amount,
      currency: pending.currency || 'eur',
      stripe_price_id: pending.metadata?.stripe_price_id ?? null,
      stripe_product_id: pending.metadata?.stripe_product_id ?? null,
      payment_provider: 'stripe',
      updated_at: new Date().toISOString(),
    }

    // Check if subscription exists for user
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('user_id', user.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert({ ...subscriptionData, created_at: new Date().toISOString() })
      if (error) throw error
    }

    // Mark all pendings for this email as activated (safety: avoid double use)
    const { error: updatePendingError } = await supabase
      .from('pending_subscriptions')
      .update({ status: 'activated', activated_at: new Date().toISOString() })
      .eq('email', email)
      .eq('status', 'pending')

    if (updatePendingError) {
      console.error('Failed to update pending_subscriptions:', updatePendingError)
      // do not fail the whole request; return success for subscription activation
    }

    return Response.json({ activated: 1, user_id: user.id })
  } catch (err) {
    console.error('Reconcile error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
