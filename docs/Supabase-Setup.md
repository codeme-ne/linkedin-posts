# Project schema – public

## Tables

    saved_posts
        id bigint primary key – generated always as identity
        content text (not null)
        created_at timestamp with time zone default now()
        user_id uuid default auth.uid() → auth.users(id) (FK)
        platform varchar default 'linkedin' (constrained to linkedin, x, instagram)

    subscriptions
        id uuid default gen_random_uuid() primary key
        user_id uuid → auth.users(id) (FK)
        stripe_customer_id text
        stripe_subscription_id text unique
        stripe_payment_intent_id text
        payment_provider text default 'stripe'
        status text default 'free'
        trial_ends_at, renews_at, ends_at timestamp with time zone
        extraction_limit integer default 20
        extraction_reset_at timestamp with time zone default first‑day‑of‑next‑month
        interval text constrained to lifetime, monthly, yearly
        amount integer
        currency text default 'eur'
        created_at, updated_at timestamp with time zone default now()

    extraction_usage – tracks premium extractions (e.g., Firecrawl)
        id uuid default gen_random_uuid() primary key
        user_id uuid → auth.users(id) (FK)
        extraction_type text constrained to jina, firecrawl
        url text (not null)
        extracted_at timestamp with time zone default now()
        success boolean default true
        error_message text (nullable)
        metadata jsonb default '{}'
        created_at timestamp with time zone default now()

    generation_usage – records each generation request
        id uuid default gen_random_uuid() primary key
        user_id uuid → auth.users(id) (FK)
        generated_at timestamp with time zone (not null)
        created_at timestamp with time zone default now()

    pending_subscriptions – temporary storage for subscription attempts not yet activated
        id uuid default gen_random_uuid() primary key
        email text (not null)
        stripe_customer_id, stripe_payment_intent_id, stripe_subscription_id, stripe_session_id text (nullable)
        interval text constrained to lifetime, monthly, yearly
        amount integer (nullable)
        currency text default 'eur'
        status text default 'pending' (constrained to pending, activated, expired)
        metadata jsonb (nullable)
        created_at timestamp with time zone default now()
        activated_at timestamp with time zone (nullable)
        expires_at timestamp with time zone default now() + 30 days

## Relationships (foreign keys)

    saved_posts.user_id → auth.users.id
    subscriptions.user_id → auth.users.id
    extraction_usage.user_id → auth.users.id
    generation_usage.user_id → auth.users.id

All tables have Row‑Level Security (RLS) enabled.

## RLS policies (public role)

    saved_posts

        Allow select own posts – SELECT – condition user_id = auth.uid()
        Allow insert own posts – INSERT – WITH CHECK (user_id = auth.uid())
        Allow update own posts – UPDATE – USING (user_id = auth.uid()) and WITH CHECK (user_id = auth.uid())
        Allow delete own posts – DELETE – condition user_id = auth.uid()

    extraction_usage

        Users can view their own extraction usage – SELECT – condition auth.uid() = user_id
        System can create extraction usage – INSERT – no extra check (any authenticated user may insert)

    generation_usage

        Users can view their own generation usage – SELECT – condition auth.uid() = user_id
        Users can insert their own generation usage – INSERT – WITH CHECK (auth.uid() = user_id)

    subscriptions

        Users can view own subscription – SELECT – condition auth.uid() = user_id
        Service role can manage all subscriptions – ALL – condition auth.role() = 'service_role'

    pending_subscriptions

        Users can view their pending subscriptions – SELECT – condition (auth.jwt() ->> 'email') = email (matches email claim)
        Service role can manage pending subscriptions – ALL – condition auth.role() = 'service_role'

All policies are permissive (the default for Supabase) and apply to the public role, which is what the client‑side anon and authenticated roles are mapped to after authentication.
## Webhook Idempotency

The `processed_webhooks` table enables replay protection for Stripe webhooks:

- Every webhook event is checked against this table before processing
- If `event_id` exists, the webhook is skipped (200 response with `duplicate: true`)
- After successful processing, the event is recorded with timestamp
- RLS policies restrict access to service role only (server-side only)

Migration: `supabase/migrations/20250126_create_processed_webhooks.sql`

Implementation in `api/stripe-webhook-simplified.ts`:
- Line 56: Timestamp tolerance (300s) prevents replay attacks
- Lines 72-85: Idempotency check before processing
- Lines 321-328: Mark event as processed after successful handling
