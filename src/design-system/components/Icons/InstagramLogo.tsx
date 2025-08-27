import React from 'react'

type InstagramLogoProps = {
  size?: number
  className?: string
}

// Instagram glyph in Lucide-like style: strokes only, no internal fill/background.
export const InstagramLogo: React.FC<InstagramLogoProps> = ({ size = 16, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Outer rounded square (camera body) */}
    <rect x="2" y="2" width="20" height="20" rx="5" />
    {/* Lens */}
    <circle cx="12" cy="12" r="4" />
    {/* Flash dot */}
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
)

export default InstagramLogo
