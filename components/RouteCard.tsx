'use client'

import React from 'react'
import { SafeRoute } from '@/types'
import { formatDistance, formatDuration, getRiskColor } from '@/utils/helpers'
import { MapPin, Route, ThumbsUp, Clock, AlertTriangle } from 'lucide-react'

interface RouteCardProps {
  route: SafeRoute
  isRecommended?: boolean
  onStartNavigation?: () => void
}

export function RouteCard({
  route,
  isRecommended = false,
  onStartNavigation,
}: RouteCardProps) {
  const riskColor = getRiskColor(route.riskScore)
  const riskLabel =
    route.riskScore < 33
      ? 'SAFE'
      : route.riskScore < 66
      ? 'MEDIUM'
      : 'HIGH RISK'

  return (
    <div
      className={`card-base ${isRecommended ? 'ring-2 ring-accent-safe' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-text-secondary" />
          <div>
            <h3 className="font-semibold">
              {route.distance.toFixed(1)}km Route
            </h3>
            {isRecommended && (
              <span className="text-caption text-accent-safe">
                ✓ Recommended
              </span>
            )}
          </div>
        </div>
        {isRecommended && <ThumbsUp className="w-5 h-5 text-accent-safe" />}
      </div>

      {/* Duration & Distance */}
      <div className="flex gap-4 mb-4 text-body-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock className="w-4 h-4" />
          {formatDuration(route.estimatedDuration)}
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin className="w-4 h-4" />
          {formatDistance(route.distance)}
        </div>
      </div>

      {/* Risk Score */}
      <div className="bg-background rounded-btn p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption text-text-secondary">
            Estimated Risk
          </span>
          <span
            className="text-caption font-bold"
            style={{ color: riskColor }}
          >
            {Math.round(route.riskScore)}%
          </span>
        </div>
        <div className="risk-bar">
          <div
            className="risk-bar-fill"
            style={{
              width: `${route.riskScore}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </div>

      {/* Features */}
      {route.features.length > 0 && (
        <div className="mb-4">
          <p className="text-caption text-text-secondary font-semibold mb-2">
            WHY THIS ROUTE
          </p>
          <ul className="space-y-1">
            {route.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-body-sm text-accent-safe"
              >
                <span>✓</span>
                <span className="capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onStartNavigation}
        className="btn-primary w-full"
      >
        Start Navigation
      </button>
    </div>
  )
}

export default RouteCard
