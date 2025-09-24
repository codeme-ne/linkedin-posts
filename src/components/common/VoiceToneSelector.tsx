/**
 * Voice Tone Selector Modal - Premium Style Selection Interface
 * Matches EasyGen's sophisticated tone selection experience
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VOICE_TONES, type VoiceTone, DEFAULT_VOICE_TONE } from '@/config/voice-tones'
import { cn } from '@/lib/utils'

interface VoiceToneSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTone: (tone: VoiceTone) => void
  currentTone?: VoiceTone
}

export function VoiceToneSelector({
  isOpen,
  onClose,
  onSelectTone,
  currentTone = DEFAULT_VOICE_TONE
}: VoiceToneSelectorProps) {
  const [selectedTone, setSelectedTone] = useState<VoiceTone>(currentTone)

  const handleApplyTone = () => {
    onSelectTone(selectedTone)
    onClose()
  }

  const handleToneSelect = (tone: VoiceTone) => {
    setSelectedTone(tone)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Select Voice Tone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2">
          {/* Selected Tone Display */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{selectedTone.emoji}</span>
              <h3 className="text-lg font-medium">{selectedTone.name}</h3>
            </div>
          </div>

          {/* Tone Icon Selector */}
          <div className="flex justify-center">
            <div className="flex gap-3 p-2 bg-muted/30 rounded-lg">
              {VOICE_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleToneSelect(tone)}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-200 hover:scale-110",
                    "border-2 flex items-center justify-center",
                    selectedTone.id === tone.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                  )}
                  aria-label={`Select ${tone.name} tone`}
                >
                  <span className="text-xl">{tone.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Description */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300",
            selectedTone.bgColor
          )}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedTone.description}
              </p>

              {/* Tone Characteristics */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Writing Style:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTone.characteristics.map((characteristic, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-background/80 text-muted-foreground"
                    >
                      {characteristic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyTone}
              className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Apply Tone
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Voice Tone Trigger Button - Shows current selected tone
 */
interface VoiceToneTriggerProps {
  currentTone: VoiceTone
  onClick: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function VoiceToneTrigger({
  currentTone,
  onClick,
  disabled = false,
  size = 'md'
}: VoiceToneTriggerProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-2 font-medium transition-all duration-200",
        "hover:shadow-sm hover:border-primary/50",
        "focus:ring-2 focus:ring-primary/20",
        sizeClasses[size]
      )}
    >
      <span className="text-lg">{currentTone.emoji}</span>
      <span className="hidden sm:inline">{currentTone.name}</span>
      <span className="sm:hidden">Style</span>
    </Button>
  )
}