import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-[999] w-11 h-11 flex items-center justify-center bg-accent-purple/10 border border-accent-purple/50 text-accent-purple rounded-full shadow-[0_4px_16px_rgba(124,58,237,0.2)] hover:bg-accent-purple/20 hover:border-accent-purple hover:shadow-glow hover:-translate-y-1 transition-all duration-200 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Back to top"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default BackToTop
