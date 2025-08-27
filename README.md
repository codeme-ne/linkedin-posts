# linkedin-posts

A content remixing tool using React.

## Features

1. Paste in text we want to remix
2. Click a button to apply the remixing we want for it
3. Send the request to an AI API endpoint
4. See the remix in an output box
5. Add other styling and features that we want as we go

## Tech Stack

1. React
2. TailwindCSS
3. Vercel


## Setup

1. Install dependencies
2. Copy `.env.example` to `.env` and fill in the values
3. Start the dev server

### Environment variables

This project uses Vite. Only variables prefixed with `VITE_` are exposed to the client.

- `VITE_CLAUDE_API_KEY` — Anthropic Claude API key
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_LINKEDIN_ACCESS_TOKEN` (optional) — LinkedIn API access token with `w_member_social`
- `VITE_LINKEDIN_AUTHOR_URN` (optional) — Author URN, e.g. `urn:li:person:XXXX` or `urn:li:organization:XXXX`

If the LinkedIn variables are not set, the app will fall back to the LinkedIn share dialog.
