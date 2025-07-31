import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SavedPost {
  id: number
  content: string
  created_at: string
}

export const savePost = async (content: string) => {
  console.log('Saving post to Supabase:', { content })
  
  const { data, error } = await supabase
    .from('saved_posts')
    .insert([{ content }])
    .select()
  
  if (error) {
    console.error('Supabase save error:', error)
    throw new Error(`Supabase error: ${error.message}`)
  }
  
  console.log('Post saved successfully:', data)
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