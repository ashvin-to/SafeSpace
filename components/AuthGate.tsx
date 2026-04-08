'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauth'>('loading')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 8000)

    fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((res) => {
        if (!isMounted) return
        if (res.ok) {
          setStatus('ok')
          return
        }
        setStatus('unauth')
        router.replace('/login')
      })
      .catch(() => {
        if (!isMounted) return
        setStatus('unauth')
        router.replace('/login')
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
      })

    return () => {
      isMounted = false
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Checking session...
      </div>
    )
  }

  if (status === 'unauth') {
    return null
  }

  return <>{children}</>
}

export default AuthGate
