'use client'

import React, { useState, useEffect } from 'react'
import {
  RiskScoreCard,
  RouteCard,
  EmergencyContactItem,
  SOSButton,
  Header,
  Alert,
  Navigation,
  AuthGate,
} from '@/components'
import {
  useRiskScore,
  useEmergencySession,
  useGeolocation,
  useNotifications,
} from '@/hooks'
import { SafeRoute, EmergencyContact } from '@/types'
import { MapPin } from 'lucide-react'
import { placeEmergencyCall } from '@/utils/call'

// Mock routes data
const mockRoutes: SafeRoute[] = [
  {
    id: '1',
    origin: { latitude: 40.7128, longitude: -74.006, accuracy: 5, timestamp: new Date() },
    destination: { latitude: 40.7489, longitude: -73.968, accuracy: 5, timestamp: new Date() },
    distance: 2.1,
    estimatedDuration: 28,
    riskScore: 34,
    features: ['well_lit', 'camera_coverage', 'high_footfall'],
    polyline: 'mock_polyline_1',
  },
  {
    id: '2',
    origin: { latitude: 40.7128, longitude: -74.006, accuracy: 5, timestamp: new Date() },
    destination: { latitude: 40.7489, longitude: -73.968, accuracy: 5, timestamp: new Date() },
    distance: 2.3,
    estimatedDuration: 35,
    riskScore: 56,
    features: ['police_presence', 'mid_footfall'],
    polyline: 'mock_polyline_2',
  },
]

