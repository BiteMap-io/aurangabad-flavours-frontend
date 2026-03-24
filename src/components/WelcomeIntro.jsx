import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './WelcomeIntro.css'

const WelcomeIntro = () => {
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro for 7 days after the first visit
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const firstVisit = localStorage.getItem('welcomeIntro_firstVisit')
    const now = Date.now()

    if (!firstVisit) {
      localStorage.setItem('welcomeIntro_firstVisit', now.toString())
      return true
    }

    const timePassed = now - parseInt(firstVisit, 10)
    return timePassed < SEVEN_DAYS_MS
  })

  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSubtitle, setShowSubtitle] = useState(false)
  
  const fullText = "Welcome to Aurangabad Flavors"
  const typingSpeed = 100 // milliseconds per character

  useEffect(() => {
    if (!showIntro) return

    // Typing animation effect
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, typingSpeed)
      return () => clearTimeout(timer)
    } else {
      // Show subtitle after typing is complete
      const subtitleTimer = setTimeout(() => {
        setShowSubtitle(true)
      }, 300)
      
      // Auto-hide after typing completes + 2 seconds
      const hideTimer = setTimeout(() => {
        try {
          sessionStorage.setItem('introShown', 'true')
        } catch {
          // Ignore storage errors
        }
        setShowIntro(false)
      }, 2500)

      return () => {
        clearTimeout(subtitleTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [showIntro, currentIndex, fullText.length])

  if (!showIntro) return null

  return (
    <motion.div
      className="welcome-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="intro-background">
        <div className="intro-gradient-1" />
        <div className="intro-gradient-2" />
        <div className="intro-gradient-3" />
      </div>

      <div className="intro-content">
        <h1 className="intro-text">
          {displayedText}
          <span className="intro-cursor">|</span>
        </h1>
        
        <motion.p 
          className="intro-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showSubtitle ? 1 : 0, 
            y: showSubtitle ? 0 : 20 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Your guide to culinary excellence
        </motion.p>
      </div>
    </motion.div>
  )
}

export default WelcomeIntro
