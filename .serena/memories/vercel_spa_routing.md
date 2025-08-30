# Vercel SPA Routing Configuration

## Problem
React Router client-side routes (like `/app` and `/settings`) were returning 404 errors when accessed directly on Vercel.

## Solution
Created `vercel.json` at project root:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration tells Vercel to serve `index.html` for all routes, allowing React Router to handle the routing client-side.

## Important Notes
- This is essential for any SPA deployed on Vercel
- Without this, direct access to routes other than `/` will fail
- The configuration is automatically picked up by Vercel during deployment