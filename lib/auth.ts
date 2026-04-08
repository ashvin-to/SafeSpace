import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export interface AuthUser {
  id: string
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: TOKEN_MAX_AGE_SECONDS,
  })
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('safespace_token')?.value
  if (!token) {
    return null
  }

  return verifyAuthToken(token)
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS,
  }
}
