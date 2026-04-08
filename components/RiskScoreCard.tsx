'use client'

import React, { useMemo } from 'react'
import { RiskScore } from '@/types'
import { getRiskColor, getRiskLevel, formatRiskScore } from '@/utils/helpers'
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react'

interface RiskScoreCardProps {
  riskScore: RiskScore | null
  isLoading?: boolean
}

export function RiskScoreCard({ riskScore, isLoading }: RiskScoreCardProps) {
  const riskColor = useMemo(
    () => getRiskColor(riskScore?.score || 0),
    [riskScore?.score]
  )

  const riskIcon = useMemo(() => {
    if (!riskScore) return null
    switch (riskScore.level) {
      case 'LOW':
        return <Shield className="w-8 h-8" style={{ color: riskColor }} />
      case 'MEDIUM':
        return <AlertTriangle className="w-8 h-8" style={{ color: riskColor }} />
      case 'HIGH':
      case 'CRITICAL':
        return <AlertCircle className="w-8 h-8" style={{ color: riskColor }} />
    }
  }, [riskScore, riskColor])

  if (isLoading) {
    return (
      <div className="card-base animate-pulse">
        <div className="h-24 bg-border-color rounded" />
      </div>
    )
  }

  if (!riskScore) {
    return (
      <div className="card-base">
        <p className="text-text-secondary">Loading risk assessment...</p>
      </div>
    )
  }

  const riskClass = {
    LOW: 'text-accent-safe',
    MEDIUM: 'text-accent-caution',
    HIGH: 'text-accent-danger',
    CRITICAL: 'text-accent-danger',
  }[riskScore.level]

  return (
    <div className="card-base">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-header-lg">Current Location</h2>
        <span className="text-caption text-text-secondary">Risk Analysis</span>
      </div>

      {/* Risk Score Large */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center">
          {riskIcon}
        </div>
        <div>
          <div className={`text-5xl font-bold ${riskClass}`}>
            {formatRiskScore(riskScore.score)}
          </div>
          <p className={`text-body-sm ${riskClass}`}>{riskScore.level}</p>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="mb-6">
        <div className="risk-bar">
          <div
            className="risk-bar-fill"
            style={{
              width: `${riskScore.score}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </div>

      {/* Confidence */}
      <p className="text-body-sm text-text-secondary mb-6">
        Confidence: {Math.round(riskScore.confidence * 100)}%
      </p>

      {/* Risk Factors */}
      {riskScore.factors.length > 0 && (
        <div className="bg-background rounded-btn p-4">
          <p className="text-caption font-semibold mb-2 text-text-secondary">
            RISK FACTORS
          </p>
          <ul className="space-y-2">
            {riskScore.factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-body-sm">
                <span className="text-accent-danger mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Text */}
      <p className="text-body-sm text-text-secondary mt-4">
        {riskScore.level === 'LOW' && '✓ This area appears safe right now'}
        {riskScore.level === 'MEDIUM' && '⚠ Be cautious in this area'}
        {riskScore.level === 'HIGH' && '⚠️ High-risk area detected'}
        {riskScore.level === 'CRITICAL' && '🚨 Critical risk detected'}
      </p>
    </div>
  )
}

export default RiskScoreCard
