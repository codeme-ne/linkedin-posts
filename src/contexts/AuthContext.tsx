import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient, getSession } from '@/api/supabase';
import { Session, User } from '@supabase/supabase-js';

const supabase = getSupabaseClient();

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { data: { session: newSession } } = await getSession();
      setSession(newSession);
      setUser(newSession?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial session load
    const loadSession = async () => {
      try {
        const { data: { session: initialSession } } = await getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export a hook that guarantees a user is logged in
export function useAuthRequired() {
  const auth = useAuth();

  if (!auth.loading && !auth.user) {
    throw new Error('Authentication required');
  }

  return auth as AuthContextType & { user: User };
}