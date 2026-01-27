import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import './ConfirmModal.css'

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // danger, warning, info
}) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirm-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="confirm-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button className="confirm-modal-close" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="confirm-modal-content">
              <div className={`confirm-modal-icon ${type}`}>
                <AlertTriangle size={24} />
              </div>

              <div className="confirm-modal-text">
                <h3>{title}</h3>
                <p>{message}</p>
              </div>

              <div className="confirm-modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button 
                  className={`btn-${type}`} 
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal