'use client'

import React, { useEffect, useState } from 'react'
import {
  Header,
  Navigation,
  EmergencyContactItem,
  Alert,
  AuthGate,
} from '@/components'
import { EmergencyContact } from '@/types'
import { Plus } from 'lucide-react'
import { placeEmergencyCall } from '@/utils/call'

type ContactRecord = EmergencyContact & {
  status?: 'pending' | 'notified' | 'responded'
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [callStatus, setCallStatus] = useState<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  })
  const [addDraft, setAddDraft] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  })

  const fetchContacts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/contacts', { credentials: 'include' })
      if (!res.ok) {
        setContacts([])
        setIsLoading(false)
        return
      }

      const data = await res.json()
      const mapped: ContactRecord[] = (data.contacts || []).map((contact: any) => ({
        ...contact,
        email: contact.email || undefined,
        createdAt: new Date(contact.createdAt),
        status: 'pending',
      }))
      setContacts(mapped)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id)
    setEditDraft({
      name: contact.name,
      phone: contact.phone,
      email: contact.email ?? '',
      relationship: contact.relationship,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft({
      name: '',
      phone: '',
      email: '',
      relationship: '',
    })
  }

  const saveEdit = async () => {
    if (!editingId || !editDraft.name.trim() || !editDraft.phone.trim()) {
      setCallStatus({
        type: 'warning',
        title: 'Invalid Fields',
        message: 'Name and phone are required.',
      })
      return
    }

    try {
      const res = await fetch(`/api/contacts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editDraft.name.trim(),
          phone: editDraft.phone.trim(),
          email: editDraft.email.trim(),
          relationship: editDraft.relationship.trim(),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        setCallStatus({
          type: 'warning',
          title: 'Update Failed',
          message: error.error || 'Could not save this contact right now.',
        })
        return
      }

      setCallStatus({
        type: 'success',
        title: 'Contact Updated',
        message: `${editDraft.name} has been updated successfully.`,
      })

      await fetchContacts()
      cancelEdit()
    } catch (err) {
      setCallStatus({
        type: 'warning',
        title: 'Update Failed',
        message: 'Network error. Please try again.',
      })
    }
  }

  const addContact = async () => {
    if (!addDraft.name.trim() || !addDraft.phone.trim() || !addDraft.relationship.trim()) {
      return
    }

    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: addDraft.name.trim(),
        phone: addDraft.phone.trim(),
        email: addDraft.email.trim(),
        relationship: addDraft.relationship.trim(),
      }),
    })

    if (!res.ok) {
      setCallStatus({
        type: 'warning',
        title: 'Create failed',
        message: 'Could not add this contact right now.',
      })
      return
    }

    setShowAddForm(false)
    setAddDraft({ name: '', phone: '', email: '', relationship: '' })
    await fetchContacts()
  }

  const deleteContact = async (contactId: string) => {
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!res.ok) {
      setCallStatus({
        type: 'warning',
        title: 'Delete failed',
        message: 'Could not remove this contact right now.',
      })
      return
    }

    cancelEdit()
    await fetchContacts()
  }

  const handleCall = (contact: EmergencyContact) => {
    try {
      const result = placeEmergencyCall({
        name: contact.name,
        phone: contact.phone,
      })

      if (result.mode === 'dialer') {
        setCallStatus({
          type: 'success',
          title: `Calling ${contact.name}`,
          message: `Opening phone dialer for ${contact.phone}`,
        })
        return
      }

      setCallStatus({
        type: 'info',
        title: `Calling ${contact.name}`,
        message: 'Opening WhatsApp. Phone dialer unavailable.',
      })
    } catch {
      setCallStatus({
        type: 'warning',
        title: 'Cannot Place Call',
        message: `No valid phone number found for ${contact.name}.`,
      })
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <AuthGate>
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

      <div className="relative overflow-hidden px-safe-area py-6 space-y-4">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:
            'linear-gradient(rgba(255, 59, 48, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 59, 48, 0.35) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }} />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-danger/20 blur-3xl" />

        {callStatus && (
          <Alert
            type={callStatus.type}
            title={callStatus.title}
            message={callStatus.message}
            onClose={() => setCallStatus(null)}
          />
        )}

        {showAddForm && (
          <div className="card-base border border-border-color/80 space-y-3">
            <p className="text-caption text-text-secondary font-semibold">ADD NEW CONTACT</p>
            <input
              value={addDraft.name}
              onChange={(e) => setAddDraft((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
              placeholder="Name"
              autoFocus
            />
            <input
              value={addDraft.phone}
              onChange={(e) => setAddDraft((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
              placeholder="Phone"
            />
            <input
              value={addDraft.email}
              onChange={(e) => setAddDraft((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
              placeholder="Email (optional)"
            />
            <input
              value={addDraft.relationship}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, relationship: e.target.value }))
              }
              className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
              placeholder="Relationship"
            />
            <div className="flex gap-2">
              <button onClick={addContact} className="btn-primary flex-1 font-bold flex items-center justify-center gap-2">
                ✓ Save Contact
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 font-bold">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoading && (
            <div className="card-base text-text-secondary">Loading contacts...</div>
          )}

          {contacts.map((contact) => {
            const isEditing = editingId === contact.id

            if (isEditing) {
              return (
                <div
                  key={contact.id}
                  className="card-base relative bg-card-bg border border-border-color space-y-3"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-danger to-transparent" />
                  <p className="text-caption text-text-secondary font-semibold">
                    EDIT CONTACT
                  </p>

                  <div className="space-y-2">
                    <label className="text-caption text-text-secondary">Name</label>
                    <input
                      value={editDraft.name}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
                      placeholder="Contact name"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption text-text-secondary">Phone</label>
                    <input
                      value={editDraft.phone}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption text-text-secondary">Email</label>
                    <input
                      value={editDraft.email}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
                      placeholder="Email (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption text-text-secondary">Relationship</label>
                    <input
                      value={editDraft.relationship}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, relationship: e.target.value }))
                      }
                      className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-danger"
                      placeholder="Relationship"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={saveEdit} 
                      className="btn-primary flex-1 font-bold flex items-center justify-center gap-2"
                    >
                      ✓ Save Changes
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="btn-secondary flex-1 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="btn-ghost w-full text-accent-danger hover:bg-accent-danger/10 font-semibold"
                  >
                    🗑️ Delete Contact
                  </button>
                </div>
              )
            }

            return (
              <EmergencyContactItem
                key={contact.id}
                contact={contact}
                onCall={() => handleCall(contact)}
                onEdit={() => startEdit(contact)}
              />
            )
          })}
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

      <Navigation onLogout={handleLogout} />
    </AuthGate>
  )
}
