import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: authUser.id },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ contacts })
}

export async function POST(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const name = String(body?.name || '').trim()
  const phone = String(body?.phone || '').trim()
  const email = String(body?.email || '').trim()
  const relationship = String(body?.relationship || '').trim()

  if (!name || !phone || !relationship) {
    return NextResponse.json(
      { error: 'Name, phone, and relationship are required.' },
      { status: 400 }
    )
  }

  const contact = await prisma.contact.create({
    data: {
      userId: authUser.id,
      name,
      phone,
      email: email || null,
      relationship,
      priority: Number(body?.priority || 1),
      isVerified: Boolean(body?.isVerified),
    },
  })

  return NextResponse.json({ contact }, { status: 201 })
}
