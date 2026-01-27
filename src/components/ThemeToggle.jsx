import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-track">
        <motion.div
          className="theme-toggle-thumb"
          animate={{
            x: isDarkMode ? 0 : 24,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? (
            <Moon size={14} className="theme-icon" />
          ) : (
            <Sun size={14} className="theme-icon" />
          )}
        </motion.div>
      </div>
    </motion.button>
  )
}

export default ThemeToggle