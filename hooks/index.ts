// Custom hooks for SafeSpace AI

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Location, RiskScore } from '@/types'

/**
 * Hook to get user's current location
 */
export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setIsLoading(false)
      return
    }

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      })
      setIsLoading(false)
    }

    const errorHandler = (error: GeolocationPositionError) => {
      setError(error.message)
      setIsLoading(false)
    }

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, isLoading }
}

/**
 * Hook to fetch live risk score updates from context-aware API
 */
export function useRiskScore(location: Location | null, interval: number = 60000) {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!location) {
      setIsLoading(true)
      return
    }

    let mounted = true

    const fetchRiskScore = async () => {
      try {
        const response = await fetch(
          `/api/risk?lat=${location.latitude}&lng=${location.longitude}&accuracy=${location.accuracy}`,
          { credentials: 'include' }
        )

        if (!response.ok) {
          throw new Error('Risk API request failed')
        }

        const data = await response.json()
        if (!mounted) return

        setRiskScore({
          score: Number(data.score),
          level: data.level,
          confidence: Number(data.confidence),
          factors: Array.isArray(data.factors) ? data.factors : [],
          timestamp: new Date(data.timestamp || Date.now()),
        })
      } catch {
        if (!mounted) return
        setRiskScore((prev) =>
          prev || {
            score: 45,
            level: 'MEDIUM',
            confidence: 0.45,
            factors: ['Live risk feed unavailable; using conservative fallback'],
            timestamp: new Date(),
          }
        )
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRiskScore()
    const timer = window.setInterval(fetchRiskScore, interval)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [location, interval])

  return { riskScore, isLoading }
}

/**
 * Hook to manage emergency session
 */
export function useEmergencySession() {
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [notifiedContacts, setNotifiedContacts] = useState<string[]>([])

  const triggerSOS = useCallback(() => {
    setIsActive(true)
    setStartTime(new Date())
    // In real app, this would notify emergency contacts
    console.log('🚨 SOS TRIGGERED')
  }, [])

  const cancelSOS = useCallback(() => {
    setIsActive(false)
    setStartTime(null)
    setNotifiedContacts([])
    console.log('❌ SOS CANCELLED')
  }, [])

  const addNotifiedContact = useCallback((contactId: string) => {
    setNotifiedContacts((prev) => [...new Set([...prev, contactId])])
  }, [])

  return {
    isActive,
    startTime,
    notifiedContacts,
    triggerSOS,
    cancelSOS,
    addNotifiedContact,
  }
}

/**
 * Hook for WebSocket connection (real-time updates)
 */
export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In production, connect to actual WebSocket
    // const ws = new WebSocket(url)
    // ws.onopen = () => setIsConnected(true)
    // ws.onclose = () => setIsConnected(false)
    // ws.onmessage = (event) => setLastMessage(JSON.parse(event.data))
    // return () => ws.close()

    // Mock implementation
    setIsConnected(true)
    return () => setIsConnected(false)
  }, [url])

  return { isConnected }
}

/**
 * Hook to manage notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  const addNotification = useCallback(
    (title: string, message: string, type: 'ALERT' | 'SOS' | 'INFO' | 'WARNING' = 'INFO') => {
      const id = Math.random().toString(36).substr(2, 9)
      const notification = { id, title, message, type, timestamp: new Date() }
      setNotifications((prev) => [notification, ...prev])

      // Auto-remove after 5 seconds (unless SOS)
      if (type !== 'SOS') {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 5000)
      }

      return id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { notifications, addNotification, removeNotification }
}

/**
 * Hook for localStorage state persistence
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}
