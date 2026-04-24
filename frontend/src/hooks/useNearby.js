import { useState, useCallback } from 'react'
import { fetchNearbyPlaces } from '../services/overpassApi'

/**
 * Manages nearby place search state.
 * Toggle same type to clear results.
 */
export function useNearby() {
  const [places, setPlaces] = useState([])
  const [activeType, setActiveType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (type, lat, lng) => {
    // Toggle off if same type clicked again
    if (activeType === type) {
      setPlaces([])
      setActiveType(null)
      return
    }
    setLoading(true)
    setError(null)
    setActiveType(type)
    setPlaces([])
    try {
      const data = await fetchNearbyPlaces(type, lat, lng)
      setPlaces(data)
    } catch (e) {
      setError('Could not fetch nearby places.')
      setActiveType(null)
    } finally {
      setLoading(false)
    }
  }, [activeType])

  const clear = useCallback(() => {
    setPlaces([])
    setActiveType(null)
    setError(null)
  }, [])

  return { places, activeType, loading, error, search, clear }
}
