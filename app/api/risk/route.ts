import { NextRequest, NextResponse } from 'next/server'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

function getRiskLevel(score: number): RiskLevel {
  if (score >= 67) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 33) return 'MEDIUM'
  return 'LOW'
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

async function fetchWeather(lat: number, lng: number) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=is_day,precipitation,cloud_cover,wind_speed_10m`
  const response = await fetch(weatherUrl, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 120 },
  })

  if (!response.ok) {
    throw new Error('Weather source unavailable')
  }

  const data = await response.json()
  return {
    isDay: Number(data?.current?.is_day || 1),
    precipitation: Number(data?.current?.precipitation || 0),
    cloudCover: Number(data?.current?.cloud_cover || 0),
    windSpeed: Number(data?.current?.wind_speed_10m || 0),
  }
}

async function fetchNearbySafetySignals(lat: number, lng: number) {
  const query = `
[out:json][timeout:12];
(
  node(around:900,${lat},${lng})[amenity=police];
  node(around:900,${lat},${lng})[amenity=hospital];
  node(around:900,${lat},${lng})[amenity=pharmacy];
  node(around:900,${lat},${lng})[highway=street_lamp];
  node(around:900,${lat},${lng})[highway=bus_stop];
  node(around:900,${lat},${lng})[amenity=taxi];
);
out body;
`

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      Accept: 'application/json',
    },
    body: query,
    next: { revalidate: 120 },
  })

  if (!response.ok) {
    throw new Error('Map context source unavailable')
  }

  const data = await response.json()
  const elements: Array<{ tags?: Record<string, string> }> = data?.elements || []

  let police = 0
  let hospitals = 0
  let pharmacies = 0
  let streetLamps = 0
  let busStops = 0
  let taxis = 0

  elements.forEach((element) => {
    const tags = element.tags || {}
    if (tags.amenity === 'police') police += 1
    if (tags.amenity === 'hospital') hospitals += 1
    if (tags.amenity === 'pharmacy') pharmacies += 1
    if (tags.highway === 'street_lamp') streetLamps += 1
    if (tags.highway === 'bus_stop') busStops += 1
    if (tags.amenity === 'taxi') taxis += 1
  })

  return { police, hospitals, pharmacies, streetLamps, busStops, taxis }
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lng = Number(request.nextUrl.searchParams.get('lng'))
  const accuracy = Number(request.nextUrl.searchParams.get('accuracy') || 0)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  let score = 22
  const factors: string[] = []
  let confidence = 0.45

  try {
    const weather = await fetchWeather(lat, lng)
    confidence += 0.25

    if (weather.isDay === 0) {
      score += 20
      factors.push('Night-time conditions increase vulnerability')
    } else {
      score -= 4
      factors.push('Daylight conditions improve visibility')
    }

    if (weather.precipitation > 0.2) {
      score += 8
      factors.push('Precipitation can reduce visibility and mobility')
    }

    if (weather.cloudCover > 85) {
      score += 5
      factors.push('Heavy cloud cover reduces ambient visibility')
    }

    if (weather.windSpeed > 28) {
      score += 6
      factors.push('Strong wind conditions detected')
    }
  } catch {
    factors.push('Live weather feed unavailable; using partial model')
  }

  try {
    const nearby = await fetchNearbySafetySignals(lat, lng)
    confidence += 0.25

    const emergencyPoints = nearby.police + nearby.hospitals + nearby.pharmacies
    if (emergencyPoints === 0) {
      score += 14
      factors.push('Few nearby emergency support points')
    } else if (emergencyPoints >= 3) {
      score -= 8
      factors.push('Good emergency support presence nearby')
    }

    if (nearby.streetLamps < 6) {
      score += 12
      factors.push('Low street lighting density nearby')
    } else {
      score -= 5
      factors.push('Street lighting coverage detected nearby')
    }

    if (nearby.busStops + nearby.taxis < 3) {
      score += 7
      factors.push('Lower public transit activity in this area')
    } else {
      score -= 4
      factors.push('Transit access indicates active area')
    }
  } catch {
    factors.push('Local infrastructure feed unavailable; using partial model')
  }

  if (Number.isFinite(accuracy) && accuracy > 120) {
    score += 4
    confidence -= 0.08
    factors.push('Low GPS precision may reduce assessment accuracy')
  }

  const finalScore = clamp(Math.round(score), 5, 95)
  const finalConfidence = clamp(confidence, 0.35, 0.96)
  const level = getRiskLevel(finalScore)

  const uniqueFactors = [...new Set(factors)].slice(0, 5)

  return NextResponse.json({
    score: finalScore,
    level,
    confidence: finalConfidence,
    factors: uniqueFactors,
    timestamp: new Date().toISOString(),
    source: 'live-context-model',
  })
}
