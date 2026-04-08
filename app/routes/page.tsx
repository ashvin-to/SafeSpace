'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Header,
  Navigation,
  RouteCard,
  EmptyState,
  AuthGate,
} from '@/components'
import { SafeRoute, EmergencyContact } from '@/types'
import { MapPin, Navigation as NavIcon, Loader } from 'lucide-react'
import { createEmergencyMailtoUrl, placeEmergencyCall } from '@/utils/call'

interface GoogleMapPreviewProps {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
}

function GoogleMapPreview({ originLat, originLng, destLat, destLng }: GoogleMapPreviewProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const directionsUrl = useMemo(
    () =>
      `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=walking`,
    [originLat, originLng, destLat, destLng]
  )

  const previewUrl = useMemo(
    () => {
      if (googleApiKey) {
        return `https://www.google.com/maps/embed/v1/directions?key=${googleApiKey}&origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=walking`
      }
      return `https://www.google.com/maps?q=${destLat},${destLng}&z=15&output=embed`
    },
    [googleApiKey, originLat, originLng, destLat, destLng]
  )

  const centerLat = (originLat + destLat) / 2
  const centerLng = (originLng + destLng) / 2
  const centerUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=13&output=embed`

  return (
    <div className="space-y-3">
      <iframe
        title="Google Maps route preview"
        src={previewUrl || centerUrl}
        className="w-full h-[400px] rounded-card border border-border-color bg-background"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center gap-3 text-caption">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent-danger hover:underline font-semibold"
        >
          Open in Google Maps
        </a>
        <span className="text-text-secondary">
          {googleApiKey
            ? 'Google Maps embed is using your API key.'
            : 'No API key set. Using a basic Google preview fallback.'}
        </span>
      </div>
    </div>
  )
}

export default function RoutesPage() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [destinationInput, setDestinationInput] = useState('')
  const [selectedDestination, setSelectedDestination] = useState<{ lat: number; lng: number } | null>(null)
  const [routes, setRoutes] = useState<SafeRoute[]>([])
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monitorRouteId, setMonitorRouteId] = useState<string | null>(null)
  const [countdownEndsAt, setCountdownEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(30 * 60)
  const [timeoutAlertSent, setTimeoutAlertSent] = useState(false)
  const [monitorMessage, setMonitorMessage] = useState<string | null>(null)

  const activeContact = contacts.find((c) => c.id === selectedContactId) || contacts[0]

  const stopMonitor = (message?: string) => {
    setMonitorRouteId(null)
    setCountdownEndsAt(null)
    setSecondsLeft(30 * 60)
    setTimeoutAlertSent(false)
    if (message) {
      setMonitorMessage(message)
    }
  }

  const triggerTimeoutAlert = useCallback(() => {
    if (!activeContact) {
      setMonitorMessage('Timer expired, but no emergency contact exists. Please add one in Contacts.')
      setTimeoutAlertSent(true)
      return
    }

    const destinationLabel = destinationInput || 'destination'
    const alertMessage = `SafeSpace alert: I did not reach ${destinationLabel} within 30 minutes. Please check on me immediately.`

    let emailTriggered = false
    if (activeContact.email) {
      try {
        const mailtoUrl = createEmergencyMailtoUrl(activeContact, alertMessage, 'SafeSpace: arrival timeout alert')
        window.location.href = mailtoUrl
        setMonitorMessage(`Timer expired. Opened email alert for ${activeContact.name}.`)
        emailTriggered = true
      } catch {
        // Fallback to call below
      }
    }

    if (!emailTriggered) {
      try {
        placeEmergencyCall({ name: activeContact.name, phone: activeContact.phone })
        setMonitorMessage(`Timer expired. Calling ${activeContact.name}.`)
      } catch {
        setMonitorMessage(`Timer expired, but could not notify ${activeContact.name}.`) 
      }
    }

    setTimeoutAlertSent(true)
  }, [activeContact, destinationInput])

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoading(false)
        },
        (err) => {
          console.error('Geolocation error:', err)
          // Fallback to NYC
          setCurrentLocation({ lat: 40.7128, lng: -74.006 })
          setIsLoading(false)
        }
      )
    }
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contacts', { credentials: 'include' })
        if (!res.ok) {
          return
        }
        const data = await res.json()
        const loadedContacts: EmergencyContact[] = data.contacts || []
        setContacts(loadedContacts)
        if (loadedContacts.length > 0) {
          setSelectedContactId((prev) => prev || loadedContacts[0].id)
        }
      } catch {
        // noop
      }
    }

    fetchContacts()
  }, [])

  // Fetch routes when both current location and destination are set
  useEffect(() => {
    if (!currentLocation || !selectedDestination) {
      setRoutes([])
      return
    }

    const fetchRoutes = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/routes?originLat=${currentLocation.lat}&originLng=${currentLocation.lng}&destLat=${selectedDestination.lat}&destLng=${selectedDestination.lng}`
        )
        if (!response.ok) throw new Error('Failed to fetch routes')
        const data = await response.json()
        setRoutes(data.routes || [])
      } catch (err) {
        setError('Could not calculate routes. Try a different destination.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutes()
  }, [currentLocation, selectedDestination])

  useEffect(() => {
    if (!countdownEndsAt || timeoutAlertSent) {
      return
    }

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((countdownEndsAt - Date.now()) / 1000))
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        window.clearInterval(timer)
        triggerTimeoutAlert()
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [countdownEndsAt, timeoutAlertSent, triggerTimeoutAlert])

  // Demo destinations
  const demoLocations: Record<string, { lat: number; lng: number }> = {
    'Times Square': { lat: 40.758, lng: -73.9855 },
    'Central Park': { lat: 40.7829, lng: -73.9654 },
    'Empire State': { lat: 40.7484, lng: -73.9857 },
    'Brooklyn Bridge': { lat: 40.7061, lng: -73.9969 },
    'Statue of Liberty': { lat: 40.6892, lng: -74.0445 },
  }

  const handleSelectDestination = () => {
    const dest = demoLocations[destinationInput]
    if (dest) {
      setSelectedDestination(dest)
      setError(null)
    } else {
      setError('Destination not found. Try: Times Square, Central Park, Empire State, Brooklyn Bridge, Statue of Liberty')
    }
  }

  const startThirtyMinuteMonitor = (route: SafeRoute) => {
    setMonitorRouteId(route.id)
    setCountdownEndsAt(Date.now() + 30 * 60 * 1000)
    setSecondsLeft(30 * 60)
    setTimeoutAlertSent(false)
    setMonitorMessage(
      `Journey monitor started for ${route.distance.toFixed(1)} km route. Confirm arrival within 30 minutes.`
    )
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <AuthGate>
      <Header
        title="Safe Routes"
        subtitle="Real routes powered by OSRM routing engine"
      />

      <div className="px-safe-area py-6 space-y-4">
        {/* Destination Selector */}
        {!selectedDestination && (
          <div className="card-base border border-accent-danger/20 bg-accent-danger/5">
            <p className="text-caption text-text-secondary font-semibold mb-3">SELECT A DESTINATION</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSelectDestination()}
                  placeholder="e.g., Times Square"
                  className="flex-1 px-3 py-2 bg-background border border-border-color rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
                />
                <button
                  onClick={handleSelectDestination}
                  className="px-4 py-2 bg-accent-danger text-white rounded-card hover:opacity-90 font-semibold flex items-center gap-2"
                >
                  <NavIcon className="w-4 h-4" /> Go
                </button>
              </div>
              <p className="text-body-sm text-text-secondary">
                Try: Times Square, Central Park, Empire State, Brooklyn Bridge, Statue of Liberty
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="card-base bg-accent-danger/10 border border-accent-danger/30">
            <p className="text-body-sm text-accent-danger">{error}</p>
          </div>
        )}

        {monitorMessage && (
          <div className="card-base border border-accent-danger/30 bg-accent-danger/10">
            <p className="text-body-sm text-text-primary">{monitorMessage}</p>
          </div>
        )}

        {/* Current Location Status */}
        {currentLocation && (
          <div className="card-base">
            <p className="text-caption text-text-secondary mb-1">📍 YOUR LOCATION</p>
            <p className="text-body-sm text-text-primary">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Interactive Map */}
        {currentLocation && selectedDestination && (
          <div className="card-base border border-border-color/80 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-caption text-text-secondary font-semibold">LIVE ROUTE MAP</p>
              {isLoading && <Loader className="w-4 h-4 animate-spin text-accent-danger" />}
            </div>

            <GoogleMapPreview
              originLat={currentLocation.lat}
              originLng={currentLocation.lng}
              destLat={selectedDestination.lat}
              destLng={selectedDestination.lng}
            />
            <p className="text-body-sm text-text-secondary mt-3">
              Google Maps preview for visual confirmation. Routes are still calculated by OSRM.
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-caption text-text-secondary">ALERT CONTACT FOR TIMER</p>
              {contacts.length > 0 ? (
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-color rounded-card text-text-primary"
                >
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.relationship})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-body-sm text-text-secondary">
                  Add emergency contacts first so timeout alerts can notify someone.
                </p>
              )}
            </div>

            {monitorRouteId && (
              <div className="mt-4 card-base border border-accent-danger/30 bg-accent-danger/10">
                <p className="text-caption text-text-secondary mb-1">ARRIVAL COUNTDOWN (30 MIN)</p>
                <p className="text-2xl font-bold text-accent-danger">{minutes}:{seconds}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => stopMonitor('Arrival confirmed. Timer stopped and no alert sent.')}
                    className="btn-primary"
                  >
                    I reached safely
                  </button>
                  <button
                    onClick={() => {
                      triggerTimeoutAlert()
                      stopMonitor()
                    }}
                    className="px-3 py-2 rounded-card border border-accent-danger text-accent-danger"
                  >
                    Notify now
                  </button>
                </div>
              </div>
            )}

            {selectedDestination && (
              <button
                onClick={() => {
                  setSelectedDestination(null)
                  setRoutes([])
                  setDestinationInput('')
                  stopMonitor()
                }}
                className="mt-3 text-accent-danger text-caption hover:underline font-semibold"
              >
                Change destination
              </button>
            )}
          </div>
        )}

        {/* Routes List */}
        {isLoading && selectedDestination ? (
          <div className="card-base text-center py-8">
            <Loader className="w-6 h-6 animate-spin text-accent-danger mx-auto mb-2" />
            <p className="text-text-secondary">Calculating safe routes...</p>
          </div>
        ) : routes.length > 0 ? (
          <div>
            <h2 className="text-header-lg mb-4">Route Options</h2>
            <div className="space-y-4">
              {routes.map((route, idx) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isRecommended={idx === 0}
                  onStartNavigation={() => {
                    startThirtyMinuteMonitor(route)
                  }}
                />
              ))}
            </div>
          </div>
        ) : !isLoading && selectedDestination ? (
          <EmptyState
            icon={MapPin}
            title="No Routes Found"
            description="Could not find a route to this destination"
          />
        ) : !isLoading && !selectedDestination ? (
          <EmptyState
            icon={MapPin}
            title="Select a Destination"
            description="Choose a destination above to see safe route recommendations"
          />
        ) : null}
      </div>

      <Navigation onLogout={handleLogout} />
    </AuthGate>
  )
}
