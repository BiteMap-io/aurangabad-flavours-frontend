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
import './Navbar.css'

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
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <motion.span 
              className="logo-text"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Aurangabad Flavors
            </motion.span>
          </Link>

          <div className="navbar-actions">
            <motion.button
              className="explore-btn"
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
              <Link to="/explore?nearMe=true" className="near-me-btn">
                <MapPin size={18} />
                <span>{t('nav.nearMe')}</span>
              </Link>
            </motion.div>

            <motion.button
              className="auth-btn login-btn"
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


