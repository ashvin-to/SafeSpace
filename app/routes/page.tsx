'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Header,
  Navigation,
  RouteCard,
  EmptyState,
  AuthGate,
} from '@/components'
import { SafeRoute } from '@/types'
import { MapPin, Navigation as NavIcon, Loader } from 'lucide-react'

interface MapContainerProps {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  routes: SafeRoute[]
  mapKey: number
}

function InteractiveMap({ originLat, originLng, destLat, destLng, routes, mapKey }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Load Leaflet CSS and JS from CDN
    const loadLeaflet = async () => {
      const leafletWindow = window as any
      if (!leafletWindow.L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
        script.async = true
        script.onload = () => initializeMap()
        document.body.appendChild(script)
      } else {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || mapInstance.current) return

      const leafletWindow = window as any
      const L = leafletWindow.L
      const map = L.map(mapRef.current).setView(
        [(originLat + destLat) / 2, (originLng + destLng) / 2],
        12
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add start marker
      L.marker([originLat, originLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup('<b>Your Location</b>')
        .openPopup()
        .addTo(map)

      // Add destination marker
      L.marker([destLat, destLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup('<b>Destination</b>')
        .addTo(map)

      // Plot all routes
      const colors = ['#FF3B30', '#FF9500', '#34C759']
      routes.forEach((route, idx) => {
        if (route.polyline && typeof route.polyline === 'object' && (route.polyline as any).coordinates) {
          L.polyline(
            (route.polyline as any).coordinates.map((c: any) => [c[1], c[0]]),
            {
              color: colors[idx % colors.length],
              weight: idx === 0 ? 4 : 2,
              opacity: idx === 0 ? 0.9 : 0.6,
              dashArray: idx === 0 ? '' : '5, 5',
            }
          ).addTo(map)
        }
      })

      mapInstance.current = map
    }

    loadLeaflet()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [originLat, originLng, destLat, destLng, routes, mapKey])

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-card border border-border-color bg-background"
    />
  )
}

export default function RoutesPage() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [destinationInput, setDestinationInput] = useState('')
  const [selectedDestination, setSelectedDestination] = useState<{ lat: number; lng: number } | null>(null)
  const [routes, setRoutes] = useState<SafeRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState(0)

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
        setMapKey((k) => k + 1)
      } catch (err) {
        setError('Could not calculate routes. Try a different destination.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutes()
  }, [currentLocation, selectedDestination])

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

            <InteractiveMap
              originLat={currentLocation.lat}
              originLng={currentLocation.lng}
              destLat={selectedDestination.lat}
              destLng={selectedDestination.lng}
              routes={routes}
              mapKey={mapKey}
            />
            <p className="text-body-sm text-text-secondary mt-3">
              Map powered by OpenStreetMap. Routes calculated by OSRM (Open Route Service Machine).
            </p>
            {selectedDestination && (
              <button
                onClick={() => {
                  setSelectedDestination(null)
                  setRoutes([])
                  setDestinationInput('')
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
                    // In real app, start turn-by-turn navigation
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
