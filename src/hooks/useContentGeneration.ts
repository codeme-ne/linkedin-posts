import { useState } from 'react'
import { toast } from 'sonner'
import { linkedInPostsFromNewsletter, xTweetsFromBlog, instagramPostsFromBlog } from '@/api/claude'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import type { Platform } from '@/config/platforms'
import { PLATFORM_LABEL } from '@/config/platforms'

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
  const [isLoading, setIsLoading] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    progress: 0,
    currentPlatform: "",
    totalPlatforms: 0,
    completedPlatforms: 0,
  })

  const { canTransform, incrementUsage } = useUsageTracking()

  const generateContent = async (inputText: string, selectedPlatforms: Platform[]) => {
    if (!inputText.trim()) {
      toast.error("Bitte gib einen Text ein")
      return false
    }

    if (!canTransform) {
      toast.error("Maximale Anzahl an Transformationen erreicht")
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

          // Increment usage for each successful platform
          incrementUsage()
        } catch (platformError) {
          console.error(`Error generating ${platform} posts:`, platformError)
          toast.error(`Fehler bei ${platformName}: ${platformError instanceof Error ? platformError.message : String(platformError)}`)
        }
      }

      setPostsByPlatform(prev => ({ ...prev, ...newPosts }))
      
      const names = selectedPlatforms.map(p => PLATFORM_LABEL[p]).join(', ')
      toast.success(`Beiträge erstellt! Generiert für: ${names}`)
      
      return true
    } catch (error) {
      console.error("Generation error:", error)
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
    isLoading,
    generationProgress,
    generateContent,
    updatePost,
    clearPosts,
  }
}