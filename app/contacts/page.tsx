'use client'

import React, { useState } from 'react'
import {
  Header,
  Navigation,
  EmergencyContactItem,
  Alert,
} from '@/components'
import { EmergencyContact } from '@/types'
import { Plus } from 'lucide-react'

const mockContacts: (EmergencyContact & { status?: 'pending' | 'notified' | 'responded' })[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    phone: '+1-555-0123',
    email: 'sarah@example.com',
    relationship: 'Sister',
    priority: 1,
    isVerified: true,
    createdAt: new Date(),
    status: 'pending',
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
    status: 'pending',
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
    status: 'pending',
  },
]

export default function ContactsPage() {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <>
      <Header
        title="Emergency Contacts"
        subtitle="People to notify in emergencies"
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-10 h-10 rounded-btn bg-accent-danger flex items-center justify-center hover:brightness-110"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-safe-area py-6 space-y-4">
        {showAddForm && (
          <Alert
            type="info"
            title="Add New Contact"
            message="Feature coming soon: Contact form will appear here"
            onClose={() => setShowAddForm(false)}
          />
        )}

        <div className="space-y-4">
          {mockContacts.map((contact) => (
            <EmergencyContactItem
              key={contact.id}
              contact={contact}
              onCall={() => {
                // In real app, initiate call
                console.log(`Calling ${contact.name}`)
              }}
              onEdit={() => {
                // In real app, open edit modal
                console.log(`Editing ${contact.name}`)
              }}
            />
          ))}
        </div>

        {/* Info Card */}
        <div className="card-base bg-card-bg border border-border-color">
          <p className="text-caption text-text-secondary font-semibold mb-3">
            TIPS FOR EMERGENCY CONTACTS
          </p>
          <ul className="space-y-2 text-body-sm text-text-secondary">
            <li>✓ Choose people you trust completely</li>
            <li>✓ Prioritize contacts that are reachable 24/7</li>
            <li>✓ Verify phone numbers are correct</li>
            <li>✓ Consider adding backup contacts</li>
            <li>✓ Update contacts if they move or change numbers</li>
          </ul>
        </div>
      </div>

      <Navigation />
    </>
  )
}
