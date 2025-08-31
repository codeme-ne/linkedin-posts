import { useState } from 'react'
import { signInWithEmail } from '@/api/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { error } = await signInWithEmail(email)
      if (error) throw error
      toast({
        title: 'Magic Link gesendet',
        description: 'Bitte prüfe deine E-Mail, um dich einzuloggen.'
      })
      setSent(true)
    } catch (err) {
      toast({
        title: 'Login fehlgeschlagen',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      })
      setSent(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-3">
      <label className="text-sm font-medium">E-Mail</label>
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading || !email} className="w-full">
        {loading ? 'Sende Link…' : sent ? 'Link erneut senden' : 'Login-Link senden'}
      </Button>
      {sent && (
        <p className="text-sm text-green-600">
          Wir haben einen Magic Link an <span className="font-medium">{email}</span> gesendet. Prüfe bitte dein Postfach und ggf. den Spam-Ordner.
        </p>
      )}
    </form>
  )
}
