import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export function to get the supabase client
export const getSupabaseClient = () => supabase

export interface SavedPost {
  id: number
  content: string
  created_at: string
  user_id?: string | null
  platform?: 'linkedin' | 'x' | 'instagram'
}

export interface GenerationUsage {
  id: string
  user_id: string
  generated_at: string
  created_at: string
}

export const savePost = async (content: string, platform: 'linkedin' | 'x' | 'instagram' = 'linkedin') => {
  // Insert with implicit user_id via DEFAULT auth.uid()
  const { data, error } = await supabase
    .from('saved_posts')
    .insert([{ content, platform }])
    .select()
  
  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }
  
  return data[0]
}

export const getSavedPosts = async () => {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as SavedPost[]
}

export const deleteSavedPost = async (id: number) => {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const updateSavedPost = async (id: number, content: string) => {
  const { error } = await supabase
    .from('saved_posts')
    .update({ content })
    .eq('id', id)
  
  if (error) throw error
} 

// Auth helpers
const getRedirectUrl = () => {
  // Prefer explicit site URL from env for reliable email redirects
  const envSiteUrl = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL) as string | undefined
  if (envSiteUrl && envSiteUrl.length > 0) return envSiteUrl.replace(/\/$/, '')

  // Fallback to current origin (useful in local dev)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  // Last resort: production URL (ensure this matches Supabase Allowed Redirect URLs)
  return 'https://tranformer.social'
}

// Magic Link (OTP) Login
export const signInWithEmail = (email: string) => {
  return supabase.auth.signInWithOtp({ 
    email, 
    options: { emailRedirectTo: getRedirectUrl() } 
  });
}

// Password-based Sign Up
export const signUpWithPassword = (email: string, password: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl()
    }
  });
}

// Password-based Sign In
export const signInWithPassword = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

// Password Reset
export const resetPasswordForEmail = (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getRedirectUrl()}/reset-password`
  });
}

// Update Password (after reset)
export const updatePassword = (newPassword: string) => {
  return supabase.auth.updateUser({ password: newPassword });
}

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthStateChange = (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
  supabase.auth.onAuthStateChange(callback)