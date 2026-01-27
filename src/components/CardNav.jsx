import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Compass, 
  MapPin, 
  Utensils, 
  BookOpen, 
  ChefHat, 
  Star, 
  Calendar,
  Info,
  Phone,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './CardNav.css'

const CardNav = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { t } = useTranslation()

  const navigationGroups = [
    {
      title: t('cardNav.exploreGroup'),
      items: [
        { path: '/', label: 'nav.home', icon: Home },
        { path: '/explore', label: 'nav.explore', icon: Compass },
        { path: '/map', label: 'nav.map', icon: MapPin },
        { path: '/food-culture', label: 'nav.foodCulture', icon: Utensils },
      ]
    },
    {
      title: t('cardNav.discoverGroup'),
      items: [
        { path: '/articles', label: 'nav.articles', icon: BookOpen },
        { path: '/cuisines', label: 'nav.cuisines', icon: ChefHat },
        { path: '/top-picks', label: 'nav.topPicks', icon: Star },
        { path: '/events', label: 'nav.events', icon: Calendar },
      ]
    },
    {
      title: t('cardNav.infoGroup'),
      items: [
        { path: '/about', label: 'nav.about', icon: Info },
        { path: '/contact', label: 'nav.contact', icon: Phone },
      ]
    }
  ]

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="card-nav-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            className="card-nav-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              className="card-nav-close"
              onClick={onClose}
              aria-label={t('accessibility.closeMenu')}
            >
              <X size={24} />
            </button>

            <div className="card-nav-content">
              {navigationGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.title}
                  className="nav-card-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: groupIndex * 0.1,
                    ease: 'easeOut' 
                  }}
                >
                  <h3 className="group-title">{group.title}</h3>
                  <div className="nav-card">
                    {group.items.map((item, itemIndex) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path
                      
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: (groupIndex * 0.1) + (itemIndex * 0.05),
                            ease: 'easeOut' 
                          }}
                        >
                          <Link
                            to={item.path}
                            className={`nav-card-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                          >
                            <Icon size={20} className="nav-item-icon" />
                            <span className="nav-item-label">{t(item.label)}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CardNav