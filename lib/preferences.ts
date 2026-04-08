import { AudienceMode } from '@/types'

export const PREFERENCE_KEYS = {
  audienceMode: 'safespace.audienceMode',
} as const

export const DEFAULT_AUDIENCE_MODE: AudienceMode = 'women'
