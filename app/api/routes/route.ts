import { NextRequest, NextResponse } from 'next/server'

interface RouteResponse {
  code: string
  routes: Array<{
    geometry: any
    distance: number
    duration: number
    summary?: {
      totalDistance: number
      totalDuration: number
    }
  }>
}

/**
 * Calculate multiple safe routes between origin and destination
 * Uses OSRM (Open Route Service Machine) - free, no API key required
 * Returns 3 alternative routes with different characteristics
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const originLat = searchParams.get('originLat')
  const originLng = searchParams.get('originLng')
  const destLat = searchParams.get('destLat')
  const destLng = searchParams.get('destLng')

  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json(
      { error: 'Missing coordinates: originLat, originLng, destLat, destLng' },
      { status: 400 }
    )
  }

  try {
    // Call OSRM for multiple routes
    // alternatives=true returns up to 3 routes
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?alternatives=true&geometries=geojson&overview=full`

    const response = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'SafeSpace-AI' },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to calculate routes' },
        { status: 500 }
      )
    }

    const data: RouteResponse = await response.json()

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: 'No routes found' },
        { status: 404 }
      )
    }

    // Transform OSRM response to our SafeRoute format
    const routes = data.routes.map((route, idx) => {
      const distance = route.distance / 1000 // Convert to km
      const duration = Math.round(route.duration / 60) // Convert to minutes

      // Simulate risk scoring (in real app, would analyze streets, lighting, crime data, etc.)
      // Generally:
      // - Shortest route: safest (more familiar, busier)
      // - Medium route: moderate risk
      // - Longest route: higher risk (less traveled)
      const baseRisk = Math.min(100, 20 + idx * 25)
      const timeBonus = duration < 15 ? -5 : duration < 30 ? 0 : 10
      const riskScore = Math.max(10, Math.min(100, baseRisk + timeBonus))

      return {
        id: String(idx + 1),
        origin: {
          latitude: parseFloat(originLat),
          longitude: parseFloat(originLng),
          accuracy: 5,
          timestamp: new Date(),
        },
        destination: {
          latitude: parseFloat(destLat),
          longitude: parseFloat(destLng),
          accuracy: 5,
          timestamp: new Date(),
        },
        distance,
        estimatedDuration: duration,
        riskScore,
        features:
          idx === 0
            ? ['well_lit', 'camera_coverage', 'high_footfall', 'police_presence']
            : idx === 1
              ? ['scenic_view', 'mid_footfall']
              : ['scenic_view', 'low_footfall'],
        polyline: route.geometry,
      }
    })

    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Route calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate routes' },
      { status: 500 }
    )
  }
}
