import Badge from '../ui/Badge'
import { Shield, Zap, Clock, Route } from 'lucide-react'

/**
 * RouteCards — displays one or two route results returned from backend.
 * Each card shows distance, ETA, and a color-coded safety score bar.
 */
export default function RouteCards({ routes, selectedType, onSelect }) {
  if (!routes || routes.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="section-label">Results</div>
      {routes.map(route => (
        <RouteCard
          key={route.type}
          route={route}
          selected={selectedType === route.type}
          onClick={() => onSelect(route.type)}
        />
      ))}
    </div>
  )
}

function RouteCard({ route, selected, onClick }) {
  const isSafe    = route.type === 'safe'
  const safety    = route.safetyScore
  const safeColor = safety > 70 ? '#22c55e' : safety > 40 ? '#f59e0b' : '#ef4444'
  const safeBg    = safety > 70 ? 'bg-emerald-50' : safety > 40 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left card p-3 transition-all duration-200
        ${selected
          ? isSafe
            ? 'border-emerald-400 shadow-md shadow-emerald-100 ring-1 ring-emerald-300'
            : 'border-blue-400 shadow-md shadow-blue-100 ring-1 ring-blue-300'
          : 'hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`p-1.5 rounded-lg ${isSafe ? 'bg-emerald-100' : 'bg-blue-100'}`}>
          {isSafe
            ? <Shield size={14} className="text-emerald-600" />
            : <Zap    size={14} className="text-blue-600" />
          }
        </div>
        <Badge variant={isSafe ? 'safe' : 'fastest'}>
          {isSafe ? 'Safe Route' : 'Fastest Route'}
        </Badge>
        {selected && (
          <span className="ml-auto text-xs font-medium text-emerald-600">● Active</span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <Stat icon={<Route size={11}/>}  label="Distance" value={`${route.distanceKm} km`} />
        <Stat icon={<Clock size={11}/>}  label="ETA"      value={`${route.durationMinutes} min`} />
        <Stat
          label="Safety"
          value={`${safety}%`}
          valueStyle={{ color: safeColor }}
        />
      </div>

      {/* Safety bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${safety}%`, background: safeColor, boxShadow: `0 0 6px ${safeColor}60` }}
        />
      </div>

      {/* Safety label */}
      <div className={`mt-1.5 text-xs font-medium px-2 py-0.5 rounded-md inline-block ${safeBg}`} style={{ color: safeColor }}>
        {safety > 70 ? '✓ Safe to travel' : safety > 40 ? '⚠ Use caution' : '✗ High risk area'}
      </div>
    </button>
  )
}

function Stat({ icon, label, value, valueStyle = {} }) {
  return (
    <div className="bg-slate-50 rounded-lg px-2 py-1.5">
      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-700" style={valueStyle}>{value}</div>
    </div>
  )
}
