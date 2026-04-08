import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <motion.button
      className="group bg-transparent border-none cursor-pointer p-0 flex items-center justify-center outline-none"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="w-[48px] h-[24px] bg-glass-surface border border-glass-border rounded-pill relative backdrop-blur-[20px] transition-all duration-300 group-hover:bg-glass-hover group-hover:border-white/20 group-hover:shadow-[0_0_12px_rgba(138,43,226,0.3)] data-[theme=light]:group-hover:shadow-[0_0_12px_rgba(201,162,77,0.4)]">
        <motion.div
          className="w-[20px] h-[20px] bg-accent-purple rounded-full absolute top-[1px] left-[2px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)] data-[theme=light]:bg-accent-gold"
          animate={{
            x: isDarkMode ? 0 : 24,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? (
            <Moon size={14} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          ) : (
            <Sun size={14} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          )}
        </motion.div>
      </div>
    </motion.button>
  )
}

export default ThemeToggle