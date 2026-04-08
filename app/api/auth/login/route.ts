import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authCookieOptions, signAuthToken, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const token = signAuthToken({ id: user.id, email: user.email, name: user.name })
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  })
  response.cookies.set('safespace_token', token, authCookieOptions())
  return response
}
