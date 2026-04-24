import { useState, useCallback } from 'react'
import { fetchRoutes } from '../services/routeApi'

/**
 * Manages route calculation state.
 * Calls Spring Boot backend which handles OSRM + crime scoring.
 */
export function useRoute() {
  const [routes, setRoutes] = useState([])       // array of RouteResponse from backend
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculate = useCallback(async ({ startLat, startLng, endLat, endLng, mode }) => {
    setLoading(true)
    setError(null)
    setRoutes([])
    try {
      const data = await fetchRoutes({ startLat, startLng, endLat, endLng, mode })
      setRoutes(data)
    } catch (e) {
      setError('Could not calculate route. Make sure the backend is running.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setRoutes([])
    setError(null)
  }, [])

  return { routes, loading, error, calculate, clear }
}
