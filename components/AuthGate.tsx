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

    fetch('/api/auth/me', { credentials: 'include' })
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

    return () => {
      isMounted = false
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
