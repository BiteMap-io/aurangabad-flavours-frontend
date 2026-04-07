import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

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

  const getIconClass = () => {
    if (type === 'danger') return 'bg-red-500/10 text-red-500'
    if (type === 'warning') return 'bg-amber-500/10 text-amber-500'
    if (type === 'info') return 'bg-blue-500/10 text-blue-500'
    return ''
  }

  const getBtnClass = () => {
    if (type === 'danger') return 'bg-gradient-to-br from-red-500 to-red-600 hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
    if (type === 'warning') return 'bg-gradient-to-br from-amber-500 to-amber-600 hover:shadow-[0_4px_15px_rgba(245,158,11,0.3)]'
    if (type === 'info') return 'bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)]'
    return ''
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[9999] flex items-center justify-center p-6 max-[480px]:p-4 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative w-full max-w-[400px] bg-[#111118] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden data-[theme=light]:bg-white/95 data-[theme=light]:border-black/10 data-[theme=light]:shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button className="absolute top-4 right-4 w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 z-10 hover:text-gray-100 hover:bg-white/10 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white/100" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="p-8 text-center max-[480px]:p-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${getIconClass()}`}>
                <AlertTriangle size={24} />
              </div>

              <div className="mb-8">
                <h3 className="text-[1.25rem] font-semibold text-gray-100 m-0 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed m-0 text-[1rem]">{message}</p>
              </div>

              <div className="flex gap-2 justify-center max-[480px]:flex-col">
                <button 
                  className="py-2 px-6 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] font-medium cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white max-[480px]:w-full" 
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button 
                  className={`py-2 px-6 border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-[1px] max-[480px]:w-full ${getBtnClass()}`} 
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