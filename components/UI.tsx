'use client'

import React from 'react'
import { X } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="bg-card-bg/95 border-b border-border-color backdrop-blur-sm">
      <div className="app-shell px-safe-area py-4 lg:py-5 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-header-lg">{title}</h1>
          {subtitle && (
            <p className="text-body-sm text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  )
}

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose?: () => void
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const bgColor = {
    success: 'bg-accent-safe bg-opacity-10',
    error: 'bg-accent-danger bg-opacity-10',
    warning: 'bg-accent-caution bg-opacity-10',
    info: 'bg-card-bg',
  }[type]

  const borderColor = {
    success: 'border-accent-safe',
    error: 'border-accent-danger',
    warning: 'border-accent-caution',
    info: 'border-border-color',
  }[type]

  const textColor = {
    success: 'text-accent-safe',
    error: 'text-accent-danger',
    warning: 'text-accent-caution',
    info: 'text-text-primary',
  }[type]

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-card p-4 flex items-start gap-3`}
    >
      <div className="flex-1">
        <h3 className={`font-semibold ${textColor}`}>{title}</h3>
        <p className="text-body-sm text-text-secondary mt-1">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-border-color border-t-accent-danger rounded-full animate-spin" />
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: any
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-text-secondary mb-4 opacity-50" />}
      <h3 className="text-header-lg mb-2">{title}</h3>
      <p className="text-body-sm text-text-secondary">{description}</p>
    </div>
  )
}

export default { Header, Alert, LoadingSpinner, EmptyState }
