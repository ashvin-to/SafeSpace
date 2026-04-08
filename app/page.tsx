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
} from '@/components'
import {
  useRiskScore,
  useEmergencySession,
  useGeolocation,
  useNotifications,
} from '@/hooks'
import { SafeRoute, EmergencyContact } from '@/types'
import { MapPin, AlertCircle } from 'lucide-react'

// Mock data
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
]

export default function Dashboard() {
  const { riskScore, isLoading: riskLoading } = useRiskScore(3000)
  const { location, error: locationError } = useGeolocation()
  const { isActive, triggerSOS, cancelSOS, notifiedContacts, addNotifiedContact } =
    useEmergencySession()
  const { notifications, addNotification, removeNotification } = useNotifications()
  const [selectedRoute, setSelectedRoute] = useState<SafeRoute | null>(null)

  // Handle SOS trigger
  const handleSOSTrigger = () => {
    triggerSOS()
    addNotification(
      '🚨 Emergency Mode Active',
      'Your emergency contacts have been notified. Your location is being shared in real-time.',
      'SOS'
    )

    // Simulate notifying contacts
    mockContacts.forEach((contact) => {
      setTimeout(() => {
        addNotifiedContact(contact.id)
      }, 500)
    })
  }

  const handleNavigate = (route: SafeRoute) => {
    setSelectedRoute(route)
    addNotification(
      '📍 Navigation Started',
      `Navigating via ${route.distance.toFixed(1)}km route`,
      'INFO'
    )
  }

  return (
    <>
      {/* Header */}
      <Header
        title="SafeSpace AI"
        subtitle="Context-Aware Safety Assistant"
      />

      {/* Main Content */}
      <div className="px-safe-area py-6 space-y-6">
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
          <div className="space-y-4">
            {mockContacts.map((contact) => (
              <EmergencyContactItem
                key={contact.id}
                contact={contact}
                isActive={isActive}
                onCall={() =>
                  addNotification(
                    `Calling ${contact.name}`,
                    `Initiating call to ${contact.phone}`,
                    'INFO'
                  )
                }
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-base">
            <p className="text-caption text-text-secondary mb-2">ROUTES AVAILABLE</p>
            <p className="text-3xl font-bold text-accent-safe">{mockRoutes.length}</p>
          </div>
          <div className="card-base">
            <p className="text-caption text-text-secondary mb-2">TRUSTED CONTACTS</p>
            <p className="text-3xl font-bold text-accent-safe">
              {mockContacts.length}
            </p>
          </div>
        </div>
      </div>

      {/* SOS Button (Floating) */}
      <div className="fixed bottom-28 right-6 z-50">
        <SOSButton onTrigger={handleSOSTrigger} isActive={isActive} />
      </div>

      {/* Navigation */}
      <Navigation onLogout={() => addNotification('Logged Out', 'see you soon', 'INFO')} />

      {/* Notifications - Temporary (top center) */}
      <div className="fixed top-0 left-0 right-0 px-safe-area pt-4 z-40 pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="card-base mb-3 pointer-events-auto cursor-pointer hover:brightness-110 transition-all"
onClick={() => removeNotification(notif.id)}
          >
            <p className="text-caption font-semibold text-accent-danger">
              {notif.title}
            </p>
            <p className="text-body-sm text-text-secondary">{notif.message}</p>
          </div>
        ))}
      </div>
    </>
  )
}
