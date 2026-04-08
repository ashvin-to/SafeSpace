'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed')
        setLoading(false)
        return
      }

      router.replace('/')
      router.refresh()
    } catch {
      setError('Network error while logging in')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-safe-area bg-background">
      <section className="w-full max-w-md card-base border border-border-color/80 space-y-4">
        <h1 className="text-header-lg">Login</h1>
        <p className="text-body-sm text-text-secondary">Access your SafeSpace account</p>

        {error && (
          <div className="rounded-btn border border-accent-danger/60 bg-accent-danger/10 px-3 py-2 text-body-sm text-accent-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
            required
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
            minLength={6}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-body-sm text-text-secondary">
          New here?{' '}
          <Link href="/register" className="text-accent-danger hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}