export default function Dashboard() {
  const { location, error: locationError } = useGeolocation()
  const { riskScore, isLoading: riskLoading } = useRiskScore(location, 60000)
  const { isActive, triggerSOS, cancelSOS, notifiedContacts, addNotifiedContact } =
    useEmergencySession()
  const { notifications, addNotification, removeNotification } = useNotifications()
  
  // Fetch real contacts from API
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [contactsLoading, setContactsLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setContactsLoading(true)
        const response = await fetch('/api/contacts', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setContacts(data.contacts || [])
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        setContactsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  // Handle SOS trigger
  const handleSOSTrigger = () => {
    triggerSOS()
    addNotification(
      '🚨 Emergency Mode Active',
      'Your emergency contacts have been notified. Your location is being shared in real-time.',
      'SOS'
    )

    // Immediately call the highest priority contact
    if (contacts.length > 0) {
      const primaryContact = contacts[0]
      setTimeout(() => {
        addNotification(
          `Calling ${primaryContact.name}`,
          `Initiating emergency call...`,
          'INFO'
        )
        
        try {
          const result = placeEmergencyCall({
            name: primaryContact.name,
            phone: primaryContact.phone,
          })
          
          addNotification(
            `${primaryContact.name} dial initiated`,
            result.mode === 'dialer'
              ? `Opening phone dialer for ${primaryContact.phone}`
              : 'Opening WhatsApp. Phone dialer unavailable.',
            'INFO'
          )
        } catch (error) {
          addNotification(
            'Call Failed',
            `Could not call ${primaryContact.name}`,
            'WARNING'
          )
        }
      }, 500)
    }

    // Simulate notifying other contacts
    contacts.forEach((contact, idx) => {
      setTimeout(() => {
        addNotifiedContact(contact.id)
        if (idx > 0) { // Notify about secondary contacts
          addNotification(
            `Notified ${contact.name}`,
            `Contact marked as notified`,
            'INFO'
          )
        }
      }, 500 + idx * 200)
    })
  }

  const handleNavigate = (route: SafeRoute) => {
    addNotification(
      '📍 Navigation Started',
      `Navigating via ${route.distance.toFixed(1)}km route`,
      'INFO'
    )
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <AuthGate>
      {/* Header */}
      <Header
        title="SafeSpace AI"
        subtitle="Live safety dashboard"
      />

      {/* Main Content */}
      <div className="px-safe-area py-4 lg:py-5 space-y-4">

        <section className="card-base border border-border-color/80 relative overflow-hidden py-4">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-danger to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption text-text-secondary">LIVE SAFETY STATUS</p>
            <p className="text-body-sm text-text-secondary">SOS ready</p>
          </div>
        </section>

        {/* Location Error Alert */}
        {locationError && (
          <Alert
            type="warning"
            title="Location Access"
            message={locationError}
            onClose={() => {}}
          />
        )}

        {/* Emergency Active Alert */}
        {isActive && (
          <Alert
            type="error"
            title="🔴 Emergency Mode Active"
            message={`${notifiedContacts.length} emergency contact(s) notified. Your location is being shared in real-time.`}
            onClose={cancelSOS}
          />
        )}

        <div className="page-grid">
          <div className="page-grid-main">
            {/* Risk Score Card */}
            <RiskScoreCard riskScore={riskScore} isLoading={riskLoading} />

            {/* Safe Routes */}
            <div>
              <h2 className="text-header-lg mb-4">Safe Route Options</h2>
              <div className="space-y-4">
                {mockRoutes.map((route, idx) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isRecommended={idx === 0}
                    onStartNavigation={() => handleNavigate(route)}
                  />
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h2 className="text-header-lg mb-4">Emergency Contacts</h2>
              {contactsLoading ? (
                <div className="card-base">
                  <p className="text-text-secondary">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="card-base">
                  <p className="text-text-secondary">No emergency contacts added yet. Go to the Contacts page to add one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <EmergencyContactItem
                      key={contact.id}
                      contact={contact}
                      isActive={isActive}
                      onCall={() => {
                        try {
                          const result = placeEmergencyCall({
                            name: contact.name,
                            phone: contact.phone,
                          })

                          addNotification(
                            `Calling ${contact.name}`,
                            result.mode === 'dialer'
                              ? `Opening phone dialer for ${contact.phone}`
                              : 'Opening WhatsApp. Phone dialer unavailable.',
                            'INFO'
                          )
                        } catch {
                          addNotification(
                            'Call Failed',
                            `No valid phone number found for ${contact.name}`,
                            'WARNING'
                          )
                        }
                      }}
                      onEdit={() =>
                        addNotification(
                          'Edit Contact',
                          `Opening edit dialog for ${contact.name}`,
                          'INFO'
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="page-grid-side">
            {/* Current Location */}
            {location && (
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-text-secondary" />
                  <p className="text-caption text-text-secondary">CURRENT LOCATION</p>
                </div>
                <p className="text-body-base">
                  ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </p>
                <p className="text-body-sm text-text-secondary mt-2">
                  Accuracy: ±{location.accuracy.toFixed(0)}m
                </p>
              </div>
            )}

            {/* Safety Coverage */}
            <div className="card-base">
              <p className="text-caption text-text-secondary mb-2">SAFETY COVERAGE</p>
              <div className="space-y-1 text-body-sm text-text-secondary">
                <p>Women: proactive alerts and escalation.</p>
                <p>Children: guardian check-ins and SOS.</p>
                <p>Tourists: route risk guidance.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
              <div className="card-base">
                <p className="text-caption text-text-secondary mb-2">ROUTES AVAILABLE</p>
                <p className="text-3xl font-bold text-accent-safe">{mockRoutes.length}</p>
              </div>
              <div className="card-base">
                <p className="text-caption text-text-secondary mb-2">TRUSTED CONTACTS</p>
                <p className="text-3xl font-bold text-accent-safe">{contacts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Button (Floating) */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
        <SOSButton onTrigger={handleSOSTrigger} isActive={isActive} />
      </div>

      {/* Navigation */}
      <Navigation onLogout={handleLogout} />

      {/* Notifications - Temporary (top center) */}
      <div className="fixed top-20 left-0 right-0 px-safe-area pt-2 z-40 pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="card-base mb-3 pointer-events-auto cursor-pointer hover:brightness-110 transition-all max-w-xl ml-auto"
            onClick={() => removeNotification(notif.id)}
          >
            <p className="text-caption font-semibold text-accent-danger">
              {notif.title}
            </p>
            <p className="text-body-sm text-text-secondary">{notif.message}</p>
          </div>
        ))}
      </div>
    </AuthGate>
  )
}
