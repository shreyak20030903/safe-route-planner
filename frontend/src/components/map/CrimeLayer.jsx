import { Circle, Tooltip } from 'react-leaflet'

const LEVEL_COLORS = {
  HIGH:   { fill: '#ef4444', stroke: '#dc2626' },
  MEDIUM: { fill: '#f59e0b', stroke: '#d97706' },
  LOW:    { fill: '#22c55e', stroke: '#16a34a' },
}

const LEVEL_OPACITY = {
  HIGH:   { fill: 0.22, stroke: 0.6 },
  MEDIUM: { fill: 0.16, stroke: 0.45 },
  LOW:    { fill: 0.10, stroke: 0.3 },
}

/**
 * CrimeLayer — renders a translucent circle for each crime zone.
 * Data comes from Spring Boot GET /api/crime-zones.
 * Visible toggle controlled by parent.
 */
export default function CrimeLayer({ zones, visible }) {
  if (!visible || !zones?.length) return null

  return (
    <>
      {zones.map(zone => {
        const level   = zone.crimeLevel?.toUpperCase() || 'LOW'
        const colors  = LEVEL_COLORS[level]  || LEVEL_COLORS.LOW
        const opacity = LEVEL_OPACITY[level] || LEVEL_OPACITY.LOW

        return (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radiusMeters}
            pathOptions={{
              color:       colors.stroke,
              fillColor:   colors.fill,
              fillOpacity: opacity.fill,
              weight:      1.5,
              opacity:     opacity.stroke,
            }}
          >
            <Tooltip className="crime-tooltip" sticky>
              <strong>{zone.name}</strong>
              <br />
              <span style={{ color: colors.stroke, textTransform: 'uppercase', fontSize: '10px' }}>
                {level} crime zone
              </span>
              {zone.description && (
                <>
                  <br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{zone.description}</span>
                </>
              )}
            </Tooltip>
          </Circle>
        )
      })}
    </>
  )
}
