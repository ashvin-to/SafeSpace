'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Registration failed')
        setLoading(false)
        return
      }

      router.replace('/')
      router.refresh()
    } catch {
      setError('Network error while registering')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-safe-area bg-background">
      <section className="w-full max-w-md card-base border border-border-color/80 space-y-4">
        <h1 className="text-header-lg">Create Account</h1>
        <p className="text-body-sm text-text-secondary">Start using SafeSpace with secured login</p>

        {error && (
          <div className="rounded-btn border border-accent-danger/60 bg-accent-danger/10 px-3 py-2 text-body-sm text-accent-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
            required
            autoFocus
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
            required
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-btn bg-background border border-border-color px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-danger"
            minLength={6}
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-body-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-danger hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
