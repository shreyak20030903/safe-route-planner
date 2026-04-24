import { Shield, RotateCcw } from 'lucide-react'
import StatusBar  from '../ui/StatusBar'
import SearchPanel from './SearchPanel'
import RouteCards  from './RouteCards'
import NearbyPanel from './NearbyPanel'

/**
 * Sidebar — master layout component for the left panel.
 * Receives all state as props; no local state here (kept in App.jsx).
 */
export default function Sidebar({
  // status
  status, statusMsg,
  // search
  startCoords, endCoords, startLabel, endLabel,
  onStartSet, onEndSet, onSwap, onGPS,
  // route type
  routeMode, onRouteModeChange,
  // find button
  onFind, findLoading,
  // route results
  routes, selectedRouteType, onRouteSelect,
  // nearby
  nearbyCenter, activeNearbyType, nearbyPlaces, nearbyLoading,
  onNearbySearch, onNearbyPlaceClick,
  // clear
  onClear,
}) {
  const canFind = startCoords && endCoords

  return (
    <aside className="w-[360px] min-w-[360px] h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">

      {/* ── HEADER ── */}
      <header className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">SafeRoute</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wide">INDORE · CRIME-AWARE NAV</p>
          </div>
          <button
            onClick={onClear}
            className="ml-auto p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            title="Clear all"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Status */}
        <StatusBar message={statusMsg} status={status} />

        {/* Search */}
        <section>
          <div className="section-label">Route Points</div>
          <SearchPanel
            onStartSet={onStartSet}
            onEndSet={onEndSet}
            onSwap={onSwap}
            onGPS={onGPS}
            startLabel={startLabel}
            endLabel={endLabel}
          />
        </section>

        {/* Route mode */}
        <section>
          <div className="section-label">Show Routes</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: 'both',    icon: '🔀', label: 'Both'    },
              { key: 'safe',    icon: '🛡️', label: 'Safe'    },
              { key: 'fastest', icon: '⚡', label: 'Fastest' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => onRouteModeChange(m.key)}
                className={`
                  py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
                  ${routeMode === m.key
                    ? m.key === 'safe'    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : m.key === 'fastest' ? 'bg-blue-50 border-blue-400 text-blue-700'
                                          : 'bg-violet-50 border-violet-400 text-violet-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }
                `}
              >
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </section>

        {/* Find button */}
        <button
          className="btn-primary"
          disabled={!canFind || findLoading}
          onClick={onFind}
        >
          {findLoading ? '⟳ Calculating...' : '→ Find Route'}
        </button>

        {/* Route cards */}
        {routes.length > 0 && (
          <RouteCards
            routes={routes}
            selectedType={selectedRouteType}
            onSelect={onRouteSelect}
          />
        )}

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Nearby */}
        <NearbyPanel
          center={nearbyCenter}
          activeType={activeNearbyType}
          places={nearbyPlaces}
          loading={nearbyLoading}
          onSearch={onNearbySearch}
          onPlaceClick={onNearbyPlaceClick}
        />

        {/* Legend */}
        <section>
          <div className="section-label">Crime Legend</div>
          <div className="card p-3 space-y-1.5">
            {[
              { color: '#ef4444', label: 'High risk zone',   dot: 'bg-red-500' },
              { color: '#f59e0b', label: 'Medium risk zone', dot: 'bg-amber-400' },
              { color: '#22c55e', label: 'Low risk zone',    dot: 'bg-emerald-500' },
              { color: '#22c55e', label: 'Safe route',       line: true },
              { color: '#3b82f6', label: 'Fastest route',    line: true, lineColor: '#3b82f6' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                {item.line
                  ? <div className="w-5 h-1 rounded-full" style={{ background: item.lineColor || item.color }} />
                  : <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                }
                {item.label}
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  )
}
