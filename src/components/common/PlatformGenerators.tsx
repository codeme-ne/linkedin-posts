import { useMemo, memo, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useContentGeneration } from '@/hooks/useContentGeneration'
import type { Platform } from '@/config/platforms'
import config from '@/config/app.config'
import { cn } from '@/lib/utils'

interface PlatformGeneratorsProps {
  content: string
  onPostGenerated?: (platform: Platform, post: string) => void
}

export function PlatformGenerators({ content, onPostGenerated }: PlatformGeneratorsProps) {
  const {
    generatedPosts,
    generateSinglePost,
    regeneratePost,
    isGenerating,
    setGeneratedPosts,
  } = useContentGeneration()

  const platforms = useMemo(() => (
    [
      { key: 'linkedin', name: 'LinkedIn', icon: '💼', variant: 'linkedin' as const },
      { key: 'x', name: 'X', icon: '🐦', variant: 'x' as const },
      { key: 'instagram', name: 'Instagram', icon: '📸', variant: 'instagram' as const },
    ]
  ), [])

  const handleGenerate = async (platform: Platform) => {
    if (!content.trim()) return
    try {
      const post = await generateSinglePost(content, platform)
      onPostGenerated?.(platform, post)
    } catch (error) {
      console.error(`Generation failed for ${platform}:`, error)
    }
  }

  const handleRegenerate = async (platform: Platform) => {
    try {
      const post = await regeneratePost(content, platform)
      if (post) onPostGenerated?.(platform, post)
    } catch (error) {
      console.error(`Regeneration failed for ${platform}:`, error)
    }
  }

  const handlePostEdit = (platform: Platform, newPost: string) => {
    setGeneratedPosts((prev) => ({
      ...prev,
      [platform]: {
        ...(prev[platform] || { post: '', regenerationCount: 0, isEdited: false }),
        post: newPost,
        isEdited: true,
      },
    }))
  }

  if (!content.trim()) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Gib zuerst deinen Newsletter/Blog-Inhalt ein
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Beiträge generieren</h3>

      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map(({ key, name, icon, variant }) => {
          const k = key as Platform
          const currentPost = generatedPosts[k]
          const hasPost = !!currentPost?.post
          const loading = isGenerating(k)

          const limit = config.limits.maxPostLength[k]
          const isOverLimit = currentPost ? currentPost.post.length > limit : false
          const isNearLimit = currentPost ? currentPost.post.length > limit * 0.9 : false

          const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
            // Ctrl/Cmd + Enter: Copy to clipboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault()
              if (currentPost?.post) {
                navigator.clipboard.writeText(currentPost.post)
                toast.success('In Zwischenablage kopiert')
              }
            }
            // Escape: Clear post with confirmation
            if (e.key === 'Escape') {
              e.preventDefault()
              if (currentPost?.post && confirm('Post-Inhalt löschen?')) {
                handlePostEdit(k, '')
              }
            }
          }

          return (
            <div key={key} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>{icon}</span>
                  <span className="font-medium">{name}</span>
                  {currentPost?.regenerationCount ? (
                    <span className="text-xs bg-accent/20 px-2 py-1 rounded">
                      v{currentPost.regenerationCount + 1}
                    </span>
                  ) : null}
                </div>
              </div>

              <Button
                onClick={() => (hasPost ? handleRegenerate(k) : handleGenerate(k))}
                isLoading={loading}
                variant={variant}
                fullWidth
                disabled={loading || (hasPost && isOverLimit)}
              >
                {hasPost ? '🔄 Neu generieren' : '✨ Generieren'}
              </Button>

              {hasPost && (
                <div className="space-y-2">
                  <textarea
                    value={currentPost!.post}
                    onChange={(e) => handlePostEdit(k, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "w-full p-3 border rounded-md text-sm resize-none bg-background",
                      isOverLimit && "border-red-500 focus:ring-red-500"
                    )}
                    rows={6}
                    placeholder={`${name} Post...`}
                    maxLength={limit + 100} // Soft limit to allow some overflow for editing
                    title="Shortcuts: Ctrl+Enter = Kopieren, Esc = Löschen"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex gap-2">
                      {currentPost!.isEdited && '✏️ Bearbeitet'}
                      <span className="hidden sm:inline opacity-60">
                        Ctrl+↵ Kopieren · Esc Löschen
                      </span>
                    </span>
                    <span className={cn(
                      isOverLimit ? "text-red-500 font-semibold" :
                      isNearLimit ? "text-yellow-600" :
                      "text-muted-foreground"
                    )}>
                      {currentPost!.post.length}/{limit}
                    </span>
                  </div>
                  {isOverLimit && (
                    <p className="text-xs text-red-500">
                      ⚠️ Zeichenlimit überschritten ({limit} max)
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(currentPost!.post)
                        toast.success('Beitrag in Zwischenablage kopiert.')
                      }}
                      aria-label="In Zwischenablage kopieren"
                      title="In Zwischenablage kopieren"
                    >
                      📋 Kopieren
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(PlatformGenerators)
