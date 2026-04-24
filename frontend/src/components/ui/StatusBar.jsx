/**
 * StatusBar — shows current app state with a pulsing dot.
 * status: 'idle' | 'loading' | 'success' | 'error'
 */
export default function StatusBar({ message, status = 'idle' }) {
  const dot = {
    idle:    'bg-slate-400',
    loading: 'bg-amber-400 animate-pulse',
    success: 'bg-emerald-500 animate-pulse',
    error:   'bg-red-500',
  }
  const text = {
    idle:    'text-slate-500',
    loading: 'text-amber-600',
    success: 'text-emerald-600',
    error:   'text-red-600',
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[status]}`} />
      <span className={`text-xs font-medium ${text[status]}`}>{message}</span>
    </div>
  )
}
