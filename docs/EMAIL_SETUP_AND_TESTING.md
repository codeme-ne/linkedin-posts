# Email setup and testing (Resend + Vercel + DNS)

This guide shows how to configure domain auth, environment variables, and send a test email through the secured API route.

## Prerequisites

- Deployed project on Vercel
- Resend account (free tier is fine)
- Access to your DNS provider (Name.com)

## 1) DNS records (Name.com)

Set the following records for `tranformer.social`:

- A (apex): `tranformer.social` → `76.76.21.21` (Vercel)
- CNAME: `www.tranformer.social` → your vercel-dns target (already set)
- TXT (SPF): `tranformer.social` → `v=spf1 include:spf.resend.com ~all`
- TXT (DKIM): `resend._domainkey.tranformer.social` → DKIM key from Resend
- TXT (DMARC): `_dmarc.tranformer.social` → `v=DMARC1; p=none;`

Notes:

- Don’t add AAAA for apex.
- Optional: add `rua=mailto:dmarc@tranformer.social` to DMARC for reports, and later switch `p=quarantine/reject`.

## 2) Resend domain verification

- In Resend Dashboard → Domains → Add domain
- Follow instructions to add DKIM/SPF/DMARC (see above)
- Wait until status is Verified

## 3) Vercel environment variables

Project → Settings → Environment Variables:

- `RESEND_API_KEY`: your Resend Live key (`re_...`)
- `INTERNAL_ADMIN_TOKEN`: long random string (used to protect the test endpoint)
- Apply to Production (and Preview if desired), then redeploy

## 4) Send a test email (zsh)

Set variables and cURL the test route. Replace values as needed.

```zsh
export DOMAIN="tranformer.social"        # or your Vercel URL
export ADMIN_TOKEN="<your_internal_admin_token>"
export TO_EMAIL="you@example.com"

curl -sS -X POST "https://${DOMAIN}/api/test-email" \
  -H "x-admin-token: ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"${TO_EMAIL}\"}"
```

Responses:

- `ok: true` → Resend accepted the email
- `401 Unauthorized` → admin token missing or incorrect
- `500 RESEND_API_KEY missing` → env not set or not deployed yet
- `502` with JSON details → check Resend error (e.g., domain not verified)

## 5) Webhook integration

- The Stripe webhook uses `no-reply@tranformer.social` as sender via Resend API.
- Ensure the domain is Verified in Resend; no further code changes needed.

## 6) Troubleshooting

- Wait 5–30 minutes after DNS changes
- Check spam folder
- Verify Vercel env vars are in the correct environment and a redeploy happened
- In Resend → Activity/Logs for errors

## 7) Security & cleanup

- Rotate `RESEND_API_KEY` and `INTERNAL_ADMIN_TOKEN` if shared
- The test route is `api/test-email.ts`; remove it when no longer needed for testing

## 8) Optional improvements

- Add renewal/failure emails from Stripe events (invoice.payment_succeeded/failed)
- Tighten DMARC to `p=quarantine` or `p=reject` after monitoring
