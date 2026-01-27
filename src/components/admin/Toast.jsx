import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import './Toast.css'

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

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast toast-${toast.type}`}
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="toast-icon">
            {getIcon()}
          </div>
          <div className="toast-content">
            <h4>{toast.title}</h4>
            {toast.message && <p>{toast.message}</p>}
          </div>
          <button className="toast-close" onClick={handleClose}>
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
    <div className="toast-container">
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