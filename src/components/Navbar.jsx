import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TouristModeToggle from './TouristModeToggle'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import CardNav from './CardNav'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { t } = useTranslation()
  const [cardNavOpen, setCardNavOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleCardNavToggle = () => {
    setCardNavOpen(!cardNavOpen)
  }

  const handleCardNavClose = () => {
    setCardNavOpen(false)
  }

  const handleAuthOpen = (mode) => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleAuthClose = () => {
    setAuthModalOpen(false)
  }

  return (
    <>
      <motion.nav
        className="sticky top-0 z-[1000] w-full px-sm py-sm md:px-md lg:px-lg bg-[#050505]/75 backdrop-blur-[24px] border-b border-white/5 shadow-[0_2px_16px_rgba(0,0,0,0.3)] data-[theme=light]:bg-white/85 data-[theme=light]:border-[#000000]/5 data-[theme=light]:shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-[60px] gap-sm md:gap-md lg:gap-lg">
          <Link to="/" className="font-serif text-[1.35rem] font-bold text-primary whitespace-nowrap transition-all duration-300">
            <motion.span 
              className="bg-gradient-to-br from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] data-[theme=light]:from-[#1F2937] data-[theme=light]:via-[#374151] data-[theme=light]:to-[#4B5563] data-[theme=light]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Aurangabad Flavors
            </motion.span>
          </Link>

          <div className="flex items-center gap-sm md:gap-md">
            <motion.button
              className="flex items-center justify-center p-xs md:p-sm bg-white/5 border border-white/10 rounded-md text-primary cursor-pointer transition-all duration-300 min-w-[44px] h-[44px] hover:bg-white/10 hover:border-[#8A2BE2]/40 hover:shadow-[0_0_20px_rgba(138,43,226,0.15)] hover:-translate-y-[1px] data-[theme=light]:bg-black/5 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-black/10 data-[theme=light]:hover:border-[#8A2BE2]/40 focus-visible:outline-2 focus-visible:outline-[#8A2BE2]/60 focus-visible:outline-offset-2"
              onClick={handleCardNavToggle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              aria-label={t('accessibility.openMenu')}
            >
              <Menu size={20} />
            </motion.button>

            <ThemeToggle />
            <TouristModeToggle />
            <LanguageSelector />

            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/explore?nearMe=true" className="flex items-center justify-center gap-xs p-sm lg:px-lg bg-white/5 border border-white/10 rounded-full text-primary font-sans text-[0.9rem] font-medium transition-all duration-300 whitespace-nowrap tracking-[0.01em] min-w-[44px] hover:bg-white/10 hover:border-[#8A2BE2]/40 hover:shadow-[0_0_24px_rgba(138,43,226,0.2)] hover:-translate-y-[2px] active:scale-98 active:-translate-y-[1px] focus-visible:outline-2 focus-visible:outline-[#8A2BE2]/60 focus-visible:outline-offset-2">
                <MapPin size={18} />
                <span className="hidden md:inline">{t('nav.nearMe')}</span>
              </Link>
            </motion.div>

            <motion.button
              className="flex items-center justify-center p-sm lg:px-lg min-w-[44px] min-h-[44px] sm:text-[0.8rem] md:text-[0.85rem] lg:text-[0.9rem] font-sans font-medium bg-white/5 border border-white/10 text-primary rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap tracking-[0.01em] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_16px_rgba(138,43,226,0.1)] data-[theme=light]:bg-black/5 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-black/10 data-[theme=light]:hover:border-black/20 focus-visible:outline-2 focus-visible:outline-[#8A2BE2]/60 focus-visible:outline-offset-2"
              onClick={() => handleAuthOpen('login')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {t('nav.login')}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <CardNav isOpen={cardNavOpen} onClose={handleCardNavClose} />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={handleAuthClose} 
        initialMode={authMode}
      />
    </>
  )
}

export default Navbar
