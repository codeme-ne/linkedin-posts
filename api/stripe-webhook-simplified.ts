import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// ShipFast-inspired simplified webhook handler
// No reconciliation complexity - direct processing
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    console.error('Stripe not configured properly')
    return new Response('Stripe configuration missing', { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('No stripe signature header')
    return new Response('No signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
  }

  console.log(`Processing Stripe event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Payment successful - grant access (ShipFast pattern)
        const session = event.data.object as Stripe.Checkout.Session

        const customerId = session.customer as string
        const priceId = session.line_items?.data?.[0]?.price?.id
        const clientReferenceId = session.client_reference_id // User ID
        const amount = session.amount_total
        const currency = session.currency

        if (!customerId || !priceId || !amount) {
          console.error('Missing required session data', { customerId, priceId, amount })
          break
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        
        let userId = clientReferenceId
        
        // If no user ID, find/create user by email (ShipFast pattern)
        if (!userId && customer.email) {
          // Try to find existing user
          const { data: existingUser } = await supabase.auth.admin.listUsers()
          const user = existingUser.users.find(u => u.email === customer.email)
          
          if (user) {
            userId = user.id
          } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: customer.email,
              email_confirm: true,
            })
            
            if (createError) {
              console.error('Failed to create user:', createError)
              break
            }
            
            userId = newUser.user?.id
          }
        }

        if (!userId) {
          console.error('Unable to determine user ID for checkout session')
          break
        }

        // Determine subscription interval based on price
        const interval = session.mode === 'subscription' ? 'monthly' : 'lifetime'
        
        // Create or update subscription record (simplified)
        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_payment_intent_id: session.payment_intent as string || null,
          stripe_subscription_id: session.subscription as string || null,
          status: 'active',
          is_active: true, // ShipFast-style hasAccess equivalent
          amount: amount,
          currency: currency || 'eur',
          interval,
          stripe_price_id: priceId,
          current_period_start: new Date().toISOString(),
          // For lifetime deals, set a far future date
          current_period_end: interval === 'lifetime' 
            ? new Date('2099-12-31').toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Upsert subscription
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
          })

        if (upsertError) {
          console.error('Failed to upsert subscription:', upsertError)
          break
        }

        console.log(`✅ Subscription activated for user ${userId}`)
        
        // Optional: Send welcome email (similar to your existing logic)
        await sendWelcomeEmail(customer.email || '', {
          amount: amount / 100,
          currency: currency || 'eur',
          interval,
        }).catch(err => console.error('Email sending failed:', err))

        break
      }

      case 'customer.subscription.updated': {
        // Subscription updated - handle plan changes
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            is_active: subscription.status === 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to update subscription:', error)
        } else {
          console.log(`✅ Subscription updated: ${subscription.id}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        // Subscription canceled - revoke access (ShipFast pattern)
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            is_active: false, // Revoke access
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to cancel subscription:', error)
        } else {
          console.log(`❌ Subscription canceled: ${subscription.id}`)
        }

        break
      }

      case 'invoice.paid': {
        // Recurring payment successful - ensure access is granted
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription as string)

          if (error) {
            console.error('Failed to reactivate subscription:', error)
          } else {
            console.log(`✅ Recurring payment processed for subscription: ${invoice.subscription}`)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        // Payment failed - could revoke access or wait for retry
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // For now, just log - Stripe will retry automatically
          console.log(`⚠️  Payment failed for subscription: ${invoice.subscription}`)
          // You could implement grace period logic here
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error: any) {
    console.error(`Webhook processing error for ${event.type}:`, error)
    return new Response(`Webhook error: ${error.message}`, { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Optional welcome email function
async function sendWelcomeEmail(email: string, details: {
  amount: number
  currency: string
  interval: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !email) return

  const subject = details.interval === 'lifetime'
    ? 'Willkommen bei Social Transformer - Lifetime Access! 🎉'
    : 'Willkommen bei Social Transformer - Ihr Pro-Abo ist aktiv! 🎉'

  const euros = details.amount.toFixed(2)
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#0f172a;">
      <h2 style="margin:0 0 16px; color:#1f2937;">Willkommen bei Social Transformer! 🎉</h2>
      <p>Vielen Dank für Ihren Kauf. Ihr ${details.interval === 'lifetime' ? 'Lifetime-Zugang' : 'Pro-Abo'} ist jetzt aktiv!</p>
      
      <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:16px 0;">
        <h3 style="margin:0 0 8px; color:#374151;">Ihre Bestellung:</h3>
        <p style="margin:4px 0;"><strong>Plan:</strong> ${details.interval === 'lifetime' ? 'Lifetime Pro' : 'Monthly Pro'}</p>
        <p style="margin:4px 0;"><strong>Betrag:</strong> €${euros}</p>
      </div>

      <p><strong>Jetzt loslegen:</strong><br>
      <a href="https://transformer.social/app" style="color:#2563eb; text-decoration:none;">→ Social Transformer App öffnen</a></p>
      
      <p>Sie haben jetzt Zugang zu allen Premium-Features:</p>
      <ul>
        <li>Unbegrenzte Content-Generierung</li>
        <li>Premium URL-Extraktion mit JavaScript-Support</li>
        <li>Posts speichern & verwalten</li>
        <li>Alle Plattformen (LinkedIn, X, Instagram)</li>
      </ul>

      <p style="margin-top:24px; font-size:14px; color:#6b7280;">
        Bei Fragen antworten Sie einfach auf diese E-Mail.<br>
        Viel Erfolg mit Social Transformer!
      </p>
    </div>
  `

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Social Transformer <welcome@transformer.social>',
        to: email,
        subject,
        html
      })
    })
  } catch (error) {
    console.error('Welcome email failed:', error)
  }
}