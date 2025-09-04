import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { XLogo } from '../Icons/XLogo'

interface XShareButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
  tweetContent?: string
}

export const XShareButton: React.FC<XShareButtonProps> = ({
  text = 'Auf X teilen',
  tweetContent = '',
  onClick,
  ...props
}) => {
  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (tweetContent) {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`
      window.open(url, '_blank', 'width=600,height=600')
    }
    onClick?.(e)
  }

  return (
    <Button
      variant="x"
      leftIcon={<XLogo size={16} className="text-white" />}
      onClick={handleShare}
      {...props}
    >
      {text}
    </Button>
  )
}

export default XShareButton
