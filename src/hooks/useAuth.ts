import { useEffect, useState, useCallback, useRef } from 'react'
import { getSession, onAuthStateChange } from '@/api/supabase'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const cleanupCallbacksRef = useRef<Array<() => void>>([])

  // Register cleanup callback for state reset on auth change
  const registerCleanupCallback = useCallback((callback: () => void) => {
    cleanupCallbacksRef.current.push(callback)
    // Return unregister function
    return () => {
      cleanupCallbacksRef.current = cleanupCallbacksRef.current.filter(cb => cb !== callback)
    }
  }, [])

  // Execute all cleanup callbacks
  const executeCleanup = useCallback(() => {
    // Iterate over a copy in case a callback modifies the array
    [...cleanupCallbacksRef.current].forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Cleanup callback error:', error)
      }
    })
  }, [])

  useEffect(() => {
    getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null)
    })
    const { data: sub } = onAuthStateChange((_event, session) => {
      const newEmail = session?.user.email ?? null

      // Security fix: Clear all content states when user changes or logs out
      // Check against current state to detect user changes
      setUserEmail(prevEmail => {
        if (prevEmail !== newEmail && prevEmail !== null) {
          // User changed or logged out - execute cleanup
          executeCleanup()
        }
        return newEmail
      })

      if (session) setLoginOpen(false)
    })
    return () => {
      sub?.subscription?.unsubscribe?.()
    }
  }, [executeCleanup])

  // Show welcome toast once when redirected after signup confirmation
  useEffect(() => {
    const welcome = searchParams.get('welcome')
    if (welcome === '1') {
      const KEY = 'st_welcome_toast_shown'
      const alreadyShown = typeof window !== 'undefined' && window.localStorage.getItem(KEY) === '1'
      if (!alreadyShown) {
        toast.success('Willkommen! 🎉 - Dein Account ist aktiviert. Viel Spaß beim Remixen!')
        try {
          window.localStorage.setItem(KEY, '1')
        } catch {
          // ignore storage errors (private mode etc.)
        }
      }
      // Clean query param without adding a new history entry
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('welcome')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  return {
    userEmail,
    loginOpen,
    setLoginOpen,
    searchParams,
    registerCleanupCallback, // Security fix: Export cleanup registration
  }
}