import { PLACE_TYPES, formatDistance } from '../../services/overpassApi'
import { Loader2 } from 'lucide-react'

/**
 * NearbyPanel — six category buttons + list of results.
 * Center of search defaults to start point or Indore center.
 */
export default function NearbyPanel({ center, activeType, places, loading, onSearch, onPlaceClick }) {
  const searchCenter = center || { lat: 22.7196, lng: 75.8577 }

  return (
    <div className="space-y-2">
      <div className="section-label">Nearby Places</div>

      {/* Category grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(PLACE_TYPES).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => onSearch(key, searchCenter.lat, searchCenter.lng)}
            className={`
              flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium
              transition-all duration-200
              ${activeType === key
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'
              }
            `}
          >
            <span className="text-lg leading-none">{meta.icon}</span>
            <span>{meta.label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Searching nearby...</span>
        </div>
      )}

      {/* Results list */}
      {!loading && places.length > 0 && (
        <div className="space-y-1.5">
          {places.map(place => (
            <button
              key={place.id}
              onClick={() => onPlaceClick(place)}
              className="w-full flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
            >
              <span className="text-xl flex-shrink-0">{place.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{place.name}</div>
                <div className="text-xs text-slate-400 font-mono">{formatDistance(place.distanceMeters)} away</div>
              </div>
              <span className="text-slate-300 text-xs">›</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && activeType && places.length === 0 && (
        <div className="text-center py-4 text-slate-400 text-xs">
          No {PLACE_TYPES[activeType]?.label.toLowerCase()} found nearby
        </div>
      )}
    </div>
  )
}
