import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { supabase } from './api/supabase.ts'

// Handles Supabase email confirmation links (hash in URL),
// reconciles pending subscriptions immediately, cleans URL, and redirects.
export function BootstrapAuthLink() {
  useEffect(() => {
    const hasAuthHash = typeof window !== 'undefined' && window.location.hash.includes('access_token=')
    if (!hasAuthHash) return

    const cleanupHash = () => {
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState({}, document.title, cleanUrl)
    }

  const attemptReconcile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return false
      try {
    const resp = await fetch('/api/reconcile-subscription', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const json = await resp.json().catch(() => ({})) as { activated?: number }
    return !!json?.activated
      } catch {
        // non-blocking
    return false
      }
    }

    // Try immediately; if not signed yet, wait for SIGNED_IN
    attemptReconcile().then((activated) => {
      if (activated) {
        cleanupHash()
        window.location.replace('/app?welcome=1')
        return
      }
      const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
        if (evt === 'SIGNED_IN' && sess?.access_token) {
          const act = await attemptReconcile()
          cleanupHash()
          window.location.replace(act ? '/app?welcome=1' : '/app')
        }
      })
      // Safety timeout in case event doesn’t arrive
      setTimeout(() => {
        sub.subscription?.unsubscribe?.()
      }, 10000)
    })
  }, [])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
  <BootstrapAuthLink />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
