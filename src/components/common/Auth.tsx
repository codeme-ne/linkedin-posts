import { useState } from 'react'
import { signInWithEmail, signUpWithPassword, signInWithPassword, resetPasswordForEmail } from '@/api/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { getSupabaseClient } from '@/api/supabase'

const supabase = getSupabaseClient()

type AuthMode = 'login' | 'register' | 'magic-link'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const { toast } = useToast()

  // Safely reconcile pending subscription on the server (service role)
  // Instead of writing from the client (RLS-safe and avoids duplication)
  const checkPendingSubscription = async (_userEmail: string, _userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const resp = await fetch('/api/reconcile-subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await resp.json().catch(() => ({})) as { activated?: number }
      if (json?.activated) {
        toast({
          title: '🎉 Ihr Pro-Abo wurde aktiviert!',
          description: 'Sie haben jetzt Zugang zu allen Pro-Features.',
        })
      }
    } catch (err) {
      console.error('Error reconciling pending subscription:', err)
    }
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    // Bei Registrierung Passwörter prüfen
    if (authMode === 'register') {
      if (password.length < 6) {
        toast({
          title: 'Passwort zu kurz',
          description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
          variant: 'destructive'
        })
        return
      }
      if (password !== passwordConfirm) {
        toast({
          title: 'Passwörter stimmen nicht überein',
          description: 'Bitte stelle sicher, dass beide Passwörter identisch sind.',
          variant: 'destructive'
        })
        return
      }
    }

    setLoading(true)
    try {
      if (authMode === 'register') {
        const { error, data } = await signUpWithPassword(email, password)
        if (error) {
          // Spezielle Behandlung für verschiedene Fehlertypen
          if (error.message?.includes('User already registered')) {
            toast({
              title: 'E-Mail bereits registriert',
              description: 'Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an oder verwende eine andere E-Mail.',
              variant: 'destructive'
            })
          } else {
            throw error
          }
        } else if (data?.user && !data.session) {
          // User wurde erstellt, aber noch nicht bestätigt (email confirmation enabled)
          toast({
            title: 'Registrierung erfolgreich! 📧',
            description: 'Bitte prüfe deine E-Mail und klicke auf den Bestätigungslink, um deinen Account zu aktivieren.'
          })
          // Form zurücksetzen
          setEmail('')
          setPassword('')
          setPasswordConfirm('')
          setAuthMode('login')
        } else if (data?.session) {
          // User wurde erstellt und ist bereits eingeloggt (email confirmation disabled)
          toast({
            title: 'Registrierung erfolgreich!',
            description: 'Du wirst automatisch weitergeleitet...'
          })
          
          // Check for pending subscription
          if (data.user) {
            await checkPendingSubscription(email, data.user.id)
          }
        }
      } else {
        const { error, data } = await signInWithPassword(email, password)
        if (error) {
          // Spezielle Fehlerbehandlung für Login
          if (error.message?.includes('Invalid login credentials')) {
            toast({
              title: 'Anmeldung fehlgeschlagen',
              description: 'E-Mail oder Passwort ist falsch. Bitte überprüfe deine Eingaben.',
              variant: 'destructive'
            })
          } else if (error.message?.includes('Email not confirmed')) {
            toast({
              title: 'E-Mail nicht bestätigt',
              description: 'Bitte bestätige deine E-Mail-Adresse über den Link in der Bestätigungs-E-Mail.',
              variant: 'destructive'
            })
          } else {
            throw error
          }
        } else if (data?.session) {
          console.log('Login successful:', data)
          toast({
            title: 'Erfolgreich angemeldet!',
            description: 'Du wirst weitergeleitet...'
          })
          
          // Check for pending subscription on login too
          if (data.user) {
            await checkPendingSubscription(data.user.email || email, data.user.id)
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      toast({
        title: authMode === 'register' ? 'Registrierung fehlgeschlagen' : 'Login fehlgeschlagen',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
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
    } catch (err) {
      toast({
        title: 'Login fehlgeschlagen',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
            authMode === 'login'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('register')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
            authMode === 'register'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Registrieren
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('magic-link')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
            authMode === 'magic-link'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Magic Link
        </button>
      </div>

      {/* Auth Forms */}
      {authMode === 'magic-link' ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="deine@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !email} className="w-full">
            {loading ? 'Sende Link...' : 'Magic Link senden'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Du erhältst einen Login-Link per E-Mail
          </p>
        </form>
      ) : (
        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="deine@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={authMode === 'register' ? 'Mindestens 6 Zeichen' : 'Dein Passwort'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {authMode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Passwort bestätigen</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Passwort wiederholen"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !email || !password || (authMode === 'register' && !passwordConfirm)} 
            className="w-full"
          >
            {loading ? (
              authMode === 'register' ? 'Registriere...' : 'Anmelden...'
            ) : (
              authMode === 'register' ? 'Jetzt registrieren' : 'Anmelden'
            )}
          </Button>

          {authMode === 'login' && (
            <p className="text-xs text-center text-muted-foreground">
              <button 
                type="button"
                className="underline hover:text-foreground transition-colors"
                onClick={async () => {
                  if (!email) {
                    toast({
                      title: 'E-Mail erforderlich',
                      description: 'Bitte gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.',
                      variant: 'destructive'
                    })
                    return
                  }
                  try {
                    const { error } = await resetPasswordForEmail(email)
                    if (error) throw error
                    toast({
                      title: 'E-Mail gesendet!',
                      description: 'Prüfe deine E-Mail für den Link zum Zurücksetzen des Passworts.',
                    })
                  } catch (err) {
                    toast({
                      title: 'Fehler',
                      description: err instanceof Error ? err.message : 'Passwort-Reset fehlgeschlagen',
                      variant: 'destructive'
                    })
                  }
                }}
              >
                Passwort vergessen?
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  )
}
