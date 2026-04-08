export interface CallTarget {
  name: string
  phone: string
}

export interface CallResult {
  mode: 'dialer' | 'web'
  normalizedPhone: string
  fallbackUrl?: string
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export function hasNativeDialerSupport(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const ua = navigator.userAgent || ''
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua)
  const touchPoints = navigator.maxTouchPoints || 0

  return isMobileUA || touchPoints > 1
}

export function getImmediateCallUrl(target: CallTarget): string {
  const normalizedPhone = normalizePhone(target.phone)
  
  // WhatsApp web link for desktop/tablet web calls
  // Format: https://wa.me/[country_code][phone_number]
  const whatsappPhone = normalizedPhone.replace(/[^\d+]/g, '')
  const message = `Hi ${target.name}, this is a SafeSpace emergency call. Please respond.`
  const encodedMsg = encodeURIComponent(message)
  
  return `https://wa.me/${whatsappPhone}?text=${encodedMsg}`
}

export function placeEmergencyCall(target: CallTarget): CallResult {
  const normalizedPhone = normalizePhone(target.phone)

  if (!normalizedPhone) {
    throw new Error('Invalid phone number')
  }

  if (hasNativeDialerSupport()) {
    window.location.href = `tel:${normalizedPhone}`
    return {
      mode: 'dialer',
      normalizedPhone,
    }
  }

  const fallbackUrl = getImmediateCallUrl(target)
  const popup = window.open(fallbackUrl, '_blank', 'noopener,noreferrer')

  if (!popup) {
    window.location.href = fallbackUrl
  }

  return {
    mode: 'web',
    normalizedPhone,
    fallbackUrl,
  }
}
