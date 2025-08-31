import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession, onAuthStateChange } from '@/api/supabase'

interface Props {
  children: JSX.Element
}

export default function ProtectedRoute({ children }: Props) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    getSession().then(({ data }) => setIsAuthed(!!data.session))
    const { data: sub } = onAuthStateChange((_event, session) => setIsAuthed(!!session))
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  if (isAuthed === null) return null
  if (!isAuthed) return <Navigate to="/" replace />
  return children
}
