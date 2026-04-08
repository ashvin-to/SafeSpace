'use client'

import React, { useState } from 'react'
import { Header, Alert, Navigation } from '@/components'
import { EmergencyContact } from '@/types'
import { Phone, ShieldCheck } from 'lucide-react'
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

export default function MobileWebAppPage() {
  const [callState, setCallState] = useState<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)

  const onCall = (contact: EmergencyContact) => {
    try {
      const result = placeEmergencyCall({ name: contact.name, phone: contact.phone })

      setCallState({
        type: 'info',
        title: `Calling ${contact.name}`,
        message:
          result.mode === 'dialer'
            ? `Dialer opened for ${contact.phone}`
            : 'Opening WhatsApp now.',
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
        title="SafeSpace Mobile Web App"
        subtitle="Mobile browser version with one-tap emergency calling"
      />

      <main className="relative overflow-hidden px-safe-area py-6 space-y-4">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:
            'linear-gradient(rgba(255, 59, 48, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 59, 48, 0.28) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }} />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-danger/20 blur-3xl" />

        {callState && (
          <Alert
            type={callState.type}
            title={callState.title}
            message={callState.message}
            onClose={() => setCallState(null)}
          />
        )}

        <section className="relative card-base border border-border-color/80">
          <p className="text-caption text-text-secondary">MOBILE CALL MODE</p>
          <p className="text-body-base mt-2 text-text-secondary">
            If phone dialer is available, it calls via your phone. If not available, it starts an instant web call immediately.
          </p>
        </section>

        <section className="space-y-3">
          {contacts.map((contact) => (
            <article
              key={contact.id}
              className="card-base relative border border-border-color/80"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-danger to-transparent" />

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-body-sm text-text-secondary">{contact.relationship}</p>
                </div>
                {contact.isVerified && <ShieldCheck className="w-5 h-5 text-accent-safe" />}
              </div>

              <p className="text-body-sm text-text-secondary mb-4">{contact.phone}</p>

              <button
                onClick={() => onCall(contact)}
                className="btn-primary w-full h-12 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Immediately
              </button>
            </article>
          ))}
        </section>
      </main>

      <Navigation />
    </>
  )
}
