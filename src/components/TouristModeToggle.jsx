import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import './TouristModeToggle.css'

const TouristModeToggle = () => {
  const { isTouristMode, toggleTouristMode } = useTouristMode()

  return (
    <motion.button
      className={`tourist-mode-toggle ${isTouristMode ? 'active' : ''}`}
      onClick={toggleTouristMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isTouristMode ? 'Exit Tourist Mode' : 'Enable Tourist Mode'}
    >
      <Compass size={18} />
      <span className="tourist-mode-label">Tourist</span>
      {isTouristMode && <span className="tourist-mode-indicator" />}
    </motion.button>
  )
}

export default TouristModeToggle
