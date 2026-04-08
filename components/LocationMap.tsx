'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude: number
  longitude: number
  heatPoints?: Array<{
    latitude: number
    longitude: number
    count: number
  }>
}

// Dynamically import leaflet to avoid SSR issues
let L: any = null

const LoadMap = ({ latitude, longitude, heatPoints = [] }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const heatLayersRef = useRef<any[]>([])

  useEffect(() => {
    // Only load leaflet on client side
    if (typeof window === 'undefined') return

    if (!L) {
      // Dynamic require to avoid SSR issues
      L = require('leaflet')
    }

    if (!mapRef.current) return

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 16)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    } else {
      // Update map view when coordinates change
      mapInstanceRef.current.setView([latitude, longitude], 16)
    }

    // Update or add current location marker
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.remove()
      }
      
      markerRef.current = L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: '#ff3f30',
        color: '#ff3f30',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current)

      // Clear previous heat layers before drawing new hotspots
      heatLayersRef.current.forEach((layer) => layer.remove())
      heatLayersRef.current = []

      // Draw SOS hotspot circles with intensity scaling
      heatPoints.forEach((point) => {
        const intensity = Math.min(1, point.count / 6)
        const outerRadius = 80 + point.count * 25
        const innerRadius = 30 + point.count * 8

        const outer = L.circle([point.latitude, point.longitude], {
          radius: outerRadius,
          color: '#ff3f30',
          weight: 1,
          opacity: 0.2 + intensity * 0.35,
          fillColor: '#ff3f30',
          fillOpacity: 0.08 + intensity * 0.18,
        }).addTo(mapInstanceRef.current)

        const inner = L.circleMarker([point.latitude, point.longitude], {
          radius: innerRadius / 5,
          color: '#ff6b57',
          weight: 2,
          opacity: 0.8,
          fillColor: '#ff3f30',
          fillOpacity: 0.35 + intensity * 0.3,
        })
          .bindTooltip(`SOS hotspot: ${point.count} trigger(s)`, {
            direction: 'top',
            offset: [0, -8],
          })
          .addTo(mapInstanceRef.current)

        heatLayersRef.current.push(outer, inner)
      })
    }
  }, [latitude, longitude, heatPoints])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      heatLayersRef.current.forEach((layer) => layer.remove())
      heatLayersRef.current = []
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return <div ref={mapRef} className="w-full h-[300px] rounded-card border border-border-color" />
}

export const LocationMap = dynamic(
  () => Promise.resolve(LoadMap),
  { ssr: false }
)

export default LocationMap
