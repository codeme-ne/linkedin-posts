import React from 'react'
import { Button } from '../Button'
import { ButtonProps } from '../Button/Button.types'
import { InstagramLogo } from '../Icons/InstagramLogo'
import { useToast } from '../../../hooks/use-toast'

interface InstagramShareButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
  postContent?: string
}

export const InstagramShareButton: React.FC<InstagramShareButtonProps> = ({
  text = 'Auf Instagram teilen',
  postContent = '',
  onClick,
  ...props
}) => {
  const { toast } = useToast()
  const handleInstagramShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Strategy:
    // 1) Mobile: try native share (opens system sheet incl. Instagram)
    // 2) Mobile: deep link into Instagram app library as fallback
    // 3) Desktop: open web composer; copy caption for easy paste

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Opening /create/select directly can redirect to the @create profile when not logged in.
  // Use login with next param so users land in the composer after login.
  const webComposerUrl = 'https://www.instagram.com/accounts/login/?next=%2Fcreate%2Fselect%2F'

    const copyCaption = () => {
      if (postContent) {
        navigator.clipboard?.writeText(postContent).catch(() => {})
        // Small hint so the user knows to paste the copied caption
        toast({
          title: 'Text kopiert',
          description: 'Füge den Text in Instagram in das Beschreibungsfeld ein.',
        })
      }
    }

    const openWebComposer = () => {
      copyCaption()
  window.open(webComposerUrl, '_blank', 'noopener,noreferrer,width=1200,height=800')
    }

    const tryDeepLink = () => {
      // Copy caption then try opening Instagram app to library
      copyCaption()
      // Using location.href tends to work better for app deep links on mobile
      const deepLink = 'instagram://library'
      // Navigate away in the current tab; if it fails, fall back shortly after
      const fallback = setTimeout(() => {
        openWebComposer()
      }, 1200)
      const beforeUnload = () => clearTimeout(fallback)
      window.addEventListener('beforeunload', beforeUnload, { once: true })
      window.location.href = deepLink
    }

    type NavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string; title?: string }) => Promise<void> }
    const navWithShare = navigator as NavigatorWithShare

    if (isMobile && typeof navWithShare.share === 'function') {
      // Try native share first
      navWithShare
        .share({ text: postContent || '' })
        .catch(() => {
          // If user cancels or share not available, try deep link
          tryDeepLink()
        })
    } else if (isMobile) {
      tryDeepLink()
    } else {
      openWebComposer()
    }

    onClick?.(e)
  }

  return (
    <Button
      variant="instagram"
      leftIcon={<InstagramLogo size={16} className="text-white" />}
      onClick={handleInstagramShare}
      {...props}
    >
      {text}
    </Button>
  )
}

export default InstagramShareButton