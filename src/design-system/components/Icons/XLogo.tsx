import React from 'react'

type XLogoProps = {
  size?: number
  className?: string
}

// Simple X/Twitter-inspired logo rendered in solid color (uses currentColor)
export const XLogo: React.FC<XLogoProps> = ({ size = 16, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
  {/* White X shape; use currentColor so parent can control (we pass text-white) */}
  <path d="M3.5 3.5h4L13 10l5.5-6.5h2L14.5 12l6.5 8.5h-4L12 14l-6 6.5h-2L9.5 12 3.5 3.5z" fill="currentColor" />
  </svg>
)

export default XLogo
