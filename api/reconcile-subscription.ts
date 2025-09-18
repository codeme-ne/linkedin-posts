import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Missing or invalid authorization header', { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase with service role key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return new Response('Server configuration error', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response('Invalid or expired token', { status: 401 })
    }

    // Check for pending subscriptions that need activation
    const { data: pendingSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', false)
      .eq('status', 'paid')

    if (fetchError) {
      console.error('Error fetching pending subscriptions:', fetchError)
      return new Response('Database error', { status: 500 })
    }

    let activatedCount = 0

    if (pendingSubscriptions && pendingSubscriptions.length > 0) {
      // Activate pending subscriptions
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ is_active: true, activated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', false)
        .eq('status', 'paid')

      if (updateError) {
        console.error('Error activating subscriptions:', updateError)
        return new Response('Failed to activate subscriptions', { status: 500 })
      }

      activatedCount = pendingSubscriptions.length
    }

    return new Response(
      JSON.stringify({
        success: true,
        activated: activatedCount,
        message: activatedCount > 0 ? 'Subscriptions activated successfully' : 'No pending subscriptions found'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Reconcile subscription error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}