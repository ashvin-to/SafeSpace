'use client'

import React, { useState, useMemo } from 'react'
import { EmergencyContact } from '@/types'
import { Phone, Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { formatTime } from '@/utils/helpers'

interface EmergencyContactItemProps {
  contact: EmergencyContact & {
    status?: 'pending' | 'notified' | 'responded'
    notifiedAt?: Date
    response?: string
  }
  isActive?: boolean
  onCall?: () => void
  onEdit?: () => void
}

export function EmergencyContactItem({
  contact,
  isActive = false,
  onCall,
  onEdit,
}: EmergencyContactItemProps) {
  const statusIcon = useMemo(() => {
    switch (contact.status) {
      case 'notified':
        return <Clock className="w-5 h-5 text-accent-caution" />
      case 'responded':
        return <CheckCircle className="w-5 h-5 text-accent-safe" />
      default:
        return null
    }
  }, [contact.status])

  const statusText = useMemo(() => {
    switch (contact.status) {
      case 'notified':
        return `Notified (${contact.notifiedAt ? formatTime(contact.notifiedAt) : 'pending'})`
      case 'responded':
        return `Respoding: "${contact.response}"`
      default:
        return 'Not yet contacted'
    }
  }, [contact.status, contact.notifiedAt, contact.response])

  return (
    <div
      className={`card-base ${
        isActive ? 'ring-2 ring-accent-danger' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card-bg flex items-center justify-center">
            <span className="font-bold text-accent-danger">
              {contact.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{contact.name}</h3>
            <p className="text-caption text-text-secondary">
              {contact.relationship}
            </p>
          </div>
        </div>
        {statusIcon && statusIcon}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3 text-body-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Phone className="w-4 h-4" />
          <a href={`tel:${contact.phone}`} className="hover:text-text-primary">
            {contact.phone}
          </a>
        </div>
        {contact.email && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Mail className="w-4 h-4" />
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-text-primary"
            >
              {contact.email}
            </a>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-background rounded-btn px-3 py-2 mb-3">
        <p className="text-caption text-text-secondary">{statusText}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onCall} className="btn-primary flex-1">
          Call
        </button>
        <button onClick={onEdit} className="btn-secondary flex-1">
          Edit
        </button>
      </div>

      {/* Verification Badge */}
      {contact.isVerified && (
        <div className="mt-3 flex items-center gap-2 text-caption text-accent-safe">
          <CheckCircle className="w-4 h-4" />
          Verified Contact
        </div>
      )}
    </div>
  )
}

export default EmergencyContactItem
