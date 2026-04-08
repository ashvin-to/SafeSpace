'use client'

import React from 'react'
import {
  Header,
  Navigation,
  RouteCard,
  LoadingSpinner,
  EmptyState,
} from '@/components'
import { SafeRoute } from '@/types'
import { MapPin } from 'lucide-react'

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
  {
    id: '3',
    origin: { latitude: 40.7128, longitude: -74.006, accuracy: 5, timestamp: new Date() },
    destination: { latitude: 40.7489, longitude: -73.968, accuracy: 5, timestamp: new Date() },
    distance: 2.5,
    estimatedDuration: 42,
    riskScore: 72,
    features: ['scenic_view'],
    polyline: 'mock_polyline_3',
  },
]

export default function RoutesPage() {
  const [selectedRoute, setSelectedRoute] = React.useState<SafeRoute | null>(null)

  return (
    <>
      <Header
        title="Safe Routes"
        subtitle="AI-optimized paths with risk assessment"
      />

      <div className="px-safe-area py-6 space-y-4">
        {mockRoutes.length > 0 ? (
          mockRoutes.map((route, idx) => (
            <RouteCard
              key={route.id}
              route={route}
              isRecommended={idx === 0}
              onStartNavigation={() => {
                setSelectedRoute(route)
                // In real app, start navigation here
              }}
            />
          ))
        ) : (
          <EmptyState
            icon={MapPin}
            title="No Routes Found"
            description="Set a destination to get safe route recommendations"
          />
        )}
      </div>

      <Navigation />
    </>
  )
}
