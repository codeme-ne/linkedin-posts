import { useState } from 'react'
import { toast } from 'sonner'
import { linkedInPostsFromNewsletter, xTweetsFromBlog, instagramPostsFromBlog } from '@/api/claude'
import type { Platform } from '@/config/platforms'
import { PLATFORM_LABEL } from '@/config/platforms'
import { buildSinglePostPrompt, validatePost, normalizeSinglePostResponse } from '@/libs/promptBuilder'
import { useSubscription } from '@/hooks/useSubscription'
import { generateClaudeMessage } from '@/libs/api-client'

interface GenerationProgress {
  progress: number // 0-100
  currentPlatform: string
  totalPlatforms: number
  completedPlatforms: number
}

export const useContentGeneration = () => {
  const [postsByPlatform, setPostsByPlatform] = useState<Record<Platform, string[]>>({
    linkedin: [],
    x: [],
    instagram: [],
  })
  // Single-post state (new)
  const [generatedPosts, setGeneratedPosts] = useState<Partial<Record<Platform, { post: string; regenerationCount: number; isEdited: boolean }>>>({})
  const [activeGenerations, setActiveGenerations] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    progress: 0,
    currentPlatform: "",
    totalPlatforms: 0,
    completedPlatforms: 0,
  })
  // Free tier usage from subscription
  const { decrementUsage, hasUsageRemaining } = useSubscription()

  const generateContent = async (inputText: string, selectedPlatforms: Platform[]) => {
    if (!inputText.trim()) {
      toast.error("Bitte gib einen Text ein")
      return false
    }

    setIsLoading(true)
    setGenerationProgress({
      progress: 0,
      currentPlatform: "",
      totalPlatforms: selectedPlatforms.length,
      completedPlatforms: 0,
    })

    try {
      const newPosts: Record<Platform, string[]> = { linkedin: [], x: [], instagram: [] }
      let completed = 0

      for (const platform of selectedPlatforms) {
        const platformName = PLATFORM_LABEL[platform]
        setGenerationProgress(prev => ({
          ...prev,
          currentPlatform: platformName,
          progress: Math.round((completed / selectedPlatforms.length) * 100),
        }))

        try {
          let posts: string[] = []
          
          switch (platform) {
            case 'linkedin':
              posts = await linkedInPostsFromNewsletter(inputText)
              break
            case 'x':
              posts = await xTweetsFromBlog(inputText)
              break
            case 'instagram':
              posts = await instagramPostsFromBlog(inputText)
              break
          }

          newPosts[platform] = posts
          completed++
          
          setGenerationProgress(prev => ({
            ...prev,
            completedPlatforms: completed,
            progress: Math.round((completed / selectedPlatforms.length) * 100),
          }))

          // Usage tracking now handled in Generator.tsx
        } catch (platformError) {
          toast.error(`Fehler bei ${platformName}: ${platformError instanceof Error ? platformError.message : String(platformError)}`)
        }
      }

      setPostsByPlatform(prev => ({ ...prev, ...newPosts }))
      
      const names = selectedPlatforms.map(p => PLATFORM_LABEL[p]).join(', ')
      toast.success(`Beiträge erstellt! Generiert für: ${names}`)
      
      return true
    } catch (error) {
      toast.error("Fehler beim Erstellen - LinkedIn-Beiträge konnten nicht erstellt werden.")
      return false
    } finally {
      // Reset progress states
      setGenerationProgress({
        progress: 0,
        currentPlatform: "",
        totalPlatforms: 0,
        completedPlatforms: 0,
      })
      setIsLoading(false)
    }
  }

  // === New: Single post generation per platform (via Edge Function helper) ===

  const generateSinglePost = async (
    content: string,
    platform: Platform,
    isRegeneration = false,
  ): Promise<string> => {
    if (!content.trim()) {
      toast.error('Bitte gib einen Text ein')
      throw new Error('Empty content')
    }

    if (!isRegeneration && !hasUsageRemaining()) {
      toast.error('Tageslimit erreicht. Upgrade für unbegrenzte Generierung.')
      throw new Error('Usage limit reached')
    }

    const current = generatedPosts[platform]
    const regenerationCount = current?.regenerationCount || 0
    const generationId = `${platform}-${Date.now()}`
    setActiveGenerations((prev) => new Set([...prev, generationId]))

    try {
      const prompt = buildSinglePostPrompt(
        content,
        platform,
        isRegeneration ? regenerationCount + 1 : undefined,
      )

      const maxTokens = platform === 'x' ? 1024 : 2048
      const temperature = isRegeneration ? 0.8 + regenerationCount * 0.05 : 0.7

      const response = await generateClaudeMessage({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'user', content: prompt },
        ],
      }, { timeout: 25000 })

  const raw = (response.content[0] as { text: string }).text
  const generatedPost = normalizeSinglePostResponse(raw, platform)

      // Validate and store
      validatePost(generatedPost, platform)

      setGeneratedPosts((prev) => ({
        ...prev,
        [platform]: {
          post: generatedPost,
          regenerationCount: isRegeneration ? regenerationCount + 1 : 0,
          isEdited: false,
        },
      }))

      if (!isRegeneration) {
        decrementUsage()
      }

      toast.success(`${platform.toUpperCase()} Post generiert!`)

      return generatedPost
    } catch (error: any) {
      let errorMessage = 'Generierung fehlgeschlagen. Bitte erneut versuchen.'
      const msg = error?.message || ''
      if (msg.includes('Usage limit') || msg.includes('limit')) {
        errorMessage = 'Tageslimit erreicht. Upgrade für unbegrenzte Posts.'
      } else if (msg.includes('429') || msg.toLowerCase().includes('rate')) {
        errorMessage = 'Zu viele Anfragen. Bitte 30 Sekunden warten.'
      } else if (error?.name === 'AbortError') {
        errorMessage = 'Anfrage-Timeout. Bitte versuche es erneut.'
      }
      toast.error(errorMessage)
      throw error
    } finally {
      setActiveGenerations((prev) => {
        const next = new Set(prev)
        next.delete(generationId)
        return next
      })
    }
  }

  const regeneratePost = async (content: string, platform: Platform) => {
    const current = generatedPosts[platform]
    if (current?.isEdited) {
      const proceed = window.confirm('Das Regenerieren überschreibt Ihre Änderungen. Fortfahren?')
      if (!proceed) return null
    }
    return generateSinglePost(content, platform, true)
  }

  const isGenerating = (platform: Platform) =>
    Array.from(activeGenerations).some((id) => id.startsWith(platform))

  const updatePost = (platform: Platform, index: number, content: string) => {
    setPostsByPlatform(prev => {
      const updated = { ...prev }
      updated[platform] = [...updated[platform]]
      updated[platform][index] = content
      return updated
    })
  }

  const clearPosts = () => {
    setPostsByPlatform({ linkedin: [], x: [], instagram: [] })
  }

  return {
    postsByPlatform,
    setPostsByPlatform,
    isLoading,
    generationProgress,
    generateContent,
    // New API
    generatedPosts,
    setGeneratedPosts,
    generateSinglePost,
    regeneratePost,
    isGenerating,
    updatePost,
    clearPosts,
  }
}