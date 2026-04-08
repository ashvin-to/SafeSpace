'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MapPin,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/routes', label: 'Safe Routes', icon: MapPin },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface NavigationProps {
  onLogout?: () => void
}

export function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }

    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border-color safe-area">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                isActive
                  ? 'text-accent-danger'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-caption">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 px-4 text-text-secondary hover:text-accent-danger transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-caption">Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
