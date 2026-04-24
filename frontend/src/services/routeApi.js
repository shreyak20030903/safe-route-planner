import axios from 'axios'

/**
 * Uses VITE_API_URL environment variable in production (Vercel).
 * Falls back to localhost:8080 for local development.
 *
 * In Vercel dashboard → Settings → Environment Variables, add:
 *   VITE_API_URL = https://your-actual-render-app.onrender.com/api
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

export async function fetchRoutes({ startLat, startLng, endLat, endLng, mode }) {
  const res = await API.post('/route', { startLat, startLng, endLat, endLng, mode })
  return res.data
}

export async function fetchCrimeZones() {
  const res = await API.get('/crime-zones')
  return res.data
}