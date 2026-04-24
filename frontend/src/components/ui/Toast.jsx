import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Toast notification.
 * Auto-dismisses after `duration` ms.
 */
export default function Toast({ message, type = 'info', duration = 3500, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose?.() }, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  if (!visible || !message) return null

  const styles = {
    info:    'bg-white border-slate-200 text-slate-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }

  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
      flex items-center gap-3 px-4 py-3
      rounded-xl border shadow-lg text-sm font-medium
      animate-in slide-in-from-bottom-2
      ${styles[type]}
    `}>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); onClose?.() }} className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
