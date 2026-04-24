import { Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const ROUTE_STYLES = {
  safe:    { color: '#22c55e', weight: 5, opacity: 0.9 },
  fastest: { color: '#3b82f6', weight: 5, opacity: 0.9 },
}

const ROUTE_STYLES_DIM = {
  safe:    { color: '#22c55e', weight: 4, opacity: 0.35 },
  fastest: { color: '#3b82f6', weight: 4, opacity: 0.35 },
}

function makeMarkerIcon(color, glow) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 0 10px ${glow},0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconAnchor: [7, 7],
    className: '',
  })
}

const START_ICON = makeMarkerIcon('#22c55e', 'rgba(34,197,94,0.6)')
const END_ICON   = makeMarkerIcon('#ef4444', 'rgba(239,68,68,0.6)')

/**
 * RouteLayer — draws route polyline(s) and start/end markers.
 * Dims non-selected route when both are shown.
 */
export default function RouteLayer({ routes, selectedType, startCoords, endCoords }) {
  if (!routes?.length) return null

  return (
    <>
      {/* Route polylines */}
      {routes.map(route => {
        const isSelected = !selectedType || selectedType === route.type
        const style = isSelected ? ROUTE_STYLES[route.type] : ROUTE_STYLES_DIM[route.type]
        const positions = route.coordinates.map(c => [c[0], c[1]])
        return (
          <Polyline key={route.type} positions={positions} pathOptions={style} />
        )
      })}

      {/* Start marker */}
      {startCoords && (
        <Marker position={[startCoords.lat, startCoords.lng]} icon={START_ICON}>
          <Popup>
            <strong style={{ color: '#16a34a' }}>Start</strong>
            <br />
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
              {startCoords.lat.toFixed(5)}, {startCoords.lng.toFixed(5)}
            </span>
          </Popup>
        </Marker>
      )}

      {/* End marker */}
      {endCoords && (
        <Marker position={[endCoords.lat, endCoords.lng]} icon={END_ICON}>
          <Popup>
            <strong style={{ color: '#dc2626' }}>Destination</strong>
            <br />
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
              {endCoords.lat.toFixed(5)}, {endCoords.lng.toFixed(5)}
            </span>
          </Popup>
        </Marker>
      )}
    </>
  )
}
