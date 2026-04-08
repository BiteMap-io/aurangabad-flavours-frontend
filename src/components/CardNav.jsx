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
import TouristModeToggle from './TouristModeToggle'
import LanguageSelector from './LanguageSelector'

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
          className="fixed inset-0 bg-black/60 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-md md:p-md lg:p-lg outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            className="relative w-full max-w-[1000px] max-h-[85vh] md:max-h-[70vh] bg-background-primary/95 backdrop-blur-[24px] border border-glass-border rounded-xl shadow-glass overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              className="absolute top-md right-md lg:top-lg lg:right-lg bg-glass-surface border border-glass-border rounded-md text-primary w-10 h-10 lg:w-[44px] lg:h-[44px] flex items-center justify-center cursor-pointer transition-all duration-200 z-10 hover:bg-glass-hover hover:scale-105 focus-visible:outline-[2px] focus-visible:outline-accent-purple focus-visible:outline-offset-2"
              onClick={onClose}
              aria-label={t('accessibility.closeMenu')}
            >
              <X size={24} />
            </button>

            <div className="p-sm md:p-md lg:p-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-xl items-start md:min-h-[350px] lg:min-h-[300px]">
              {navigationGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.title}
                  className="flex flex-col gap-sm lg:gap-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: groupIndex * 0.1,
                    ease: 'easeOut' 
                  }}
                >
                  <h3 className="font-sans text-[0.65rem] md:text-[0.7rem] font-semibold text-tertiary uppercase tracking-[0.1em] mb-xs lg:mb-sm pl-sm m-0">
                    {group.title}
                  </h3>
                  <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-sm md:p-md lg:p-lg flex flex-col gap-sm h-full min-h-[140px] md:min-h-[160px] lg:min-h-[220px] xl:min-h-[220px] shadow-glass transition-all duration-300 hover:bg-glass-hover hover:shadow-glow hover:-translate-y-[2px]">
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
                            className={`group relative flex items-center gap-sm lg:gap-md p-xs px-sm md:p-sm lg:py-sm lg:px-md text-primary/85 no-underline font-sans text-[0.85rem] lg:text-[0.9rem] font-medium rounded-md transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] tracking-[0.01em] leading-[1.3] hover:text-primary hover:bg-glass-hover hover:translate-x-1 hover:shadow-glow focus-visible:outline-[2px] focus-visible:outline-accent-purple focus-visible:outline-offset-2 ${isActive ? '!text-primary !bg-accent-purple/15 border border-accent-purple/30 shadow-glow before:content-[\'\'] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[60%] before:bg-gradient-to-b before:from-transparent before:via-accent-purple before:to-transparent before:rounded-pill' : 'border border-transparent'}`}
                            onClick={onClose}
                          >
                            <Icon size={20} className={`shrink-0 transition-all duration-200 ${isActive ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'}`} />
                            <span className="font-medium whitespace-nowrap">{t(item.label)}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Mobile-only Preferences Section */}
              <motion.div
                className="flex flex-col gap-sm md:hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="font-sans text-[0.65rem] font-semibold text-tertiary uppercase tracking-[0.1em] mb-xs pl-sm m-0">
                  {t('cardNav.preferences')}
                </h3>
                <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-sm flex flex-col gap-sm shadow-glass">
                  <div className="flex items-center justify-between p-xs px-sm">
                    <span className="text-[0.85rem] text-secondary font-medium">{t('nav.touristMode')}</span>
                    <TouristModeToggle />
                  </div>
                  <div className="flex items-center justify-between p-xs px-sm">
                    <span className="text-[0.85rem] text-secondary font-medium">{t('nav.language')}</span>
                    <LanguageSelector />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CardNav