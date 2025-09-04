import React from 'react'
import { Linkedin } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface LinkedInShareButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
  postContent?: string
}

export const LinkedInShareButton: React.FC<LinkedInShareButtonProps> = ({ 
  text = 'Auf LinkedIn teilen',
  postContent = '',
  onClick,
  ...props 
}) => {
  const handleLinkedInShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (postContent) {
      const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postContent)}`
      window.open(linkedInUrl, '_blank', 'width=600,height=600')
    }
    onClick?.(e)
  }

  return (
    <Button
      variant="linkedin"
      leftIcon={<Linkedin size={16} />}
      onClick={handleLinkedInShare}
      {...props}
    >
      {text}
    </Button>
  )
}