import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authUser = getUserFromRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.contact.findFirst({
    where: { id: params.id, userId: authUser.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  }

  const body = await request.json()
  const updated = await prisma.contact.update({
    where: { id: existing.id },
    data: {
      name: typeof body?.name === 'string' ? body.name.trim() : existing.name,
      phone: typeof body?.phone === 'string' ? body.phone.trim() : existing.phone,
      email:
        typeof body?.email === 'string'
          ? body.email.trim() || null
          : existing.email,
      relationship:
        typeof body?.relationship === 'string'
          ? body.relationship.trim() || existing.relationship
          : existing.relationship,
    },
  })

  return NextResponse.json({ contact: updated })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authUser = getUserFromRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.contact.findFirst({
    where: { id: params.id, userId: authUser.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  }

  await prisma.contact.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}
