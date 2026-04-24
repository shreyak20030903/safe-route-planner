import axios from 'axios'

const API = axios.create({
  baseURL: 'https://safe-route-planner.onrender.com/api',//chaneg this for local running add backend url
  timeout: 30000,
})

/**
 * POST /api/route
 * Sends start/end coordinates and mode to backend.
 * Backend calls OSRM, scores crime, returns route(s).
 */
export async function fetchRoutes({ startLat, startLng, endLat, endLng, mode }) {
  const res = await API.post('/route', { startLat, startLng, endLat, endLng, mode })
  return res.data // array of RouteResponse
}

/**
 * GET /api/crime-zones
 * Returns all crime zones from H2 database.
 * Frontend uses this to draw the heatmap overlay.
 */
export async function fetchCrimeZones() {
  const res = await API.get('/crime-zones')
  return res.data
}
