'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  RiskScoreCard,
  RouteCard,
  EmergencyContactItem,
  SOSButton,
  Header,
  Alert,
  Navigation,
  AuthGate,
  LocationMap,
} from '@/components'
import {
  useEmergencySession,
  useGeolocation,
  useRiskScore,
  useLocalStorage,
  useNotifications,
} from '@/hooks'
import { SafeRoute, EmergencyContact, AudienceMode, RiskScore } from '@/types'
import { Baby, MapPin, Plane, ShieldAlert } from 'lucide-react'
import { placeEmergencyCall } from '@/utils/call'
import { DEFAULT_AUDIENCE_MODE, PREFERENCE_KEYS } from '@/lib/preferences'

const audienceModes: {
  id: AudienceMode
  title: string
  subtitle: string
  badge: string
  icon: React.ElementType
}[] = [
  {
    id: 'women',
    title: 'Women Safety',
    subtitle: 'Proactive risk alerts and rapid escalation support.',
    badge: 'Priority Monitoring',
    icon: ShieldAlert,
  },
  {
    id: 'children',
    title: 'Child Safety',
    subtitle: 'Guardian check-ins and low-friction emergency flows.',
    badge: 'Guardian Linked',
    icon: Baby,
  },
  {
    id: 'tourists',
    title: 'Tourist Safety',
    subtitle: 'Safer route guidance in unfamiliar areas.',
    badge: 'City Assist',
    icon: Plane,
  },
]

const audienceRiskBias: Record<AudienceMode, number> = {
  women: 10,
  children: 15,
  tourists: 8,
}

const routeRiskBias: Record<AudienceMode, number> = {
  women: 6,
  children: 10,
  tourists: 8,
}

const audienceModeFactors: Record<AudienceMode, string> = {
  women: 'Women safety profile: increased sensitivity near low-visibility areas.',
  children: 'Child safety profile: stricter threshold for isolated and high-speed corridors.',
  tourists: 'Tourist safety profile: caution boosted for unfamiliar zones.',
}

const routeModeFeature: Record<AudienceMode, string> = {
  women: 'enhanced_patrol_alignment',
  children: 'guardian_friendly_segments',
  tourists: 'landmark_assisted_guidance',
}

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
  const [audienceMode, setAudienceMode] = useLocalStorage<AudienceMode>(
    PREFERENCE_KEYS.audienceMode,
    DEFAULT_AUDIENCE_MODE
  )
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  const handleAudienceMode = (mode: AudienceMode) => {
    setAudienceMode(mode)

    const audienceMessages: Record<AudienceMode, { title: string; message: string }> = {
      women: {
        title: 'Women Safety Mode Active',
        message: 'Escalation sensitivity increased. Alerts will trigger earlier on high-risk zones.',
      },
      children: {
        title: 'Child Safety Mode Active',
        message: 'Guardian-first alerts enabled with shorter inactivity and SOS thresholds.',
      },
      tourists: {
        title: 'Tourist Safety Mode Active',
        message: 'Route guidance now prioritizes visibility, crowds, and trusted transit corridors.',
      },
    }

    const config = audienceMessages[mode]
    addNotification(config.title, config.message, 'INFO')
  }

  const adjustedRiskScore = useMemo<RiskScore | null>(() => {
    if (!riskScore) {
      return null
    }

    const score = Math.max(0, Math.min(100, riskScore.score + audienceRiskBias[audienceMode]))
    const level = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW'

    return {
      ...riskScore,
      score,
      level,
      factors: [audienceModeFactors[audienceMode], ...riskScore.factors],
    }
  }, [riskScore, audienceMode])

  const modeAdjustedRoutes = useMemo(() => {
    return mockRoutes
      .map((route) => {
        const adjustedRisk = Math.max(0, Math.min(100, route.riskScore + routeRiskBias[audienceMode]))

        return {
          ...route,
          riskScore: adjustedRisk,
          features: [...route.features, routeModeFeature[audienceMode]],
        }
      })
      .sort((a, b) => a.riskScore - b.riskScore)
  }, [audienceMode])

  return (
    <AuthGate>
      {/* Header */}
      <Header
        title="SafeSpace AI"
        subtitle="Safety intelligence for women, children, and tourists"
      />

      {/* Main Content */}
      <div className="px-safe-area py-4 lg:py-5 space-y-4">

        <section className="card-base border border-border-color/80 relative overflow-hidden py-4">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-danger to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption text-text-secondary">LIVE SAFETY STATUS</p>
            <p className="text-body-sm text-text-secondary">SOS ready</p>
          </div>
          <p className="text-body-sm text-text-secondary mt-3">
            Audience-focused protection is available for women, children, and tourists.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          {audienceModes.map((mode) => {
            const Icon = mode.icon
            const isActiveMode = mode.id === audienceMode

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleAudienceMode(mode.id)}
                className={`card-base text-left border transition-all ${
                  isActiveMode
                    ? 'border-accent-safe ring-1 ring-accent-safe/50'
                    : 'border-border-color/80 hover:border-accent-safe/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-caption text-text-secondary">{mode.badge}</p>
                  <Icon className="w-4 h-4 text-accent-safe" />
                </div>
                <h3 className="text-body-base font-semibold mb-1">{mode.title}</h3>
                <p className="text-body-sm text-text-secondary">{mode.subtitle}</p>
              </button>
            )
          })}
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

        <RiskScoreCard riskScore={adjustedRiskScore} isLoading={riskLoading} />

        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-header-lg">Recommended Routes</h2>
            <p className="text-body-sm text-text-secondary">Mode: {audienceMode}</p>
          </div>
          <div className="space-y-4">
            {modeAdjustedRoutes.map((route, idx) => (
              <RouteCard
                key={route.id}
                route={route}
                isRecommended={idx === 0}
                onStartNavigation={() =>
                  addNotification(
                    'Navigation Started',
                    `Using ${audienceMode} safety profile on ${route.distance.toFixed(1)}km route.`,
                    'INFO'
                  )
                }
              />
            ))}
          </div>
        </section>

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
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-text-secondary" />
              <p className="text-caption text-text-secondary">CURRENT LOCATION</p>
            </div>
            
            <LocationMap latitude={location.latitude} longitude={location.longitude} />
            
            <p className="text-body-base mt-4">
              ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
            </p>
            <p className="text-body-sm text-text-secondary mt-2">
              Accuracy: ±{location.accuracy.toFixed(0)}m
            </p>
          </div>
        )}

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
                <p>Women: proactive zone alerts + faster escalation routing.</p>
                <p>Children: guardian-linked check-ins + instant SOS relay.</p>
                <p>Tourists: route confidence scoring in unfamiliar locations.</p>
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
