import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authCookieOptions, hashPassword, signAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const phone = String(body?.phone || '').trim()
  const password = String(body?.password || '')

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: 'Name, email, and password (min 6 chars) are required.' },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      contacts: {
        create: [
          {
            name: 'Primary Guardian',
            phone: phone || '+1-555-0000',
            relationship: 'Guardian',
            priority: 1,
            isVerified: true,
          },
        ],
      },
    },
  })

  const token = signAuthToken({ id: user.id, email: user.email, name: user.name })
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  })

  response.cookies.set('safespace_token', token, authCookieOptions())
  return response
}
