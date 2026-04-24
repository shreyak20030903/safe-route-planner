import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import CrimeLayer   from './CrimeLayer'
import RouteLayer   from './RouteLayer'
import NearbyMarkers from './NearbyMarkers'

// Fix default marker icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const INDORE_CENTER = [22.7196, 75.8577]

// Voyager tiles = closest to Google Maps look (light, colourful, road labels)
const VOYAGER_URL    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const VOYAGER_ATTR   = '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'

/**
 * MapClickHandler — inside MapContainer so it can use useMapEvents hook.
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

/**
 * FlyTo — imperatively moves the map when flyTarget changes.
 */
function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom || 16, { duration: 1.2 })
  }, [target, map])
  return null
}

/**
 * FitBounds — fits map to show all route coordinates when routes change.
 */
function FitBounds({ routes }) {
  const map = useMap()
  useEffect(() => {
    if (!routes?.length) return
    const allCoords = routes.flatMap(r => r.coordinates.map(c => [c[0], c[1]]))
    if (allCoords.length > 0) {
      map.fitBounds(L.latLngBounds(allCoords).pad(0.15))
    }
  }, [routes, map])
  return null
}

/**
 * MapControls — GPS and crime toggle FABs overlaid on the map.
 */
function MapControls({ onGPS, onCrimeToggle, crimeVisible }) {
  return (
    <div className="absolute top-3 right-3 z-[900] flex flex-col gap-2">
      <button
        onClick={onGPS}
        title="My location"
        className="w-9 h-9 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-base hover:bg-slate-50 transition-colors"
      >
        🎯
      </button>
      <button
        onClick={onCrimeToggle}
        title="Toggle crime zones"
        className={`w-9 h-9 rounded-xl shadow-md border flex items-center justify-center text-base transition-colors ${
          crimeVisible ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        ⚠️
      </button>
    </div>
  )
}

/**
 * CoordHUD — shows lat/lng on mouse move.
 */
function CoordHUD() {
  const ref = useRef(null)
  useMapEvents({
    mousemove(e) {
      if (ref.current) {
        ref.current.textContent =
          `${e.latlng.lat.toFixed(4)}°N  ${e.latlng.lng.toFixed(4)}°E  —  Indore, MP`
      }
    },
  })
  return (
    <div
      ref={ref}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[900] pointer-events-none
                 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg
                 px-3 py-1.5 text-xs font-mono text-slate-500 shadow-sm whitespace-nowrap"
    >
      Indore, Madhya Pradesh
    </div>
  )
}

/**
 * MapView — top-level map component.
 * Uses CartoDB Voyager tiles (Google Maps-style coloring).
 */
export default function MapView({
  crimeZones, crimeVisible,
  routes, selectedRouteType,
  startCoords, endCoords,
  nearbyPlaces,
  flyTarget,
  onMapClick,
  onGPS,
  onCrimeToggle,
}) {
  return (
    <div className="relative flex-1 h-screen">
      <MapContainer
        center={INDORE_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Google Maps-style tiles */}
        <TileLayer url={VOYAGER_URL} attribution={VOYAGER_ATTR} maxZoom={19} subdomains="abcd" />

        {/* Layers */}
        <CrimeLayer    zones={crimeZones}  visible={crimeVisible} />
        <RouteLayer    routes={routes}     selectedType={selectedRouteType} startCoords={startCoords} endCoords={endCoords} />
        <NearbyMarkers places={nearbyPlaces} />

        {/* Behaviours */}
        <MapClickHandler onMapClick={onMapClick} />
        <FlyTo    target={flyTarget} />
        <FitBounds routes={routes} />
        <CoordHUD />
      </MapContainer>

      {/* FAB overlay (outside MapContainer for simpler z-index) */}
      <MapControls onGPS={onGPS} onCrimeToggle={onCrimeToggle} crimeVisible={crimeVisible} />
    </div>
  )
}
