import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Menu, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TouristModeToggle from './TouristModeToggle'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import CardNav from './CardNav'
import AuthModal from './AuthModal'
import { useUserAuth } from '../context/UserAuthContext'

const Navbar = () => {
  const { t } = useTranslation()
  const { user, isLoggedIn, logout } = useUserAuth()
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
        className="sticky top-0 z-[1000] w-full px-sm py-sm md:px-md lg:px-lg bg-background-primary/75 backdrop-blur-[24px] border-b border-glass-border shadow-glass"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-[60px] gap-sm md:gap-md lg:gap-lg">
          <Link to="/" className="font-serif text-[1.35rem] font-bold text-primary whitespace-nowrap transition-all duration-300">
            <motion.span 
              className="bg-gradient-to-br from-primary via-accent-purple to-secondary bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] light:drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Aurangabad Flavors
            </motion.span>
          </Link>

          <div className="flex items-center gap-xs md:gap-md">
            {/* Desktop-only Toggles */}
            <div className="hidden md:flex items-center gap-sm">
              <TouristModeToggle />
              <LanguageSelector />
            </div>

            <ThemeToggle />

            <motion.button
              className="flex items-center justify-center p-xs md:p-sm bg-glass-surface border border-glass-border rounded-md text-primary cursor-pointer transition-all duration-300 min-w-[40px] md:min-w-[44px] h-[40px] md:h-[44px] hover:bg-glass-hover hover:border-accent-purple/40 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-accent-purple/60 focus-visible:outline-offset-2"
              onClick={handleCardNavToggle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              aria-label={t('accessibility.openMenu')}
            >
              <Menu size={20} />
            </motion.button>

            <motion.div
              className="hidden sm:block"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/explore?nearMe=true" className="flex items-center justify-center gap-xs p-sm lg:px-lg bg-glass-surface border border-glass-border rounded-full text-primary font-sans text-[0.85rem] lg:text-[0.9rem] font-medium transition-all duration-300 whitespace-nowrap tracking-[0.01em] hover:bg-glass-hover hover:border-accent-purple/40 hover:shadow-glow hover:-translate-y-[2px] active:scale-98 active:-translate-y-[1px] focus-visible:outline-2 focus-visible:outline-accent-purple/60 focus-visible:outline-offset-2">
                <MapPin size={18} />
                <span className="hidden lg:inline">{t('nav.nearMe')}</span>
              </Link>
            </motion.div>

            {isLoggedIn ? (
              <div className="flex items-center gap-xs">
                <div className="flex items-center gap-xs px-sm py-1 bg-glass-surface border border-glass-border rounded-full text-[0.82rem] text-primary">
                  <User size={14} className="text-accent-purple" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || user?.email}</span>
                </div>
                <motion.button
                  className="flex items-center gap-1 p-sm bg-glass-surface border border-glass-border rounded-full text-secondary cursor-pointer transition-all duration-200 hover:text-red-400 hover:border-red-400/40"
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-xs">
                <motion.button
                  className="flex items-center justify-center p-sm px-md lg:px-lg sm:text-[0.8rem] md:text-[0.85rem] lg:text-[0.9rem] font-sans font-medium bg-glass-surface border border-glass-border text-primary rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap tracking-[0.01em] hover:bg-glass-hover hover:border-glass-border hover:shadow-glow"
                  onClick={() => handleAuthOpen('login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('nav.login')}
                </motion.button>
                <motion.button
                  className="hidden sm:flex items-center justify-center p-sm px-md text-[0.85rem] font-sans font-medium bg-accent-purple text-white rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-accent-purple/80 hover:shadow-glow"
                  onClick={() => handleAuthOpen('join')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join
                </motion.button>
              </div>
            )}
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
