// Utility functions for SafeSpace AI

import { RiskLevel, RiskScore } from '@/types'

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 67) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 33) return 'MEDIUM'
  return 'LOW'
}

export function getRiskColor(score: number): string {
  if (score >= 67) return '#FF3B30' // Red - Danger
  if (score >= 50) return '#FFAA00' // Amber - Caution
  if (score >= 33) return '#FFB81C' // Gold - Medium
  return '#34C759' // Green - Safe
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score)}%`
}

export function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export function generateMockRiskScore(): RiskScore {
  const score = Math.floor(Math.random() * 100)
  return {
    score,
    level: getRiskLevel(score),
    confidence: 0.85 + Math.random() * 0.15,
    factors: [
      'Isolated area',
      'Late hour',
      'Low foot traffic',
      'Recent incident nearby',
    ].filter(() => Math.random() > 0.5),
    timestamp: new Date(),
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
