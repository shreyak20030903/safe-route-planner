/**
 * Reusable Badge component.
 * variant: 'safe' | 'fastest' | 'high' | 'medium' | 'low' | 'info'
 */
export default function Badge({ children, variant = 'info', className = '' }) {
  const styles = {
    safe:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
    fastest: 'bg-blue-100 text-blue-700 border border-blue-200',
    high:    'bg-red-100 text-red-600 border border-red-200',
    medium:  'bg-amber-100 text-amber-700 border border-amber-200',
    low:     'bg-green-100 text-green-700 border border-green-200',
    info:    'bg-slate-100 text-slate-600 border border-slate-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
