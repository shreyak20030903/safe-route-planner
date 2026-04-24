import { useState, useEffect, useCallback } from 'react'
import Sidebar  from './components/sidebar/Sidebar'
import MapView  from './components/map/MapView'
import Toast    from './components/ui/Toast'
import { useRoute  } from './hooks/useRoute'
import { useNearby } from './hooks/useNearby'
import { fetchCrimeZones } from './services/routeApi'

export default function App() {
  // ── Points ──
  const [startCoords, setStartCoords] = useState(null) // { lat, lng }
  const [endCoords,   setEndCoords]   = useState(null)
  const [startLabel,  setStartLabel]  = useState('')
  const [endLabel,    setEndLabel]    = useState('')

  // ── Map control ──
  const [flyTarget,     setFlyTarget]     = useState(null)
  const [crimeVisible,  setCrimeVisible]  = useState(true)
  const [crimeZones,    setCrimeZones]    = useState([])
  const [mapClickMode,  setMapClickMode]  = useState('start') // 'start' | 'end'

  // ── Route ──
  const [routeMode,        setRouteMode]        = useState('both')
  const [selectedRouteType, setSelectedRouteType] = useState(null)
  const { routes, loading: routeLoading, error: routeError, calculate, clear: clearRoutes } = useRoute()

  // ── Nearby ──
  const { places, activeType, loading: nearbyLoading, search: nearbySearch, clear: nearbyClr } = useNearby()

  // ── Toast ──
  const [toast, setToast] = useState(null)

  // ── Status ──
  const [statusMsg, setStatusMsg] = useState('Click map or type to set start point')
  const [statusKind, setStatusKind] = useState('idle')

  // ── Load crime zones from backend on mount ──
  useEffect(() => {
    fetchCrimeZones()
      .then(data => setCrimeZones(data))
      .catch(() => setToast({ msg: 'Backend offline — crime zones unavailable', type: 'warning' }))
  }, [])

  // ── Map click: place start then end ──
  const handleMapClick = useCallback((lat, lng) => {
    const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    if (!startCoords) {
      setStartCoords({ lat, lng })
      setStartLabel(label)
      setStatus('Start set — now click map or type destination', 'idle')
    } else if (!endCoords) {
      setEndCoords({ lat, lng })
      setEndLabel(label)
      setStatus('Both points set — click Find Route!', 'success')
    }
  }, [startCoords, endCoords])

  // ── GPS ──
  const handleGPS = useCallback((target = 'start') => {
    if (!navigator.geolocation) { setToast({ msg: 'Geolocation not supported', type: 'error' }); return }
    setStatus('Getting your location...', 'loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const label = 'My Location'
        setFlyTarget({ lat, lng, zoom: 15 })
        if (target === 'start' || !startCoords) {
          setStartCoords({ lat, lng }); setStartLabel(label)
        } else {
          setEndCoords({ lat, lng }); setEndLabel(label)
        }
        setStatus('Location set!', 'success')
      },
      () => { setToast({ msg: 'Could not get location', type: 'error' }); setStatus('Location error', 'idle') }
    )
  }, [startCoords])

  // ── Swap ──
  const handleSwap = useCallback(() => {
    setStartCoords(endCoords);   setEndCoords(startCoords)
    setStartLabel(endLabel);     setEndLabel(startLabel)
    clearRoutes()
  }, [startCoords, endCoords, startLabel, endLabel, clearRoutes])

  // ── Find route ──
  const handleFind = useCallback(async () => {
    if (!startCoords || !endCoords) return
    setStatus('Calculating routes...', 'loading')
    setSelectedRouteType(null)
    await calculate({
      startLat: startCoords.lat, startLng: startCoords.lng,
      endLat:   endCoords.lat,   endLng:   endCoords.lng,
      mode: routeMode,
    })
    setStatus('Routes ready — click a card to highlight', 'success')
  }, [startCoords, endCoords, routeMode, calculate])

  // ── Show toast on route error ──
  useEffect(() => {
    if (routeError) {
      setToast({ msg: routeError, type: 'error' })
      setStatus('Route error — is the backend running?', 'error')
    }
  }, [routeError])

  // ── Nearby place click → fly to it ──
  const handleNearbyPlaceClick = useCallback((place) => {
    setFlyTarget({ lat: place.lat, lng: place.lng, zoom: 17 })
  }, [])

  // ── Clear all ──
  const handleClear = useCallback(() => {
    setStartCoords(null); setEndCoords(null)
    setStartLabel('');    setEndLabel('')
    clearRoutes(); nearbyClr()
    setSelectedRouteType(null)
    setStatus('Cleared — click map to start', 'idle')
  }, [clearRoutes, nearbyClr])

  function setStatus(msg, kind) { setStatusMsg(msg); setStatusKind(kind) }

  // Determine nearby search center
  const nearbyCenter = startCoords || { lat: 22.7196, lng: 75.8577 }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        // status
        status={statusKind}
        statusMsg={statusMsg}
        // search
        startCoords={startCoords}
        endCoords={endCoords}
        startLabel={startLabel}
        endLabel={endLabel}
        onStartSet={p => { if (p) { setStartCoords({ lat: p.lat, lng: p.lng }); setStartLabel(p.label); setFlyTarget({ lat: p.lat, lng: p.lng }) } else { setStartCoords(null); setStartLabel('') } }}
        onEndSet={p   => { if (p) { setEndCoords  ({ lat: p.lat, lng: p.lng }); setEndLabel(p.label);   setFlyTarget({ lat: p.lat, lng: p.lng }) } else { setEndCoords(null);   setEndLabel('') } }}
        onSwap={handleSwap}
        onGPS={handleGPS}
        // mode
        routeMode={routeMode}
        onRouteModeChange={setRouteMode}
        // find
        onFind={handleFind}
        findLoading={routeLoading}
        // results
        routes={routes}
        selectedRouteType={selectedRouteType}
        onRouteSelect={setSelectedRouteType}
        // nearby
        nearbyCenter={nearbyCenter}
        activeNearbyType={activeType}
        nearbyPlaces={places}
        nearbyLoading={nearbyLoading}
        onNearbySearch={nearbySearch}
        onNearbyPlaceClick={handleNearbyPlaceClick}
        // clear
        onClear={handleClear}
      />

      <MapView
        crimeZones={crimeZones}
        crimeVisible={crimeVisible}
        routes={routes}
        selectedRouteType={selectedRouteType}
        startCoords={startCoords}
        endCoords={endCoords}
        nearbyPlaces={places}
        flyTarget={flyTarget}
        onMapClick={handleMapClick}
        onGPS={() => handleGPS('start')}
        onCrimeToggle={() => setCrimeVisible(v => !v)}
      />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
