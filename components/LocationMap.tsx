'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude: number
  longitude: number
}

// Dynamically import leaflet to avoid SSR issues
let L: any = null

const LoadMap = ({ latitude, longitude }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

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

    // Update or add marker
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
    }
  }, [latitude, longitude])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
