'use client'

import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface SOSButtonProps {
  onTrigger: () => void
  isActive?: boolean
  size?: 'default' | 'small'
}

export function SOSButton({
  onTrigger,
  isActive = false,
  size = 'default',
}: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    setIsPressed(true)
    onTrigger()
    // Reset feedback after animation
    setTimeout(() => setIsPressed(false), 200)
  }

  const sizeClass = size === 'small' ? 'btn-sos-mini' : 'btn-sos'
  const animationClass = isActive ? 'animate-pulse-sos' : ''
  const pressedClass = isPressed ? 'scale-90' : ''

  return (
    <button
      onClick={handleClick}
      className={`${sizeClass} ${animationClass} ${pressedClass} ${
        isActive ? 'ring-4 ring-accent-danger ring-opacity-50' : ''
      }`}
      title="Emergency SOS - Single tap triggers emergency protocol"
      aria-label="Emergency SOS Button"
      aria-pressed={isActive}
    >
      <span className="text-2xl font-bold">SOS</span>
      <span className="text-xs font-semibold">Help!</span>
    </button>
  )
}

export default SOSButton
