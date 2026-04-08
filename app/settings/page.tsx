'use client'

import React, { useState } from 'react'
import { Header, Navigation, AuthGate } from '@/components'
import {
  Bell,
  Lock,
  MapPin,
  Smartphone,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface SettingItemProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  onClick?: () => void
}

function SettingItem({
  icon,
  title,
  description,
  action,
  onClick,
}: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="card-base flex items-center justify-between hover:brightness-110 transition-all"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="text-text-secondary">{icon}</div>
        <div className="text-left">
          <p className="font-semibold">{title}</p>
          {description && (
            <p className="text-body-sm text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      {action ? action : <ChevronRight className="w-5 h-5 text-text-secondary" />}
    </button>
  )
}

export default function SettingsPage() {
  const [riskPreference, setRiskPreference] = useState(50)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationAlwaysOn, setLocationAlwaysOn] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <AuthGate>
      <Header title="Settings" subtitle="Customize your SafeSpace experience" />

      <div className="px-safe-area py-6 lg:py-8 space-y-6">
        {/* Safety Preferences */}
        <div className="page-grid">
          <div className="page-grid-main">
          <h2 className="text-header-lg mb-4">Safety Preferences</h2>
          <div className="space-y-4">
            <div className="card-base">
              <p className="text-body-base font-semibold mb-4">Risk Tolerance</p>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={riskPreference}
                  onChange={(e) => setRiskPreference(Number(e.target.value))}
                  className="w-full accent-accent-danger"
                />
                <div className="flex items-center justify-between text-body-sm text-text-secondary">
                  <span>Conservative</span>
                  <span className="font-semibold text-text-primary">
                    {riskPreference}%
                  </span>
                  <span>Aggressive</span>
                </div>
              </div>
            </div>

            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              title="Notifications"
              description={
                notificationsEnabled ? 'Alerts enabled' : 'Alerts disabled'
              }
              action={
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) =>
                    setNotificationsEnabled(e.target.checked)
                  }
                  className="w-5 h-5 accent-accent-danger"
                />
              }
            />

            <SettingItem
              icon={<MapPin className="w-5 h-5" />}
              title="Location Tracking"
              description={
                locationAlwaysOn
                  ? 'Always on (high battery usage)'
                  : 'On demand only'
              }
              action={
                <input
                  type="checkbox"
                  checked={locationAlwaysOn}
                  onChange={(e) => setLocationAlwaysOn(e.target.checked)}
                  className="w-5 h-5 accent-accent-danger"
                />
              }
            />
          </div>
          </div>

          <div className="page-grid-side">
            <div className="card-base">
              <p className="text-caption text-text-secondary font-semibold mb-2">PROFILE STATUS</p>
              <p className="text-body-sm text-text-secondary">Logged in as <span className="text-text-primary font-semibold">user@example.com</span></p>
              <p className="text-body-sm text-text-secondary mt-2">Safety profile adapts based on your location, route selection, and risk tolerance.</p>
            </div>

            <div className="card-base">
              <p className="text-caption text-text-secondary font-semibold mb-2">QUICK ACTIONS</p>
              <button className="btn-secondary w-full mb-2">Change Password</button>
              <button onClick={handleLogout} className="btn-ghost w-full text-accent-danger hover:bg-accent-danger hover:bg-opacity-10">
                <LogOut className="w-4 h-4 mr-2 inline" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div>
          <h2 className="text-header-lg mb-4">Security & Privacy</h2>
          <div className="space-y-4">
            <SettingItem
              icon={<Lock className="w-5 h-5" />}
              title="Privacy Settings"
              description="Control data sharing and encryption"
              onClick={() => console.log('Open privacy settings')}
            />

            <SettingItem
              icon={<Smartphone className="w-5 h-5" />}
              title="Connected Devices"
              description="Manage trusted devices"
              onClick={() => console.log('Open devices')}
            />
          </div>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-header-lg mb-4">Support</h2>
          <div className="space-y-4">
            <SettingItem
              icon={<HelpCircle className="w-5 h-5" />}
              title="Help & Documentation"
              description="FAQ, guides, and tutorials"
              onClick={() => console.log('Open help')}
            />

            <SettingItem
              icon={<HelpCircle className="w-5 h-5" />}
              title="Report a Bug"
              description="Help us improve SafeSpace"
              onClick={() => console.log('Report bug')}
            />
          </div>
        </div>

        {/* App Info */}
        <div className="card-base text-center">
          <p className="text-caption text-text-secondary">SafeSpace AI v0.1.0</p>
          <p className="text-body-sm text-text-secondary mt-2">
            © 2026 SafeSpace. All rights reserved.
          </p>
        </div>
      </div>

      <Navigation onLogout={handleLogout} />
    </AuthGate>
  )
}
