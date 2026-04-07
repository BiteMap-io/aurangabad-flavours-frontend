import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
    <>
      <style>
        {`
          @keyframes intro-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes intro-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
      <motion.div
        className="fixed inset-0 w-screen h-screen bg-background-primary z-[9999] flex items-center justify-center overflow-hidden data-[theme=light]:bg-background-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute rounded-full blur-[80px] opacity-15 animate-[intro-float_20s_ease-in-out_infinite] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[radial-gradient(circle,rgba(138,43,226,0.4)_0%,transparent_70%)] top-[-200px] left-[-200px] [animation-delay:0s] data-[theme=light]:bg-[radial-gradient(circle,rgba(138,43,226,0.2)_0%,transparent_70%)]" />
          <div className="absolute rounded-full blur-[80px] opacity-15 animate-[intro-float_20s_ease-in-out_infinite] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[radial-gradient(circle,rgba(138,43,226,0.3)_0%,transparent_70%)] bottom-[-250px] right-[-250px] [animation-delay:3s] data-[theme=light]:bg-[radial-gradient(circle,rgba(138,43,226,0.15)_0%,transparent_70%)]" />
          <div className="absolute rounded-full blur-[80px] opacity-15 animate-[intro-float_20s_ease-in-out_infinite] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[radial-gradient(circle,rgba(138,43,226,0.25)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation-delay:6s] data-[theme=light]:bg-[radial-gradient(circle,rgba(138,43,226,0.12)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center p-xl max-w-[900px]">
          <h1 className="text-[1.5rem] md:text-[2rem] lg:text-[3.5rem] font-bold text-primary m-0 font-['Playfair_Display',serif] leading-[1.2] tracking-[-0.02em] min-h-[1.8rem] md:min-h-[2.4rem] lg:min-h-[4.2rem] data-[theme=light]:text-primary data-[theme=light]:font-extrabold data-[theme=light]:min-h-[2.1rem] data-[theme=light]:md:min-h-[2.6rem]">
            {displayedText}
            <span className="inline-block ml-[2px] animate-[intro-blink_1s_step-end_infinite] text-accent-purple font-light data-[theme=light]:text-accent-purple">|</span>
          </h1>
          
          <motion.p 
            className="text-[0.9rem] md:text-[1rem] lg:text-[1.25rem] text-secondary mt-md font-normal tracking-[0.05em] min-h-[1.1rem] md:min-h-[1.2rem] lg:min-h-[1.5rem] data-[theme=light]:text-secondary data-[theme=light]:font-medium data-[theme=light]:min-h-[1.1rem] data-[theme=light]:md:min-h-[1.3rem]"
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
    </>
  )
}

export default WelcomeIntro
