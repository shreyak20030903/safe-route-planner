/**
 * Fetches nearby POIs from OpenStreetMap's Overpass API.
 * Completely free — no API key required.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export const PLACE_TYPES = {
  hospital:   { key: 'amenity', value: 'hospital',   icon: '🏥', label: 'Hospitals' },
  police:     { key: 'amenity', value: 'police',     icon: '🚔', label: 'Police' },
  restaurant: { key: 'amenity', value: 'restaurant', icon: '🍽️', label: 'Food' },
  hotel:      { key: 'tourism', value: 'hotel',      icon: '🏨', label: 'Hotels' },
  pharmacy:   { key: 'amenity', value: 'pharmacy',   icon: '💊', label: 'Pharmacy' },
  fuel:       { key: 'amenity', value: 'fuel',       icon: '⛽', label: 'Petrol' },
}

/**
 * @param {string} type - key from PLACE_TYPES
 * @param {number} lat - center latitude
 * @param {number} lng - center longitude
 * @param {number} radiusMeters - search radius (default 2500m)
 */
export async function fetchNearbyPlaces(type, lat, lng, radiusMeters = 2500) {
  const { key, value } = PLACE_TYPES[type]
  const query = `
    [out:json][timeout:15];
    node["${key}"="${value}"](around:${radiusMeters},${lat},${lng});
    out 12;
  `
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
  })
  const data = await res.json()

  return data.elements.slice(0, 10).map(el => ({
    id: el.id,
    name: el.tags?.name || `Unnamed ${type}`,
    lat: el.lat,
    lng: el.lon,
    type,
    icon: PLACE_TYPES[type].icon,
    distanceMeters: haversine(lat, lng, el.lat, el.lon),
  })).sort((a, b) => a.distanceMeters - b.distanceMeters)
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(meters) {
  return meters > 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`
}
