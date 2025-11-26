import { useState } from 'react'
import { toast } from 'sonner'
import { extractFromUrl } from '@/api/extract'

interface ExtractionResult {
  title: string
  content: string
}

interface ExtractionUsage {
  used: number
  limit: number
  remaining: number
}

/**
 * Request deduplication cache with TTL.
 *
 * Prevents duplicate API calls to Jina/Firecrawl when users spam the extract button.
 * Cache key format: `${url}:${isPremium}`
 * TTL: 5 minutes
 * Max entries: 100 (with automatic cleanup of expired entries)
 */
const extractionCache = new Map<string, {
  result: ExtractionResult
  timestamp: number
}>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const useUrlExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionUsage, setExtractionUsage] = useState<ExtractionUsage | null>(null)

  const extractContent = async (sourceUrl: string, usePremiumExtraction: boolean, isPro: boolean = false): Promise<ExtractionResult | null> => {
    if (!sourceUrl.trim()) return null

    // Check cache first
    const cacheKey = `${sourceUrl}:${usePremiumExtraction && isPro}`
    const cached = extractionCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      toast.info('Cached result returned')
      return cached.result
    }

    setIsExtracting(true)

    try {
      let result: ExtractionResult

      if (usePremiumExtraction && isPro) {
        // Premium extraction with Firecrawl
        const response = await fetch('/api/extract-premium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: sourceUrl }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.usage) {
            setExtractionUsage(data.usage)
          }
          throw new Error(data.error || "Premium-Extraktion fehlgeschlagen")
        }

        result = {
          title: data.title,
          content: data.markdown || data.content || "",
        }

        // Update usage information
        if (data.usage) {
          setExtractionUsage(data.usage)
          toast.success(`Premium-Import erfolgreich ✨ - ${data.usage.remaining} von ${data.usage.limit} Premium-Extraktionen übrig diesen Monat`)
        } else {
          toast.success(`Premium-Import erfolgreich ✨ - ${data.title || "Inhalt wurde mit verbesserter Qualität importiert"}`)
        }
      } else {
        // Standard extraction with Jina
        const extractResult = await extractFromUrl(sourceUrl)
        result = {
          title: extractResult.title || "",  // Don't default to "Ohne Titel"
          content: extractResult.content || ""
        }
        toast.success(`Inhalt importiert - ${extractResult.title || sourceUrl}`)
      }

      // Cache the successful result
      extractionCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })

      // Clean up old cache entries if cache grows too large
      if (extractionCache.size > 100) {
        const now = Date.now()
        for (const [key, value] of extractionCache) {
          if (now - value.timestamp > CACHE_TTL) {
            extractionCache.delete(key)
          }
        }
      }

      return result
    } catch (e) {
      toast.error(`Import fehlgeschlagen - ${e instanceof Error ? e.message : String(e)}`)
      return null
    } finally {
      setIsExtracting(false)
    }
  }

  return {
    isExtracting,
    extractionUsage,
    extractContent,
    setExtractionUsage
  }
}