import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'

const TouristModeToggle = () => {
  const { isTouristMode, toggleTouristMode } = useTouristMode()

  return (
    <>
      <style>
        {`
          @keyframes tourist-pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 0 8px rgba(138, 43, 226, 0.4);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.2);
              box-shadow: 0 0 12px rgba(138, 43, 226, 0.6);
            }
          }
        `}
      </style>
      <motion.button
        className={`flex flex-row items-center gap-xs px-md py-sm bg-glass-surface border border-glass-border rounded-pill text-primary font-['Inter',sans-serif] text-[0.9rem] font-medium cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative tracking-[0.01em] hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary hover:shadow-glow focus-visible:outline-[2px] focus-visible:outline-accent-purple focus-visible:outline-offset-2 ${isTouristMode ? '!bg-accent-purple/15 !border-accent-purple/40 shadow-glow hover:!bg-accent-purple/20 hover:shadow-glow' : ''}`}
        onClick={toggleTouristMode}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isTouristMode ? 'Exit Tourist Mode' : 'Enable Tourist Mode'}
      >
        <Compass size={18} />
        <span className="text-[0.85rem] font-medium tracking-[0.01em] max-md:hidden">Tourist</span>
        {isTouristMode && <span className="w-[6px] h-[6px] bg-accent-purple rounded-full animate-[tourist-pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(138,43,226,0.4)]" />}
      </motion.button>
    </>
  )
}

export default TouristModeToggle
