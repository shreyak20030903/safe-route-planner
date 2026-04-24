import { useState, useRef, useEffect } from 'react'
import { MapPin, Navigation, ArrowUpDown, X } from 'lucide-react'
import { useGeocoder } from '../../hooks/useGeocoder'

/**
 * SearchPanel — handles origin & destination inputs with
 * Nominatim geocoding autocomplete and GPS button.
 */
export default function SearchPanel({ onStartSet, onEndSet, onSwap, onGPS, startLabel, endLabel }) {
  const [startVal, setStartVal] = useState('')
  const [endVal, setEndVal]     = useState('')
  const [focus, setFocus]       = useState(null) // 'start' | 'end'

  const startGeo = useGeocoder()
  const endGeo   = useGeocoder()
  const startRef  = useRef(null)
  const endRef    = useRef(null)
  const panelRef  = useRef(null)

  // Sync external label changes (e.g. from map click)
  useEffect(() => { if (startLabel) setStartVal(startLabel) }, [startLabel])
  useEffect(() => { if (endLabel)   setEndVal(endLabel) },   [endLabel])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        startGeo.clear(); endGeo.clear(); setFocus(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [startGeo, endGeo])

  function handleStartChange(e) {
    setStartVal(e.target.value)
    startGeo.search(e.target.value)
  }
  function handleEndChange(e) {
    setEndVal(e.target.value)
    endGeo.search(e.target.value)
  }

  function pickStart(s) {
    setStartVal(s.label)
    startGeo.clear()
    setFocus(null)
    onStartSet({ lat: s.lat, lng: s.lng, label: s.label })
  }
  function pickEnd(s) {
    setEndVal(s.label)
    endGeo.clear()
    setFocus(null)
    onEndSet({ lat: s.lat, lng: s.lng, label: s.label })
  }

  function handleSwap() {
    const tmpV = startVal; setStartVal(endVal); setEndVal(tmpV)
    onSwap()
  }

  function clearStart() { setStartVal(''); startGeo.clear(); onStartSet(null) }
  function clearEnd()   { setEndVal('');   endGeo.clear();   onEndSet(null) }

  return (
    <div ref={panelRef} className="space-y-2">
      {/* Start */}
      <div className="relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] z-10" />
          <input
            ref={startRef}
            className="input-base pl-8 pr-8"
            placeholder="Origin — type or click map"
            value={startVal}
            onChange={handleStartChange}
            onFocus={() => setFocus('start')}
            autoComplete="off"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {startVal
              ? <button onClick={clearStart} className="text-slate-300 hover:text-slate-500 p-0.5"><X size={13}/></button>
              : <button onClick={() => onGPS('start')} className="text-slate-300 hover:text-emerald-500 p-0.5" title="Use GPS"><Navigation size={13}/></button>
            }
          </div>
        </div>

        {/* Start autocomplete dropdown */}
        {focus === 'start' && startGeo.suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {startGeo.suggestions.map(s => (
              <button
                key={s.id}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                onMouseDown={() => pickStart(s)}
              >
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-700">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sublabel}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swap button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-100" />
        <button
          onClick={handleSwap}
          className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          title="Swap start and end"
        >
          <ArrowUpDown size={13} />
        </button>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* End */}
      <div className="relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)] z-10" />
          <input
            ref={endRef}
            className="input-base pl-8 pr-8"
            placeholder="Destination"
            value={endVal}
            onChange={handleEndChange}
            onFocus={() => setFocus('end')}
            autoComplete="off"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {endVal && <button onClick={clearEnd} className="text-slate-300 hover:text-slate-500 p-0.5"><X size={13}/></button>}
          </div>
        </div>

        {/* End autocomplete dropdown */}
        {focus === 'end' && endGeo.suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {endGeo.suggestions.map(s => (
              <button
                key={s.id}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                onMouseDown={() => pickEnd(s)}
              >
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-700">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sublabel}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
