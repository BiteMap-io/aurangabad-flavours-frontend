import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

let toastId = 0

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <XCircle size={20} />
      case 'warning':
        return <AlertCircle size={20} />
      default:
        return <Info size={20} />
    }
  }

  const getTypeStyle = () => {
    switch (toast.type) {
      case 'success': return 'border-l-[4px] !border-l-emerald-500'
      case 'error': return 'border-l-[4px] !border-l-red-500'
      case 'warning': return 'border-l-[4px] !border-l-amber-500'
      default: return 'border-l-[4px] !border-l-blue-500'
    }
  }

  const getIconColor = () => {
    switch (toast.type) {
      case 'success': return 'text-emerald-500'
      case 'error': return 'text-red-500'
      case 'warning': return 'text-amber-500'
      default: return 'text-blue-500'
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           className={`flex items-start gap-2 min-w-[320px] max-w-[400px] p-4 bg-[#111118] border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[20px] pointer-events-auto data-[theme=light]:bg-white/95 data-[theme=light]:border-black/10 data-[theme=light]:shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-[480px]:min-w-0 max-[480px]:max-w-none ${getTypeStyle()} font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]`}
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className={`shrink-0 mt-0.5 ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[0.9rem] font-semibold text-gray-100 m-0 mb-1 leading-tight">{toast.title}</h4>
            {toast.message && <p className="text-[0.8rem] text-gray-500 m-0 leading-[1.4]">{toast.message}</p>}
          </div>
          <button className="shrink-0 bg-transparent border-none text-gray-500 cursor-pointer p-1 rounded transition-all duration-200 -mt-0.5 hover:text-gray-100 hover:bg-white/10 data-[theme=light]:hover:bg-black/5" onClick={handleClose}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (event) => {
      const newToast = {
        id: ++toastId,
        ...event.detail
      }
      setToasts(prev => [...prev, newToast])
    }

    window.addEventListener('show-toast', handleToast)
    return () => window.removeEventListener('show-toast', handleToast)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-2 pointer-events-none max-[480px]:top-4 max-[480px]:right-4 max-[480px]:left-4">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Toast utility functions
export const showToast = {
  success: (title, message, duration) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'success', title, message, duration }
    }))
  },
  error: (title, message, duration) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'error', title, message, duration }
    }))
  },
  warning: (title, message, duration) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'warning', title, message, duration }
    }))
  },
  info: (title, message, duration) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'info', title, message, duration }
    }))
  }
}

export default ToastContainer