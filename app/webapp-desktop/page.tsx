'use client'

import React, { useMemo, useState } from 'react'
import { Header, Alert } from '@/components'
import { EmergencyContact } from '@/types'
import { Phone, Sparkles, ShieldCheck } from 'lucide-react'
import { placeEmergencyCall } from '@/utils/call'

const contacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    phone: '+1-555-0123',
    email: 'sarah@example.com',
    relationship: 'Sister',
    priority: 1,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Mom',
    phone: '+1-555-0456',
    email: 'mom@example.com',
    relationship: 'Mother',
    priority: 2,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Best Friend Alex',
    phone: '+1-555-0789',
    email: 'alex@example.com',
    relationship: 'Friend',
    priority: 3,
    isVerified: false,
    createdAt: new Date(),
  },
]

export default function DesktopWebAppPage() {
  const [callState, setCallState] = useState<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => a.priority - b.priority),
    []
  )

  const onCall = (contact: EmergencyContact) => {
    try {
      const result = placeEmergencyCall({ name: contact.name, phone: contact.phone })

      setCallState({
        type: 'info',
        title: `Calling ${contact.name}`,
        message:
          result.mode === 'dialer'
            ? `Opening phone dialer for ${contact.phone}`
            : 'Opening WhatsApp. Phone dialer unavailable.',
      })
    } catch {
      setCallState({
        type: 'warning',
        title: 'Cannot Place Call',
        message: `No valid phone number found for ${contact.name}.`,
      })
    }
  }

  return (
    <>
      <Header
        title="SafeSpace Call Web App"
        subtitle="Desktop complete page with phone-first emergency calling"
      />

      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-danger/10 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 59, 48, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 59, 48, 0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-8 space-y-6">
          {callState && (
            <Alert
              type={callState.type}
              title={callState.title}
              message={callState.message}
              onClose={() => setCallState(null)}
            />
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-base border border-border-color/70">
              <p className="text-caption text-text-secondary">APP MODE</p>
              <p className="text-header-lg mt-2">Desktop Complete</p>
            </div>
            <div className="card-base border border-border-color/70">
              <p className="text-caption text-text-secondary">CALL STRATEGY</p>
              <p className="text-header-lg mt-2">Phone First</p>
            </div>
            <div className="card-base border border-border-color/70">
              <p className="text-caption text-text-secondary">FALLBACK</p>
              <p className="text-header-lg mt-2">Instant Web Call</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedContacts.map((contact) => (
              <article
                key={contact.id}
                className="card-base relative overflow-hidden border border-border-color/80 hover:border-accent-danger/50 transition-all"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-danger to-transparent" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-header-lg">{contact.name}</h3>
                    <p className="text-body-sm text-text-secondary">{contact.relationship}</p>
                  </div>
                  {contact.isVerified ? (
                    <ShieldCheck className="w-5 h-5 text-accent-safe" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-accent-caution" />
                  )}
                </div>

                <p className="text-body-sm text-text-secondary mb-2">{contact.phone}</p>
                <p className="text-body-sm text-text-secondary mb-5">{contact.email || 'No email'}</p>

                <button
                  onClick={() => onCall(contact)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
