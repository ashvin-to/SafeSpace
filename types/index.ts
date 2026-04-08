// Type definitions for SafeSpace AI

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AudienceMode = 'women' | 'children' | 'tourists'

export interface RiskScore {
  score: number // 0-100
  level: RiskLevel
  confidence: number // 0-1
  factors: string[]
  timestamp: Date
}

export interface Location {
  latitude: number
  longitude: number
  accuracy: number // meters
  timestamp: Date
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
  priority: number
  isVerified: boolean
  createdAt: Date
}

export interface SafeRoute {
  id: string
  origin: Location
  destination: Location
  distance: number // km
  estimatedDuration: number // minutes
  riskScore: number // 0-100
  features: string[] // ["well_lit", "camera_coverage", "high_footfall"]
  polyline: string // encoded polyline
}

export interface EmergencySession {
  id: string
  startedAt: Date
  endedAt?: Date
  location: Location
  status: 'ACTIVE' | 'RESOLVED' | 'TIMEOUT'
  contactedPeople: {
    contactId: string
    notifiedAt: Date
    respondedAt?: Date
    response?: string
  }[]
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  riskPreference: number // 1-100
  emergencyContacts: EmergencyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface notifications {
  id: string
  userId: string
  title: string
  message: string
  type: 'ALERT' | 'SOS' | 'INFO' | 'WARNING'
  read: boolean
  createdAt: Date
}
