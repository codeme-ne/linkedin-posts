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

export const useUrlExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionUsage, setExtractionUsage] = useState<ExtractionUsage | null>(null)

  const extractContent = async (sourceUrl: string, usePremiumExtraction: boolean, isPro: boolean = false): Promise<ExtractionResult | null> => {
    if (!sourceUrl.trim()) return null

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
          title: extractResult.title || "Ohne Titel",
          content: extractResult.content || ""
        }
        toast.success(`Inhalt importiert - ${result.title || sourceUrl}`)
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