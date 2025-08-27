import React from 'react'

type InstagramLogoProps = {
  size?: number
  className?: string
}

// Simple Instagram glyph: pink rounded square with white camera outline
export const InstagramLogo: React.FC<InstagramLogoProps> = ({ size = 16, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    {/* Background */}
    <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="#e706ab" />
    {/* Camera outline */}
    <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" strokeWidth="2" />
    {/* Lens */}
    <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2" />
    {/* Flash dot */}
    <circle cx="17.2" cy="6.8" r="1.4" fill="white" />
  </svg>
)

export default InstagramLogo
