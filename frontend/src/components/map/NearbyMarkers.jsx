import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { formatDistance } from '../../services/overpassApi'

function makePOIIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));line-height:1">${emoji}</div>`,
    iconAnchor: [11, 11],
    className: '',
  })
}

/**
 * NearbyMarkers — renders emoji markers for nearby POIs.
 * Clicking a list item in the sidebar flies to these markers.
 */
export default function NearbyMarkers({ places }) {
  if (!places?.length) return null

  return (
    <>
      {places.map(place => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={makePOIIcon(place.icon)}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {formatDistance(place.distanceMeters)} away
            </span>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
