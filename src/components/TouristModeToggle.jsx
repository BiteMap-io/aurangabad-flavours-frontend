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
        className={`flex flex-row items-center gap-xs px-md py-sm bg-white/5 border border-white/10 rounded-pill text-white/80 font-['Inter',sans-serif] text-[0.9rem] font-medium cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative tracking-[0.01em] hover:bg-white/10 hover:border-white/12 hover:text-primary hover:shadow-[0_0_16px_rgba(138,43,226,0.1)] focus-visible:outline-[2px] focus-visible:outline-accent-purple focus-visible:outline-offset-2 data-[theme=light]:bg-black/5 data-[theme=light]:border-[#e5e7eb] data-[theme=light]:text-secondary data-[theme=light]:hover:bg-black/10 data-[theme=light]:hover:border-[#d1d5db] data-[theme=light]:hover:text-primary data-[theme=light]:hover:shadow-[0_0_16px_rgba(138,43,226,0.1)] ${isTouristMode ? '!bg-[#8a2be2]/15 !border-[#8a2be2]/40 !text-primary shadow-[0_0_20px_rgba(138,43,226,0.2)] hover:!bg-[#8a2be2]/20 hover:shadow-[0_0_24px_rgba(138,43,226,0.3)] data-[theme=light]:!bg-[#8a2be2]/10 data-[theme=light]:!border-[#8a2be2]/30 data-[theme=light]:shadow-[0_0_20px_rgba(138,43,226,0.15)] data-[theme=light]:hover:!bg-[#8a2be2]/15 data-[theme=light]:hover:!border-[#8a2be2]/40 data-[theme=light]:hover:shadow-[0_0_24px_rgba(138,43,226,0.2)]' : ''}`}
        onClick={toggleTouristMode}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isTouristMode ? 'Exit Tourist Mode' : 'Enable Tourist Mode'}
      >
        <Compass size={18} />
        <span className="text-[0.85rem] font-medium tracking-[0.01em] data-[theme=light]:text-inherit data-[theme=light]:font-medium max-md:hidden">Tourist</span>
        {isTouristMode && <span className="w-[6px] h-[6px] bg-accent-purple rounded-full animate-[tourist-pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(138,43,226,0.4)] data-[theme=light]:bg-accent-purple data-[theme=light]:shadow-[0_0_8px_rgba(138,43,226,0.3)]" />}
      </motion.button>
    </>
  )
}

export default TouristModeToggle
