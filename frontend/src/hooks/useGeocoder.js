import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for address autocomplete using Nominatim (OSM geocoding).
 * Completely free — no API key required.
 * Adds 400ms debounce to avoid hammering the API.
 */
export function useGeocoder() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceTimer = useRef(null)

  const search = useCallback((query) => {
    clearTimeout(debounceTimer.current)
    if (!query || query.trim().length < 3) {
      setSuggestions([])
      return
    }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + ', Indore, Madhya Pradesh'
        )}&format=json&limit=5&countrycodes=in`
        const res = await fetch(url)
        const data = await res.json()
        setSuggestions(
          data.map(item => {
            const parts = item.display_name.split(',')
            return {
              id: item.place_id,
              label: parts[0].trim(),
              sublabel: parts.slice(1, 3).join(',').trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }
          })
        )
      } catch (e) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [])

  const clear = useCallback(() => setSuggestions([]), [])

  return { suggestions, loading, search, clear }
}
