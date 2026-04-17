import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUserAuth } from '../context/UserAuthContext'

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useTranslation()
  const { login, signup } = useUserAuth()
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    rememberMe: false, acceptTerms: false
  })

  useEffect(() => { setMode(initialMode) }, [initialMode])

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '', rememberMe: false, acceptTerms: false })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setError('')
    }
  }, [isOpen, mode])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'join') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setLoading(true)
    try {
      const result = mode === 'login'
        ? await login(formData.email, formData.password)
        : await signup(formData.name, formData.email, formData.password)

      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '', rememberMe: false, acceptTerms: false })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-[8px] z-[9999] flex flex-col md:flex-row items-center justify-center p-sm md:p-md lg:p-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          className="relative w-full max-w-[420px] max-h-[98vh] md:max-h-[95vh] bg-background-primary/95 backdrop-blur-[24px] border border-glass-border rounded-xl shadow-glass overflow-y-auto overflow-x-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button
            className="absolute top-md right-md lg:top-lg lg:right-lg bg-glass-surface border border-glass-border rounded-md text-primary w-9 h-9 md:w-10 md:h-10 flex items-center justify-center cursor-pointer transition-all duration-200 z-10 hover:bg-glass-hover hover:scale-105"
            onClick={onClose}
            aria-label={t('accessibility.closeModal')}
          >
            <X size={20} />
          </button>

          <div className="p-sm pt-[calc(1rem+20px)] md:p-md md:pt-[calc(1.5rem+20px)] lg:p-xl lg:pt-[calc(2rem+20px)] min-h-fit">
            <div className="text-center mb-md lg:mb-lg">
              <h2 className="text-[1.25rem] md:text-[1.5rem] lg:text-[1.75rem] font-bold text-primary mb-sm font-['Playfair_Display',serif]">
                {mode === 'login' ? t('auth.login') : t('auth.join')}
              </h2>
              <p className="text-secondary text-[0.95rem] m-0">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
              </p>
            </div>

            <form className="flex flex-col gap-sm lg:gap-md" onSubmit={handleSubmit}>
              {mode === 'join' && (
                <div className="flex flex-col gap-xs">
                  <label htmlFor="name" className="text-[0.9rem] font-medium text-primary">{t('auth.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('auth.name')}
                    className="p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-xs">
                <label htmlFor="email" className="text-[0.9rem] font-medium text-primary">{t('auth.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('auth.email')}
                  className="p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label htmlFor="password" className="text-[0.9rem] font-medium text-primary">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('auth.password')}
                    className="w-full p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-md top-1/2 -translate-y-1/2 bg-transparent border-none text-secondary cursor-pointer p-0 flex items-center justify-center transition-colors duration-200 hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'join' && (
                <div className="flex flex-col gap-xs">
                  <label htmlFor="confirmPassword" className="text-[0.9rem] font-medium text-primary">{t('auth.confirmPassword')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t('auth.confirmPassword')}
                      className="w-full p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-md top-1/2 -translate-y-1/2 bg-transparent border-none text-secondary cursor-pointer p-0 flex items-center justify-center transition-colors duration-200 hover:text-primary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-sm">
                  <label className="flex items-center gap-xs cursor-pointer text-[0.9rem]">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 m-0 bg-transparent border border-glass-border rounded focus:ring-accent-purple"
                    />
                    <span className="text-secondary select-none">{t('auth.rememberMe')}</span>
                  </label>
                  <button type="button" className="bg-transparent border-none text-accent-purple text-[0.9rem] cursor-pointer no-underline transition-opacity duration-200 hover:opacity-80">
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              {mode === 'join' && (
                <div className="flex flex-col gap-xs mt-1">
                  <label className="flex items-start gap-xs cursor-pointer text-[0.9rem]">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="w-4 h-4 mt-[0.15rem] m-0 bg-transparent border border-glass-border rounded focus:ring-accent-purple"
                      required
                    />
                    <span className="text-secondary select-none leading-tight">
                      {t('auth.terms')}
                    </span>
                  </label>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full p-md lg:px-lg lg:py-md bg-accent-purple border-none rounded-pill text-white text-[1rem] font-semibold cursor-pointer transition-all duration-300 mt-xs hover:bg-accent-purple/90 hover:shadow-glow hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-sm">
                {loading && <Loader size={16} className="animate-spin" />}
                {mode === 'login' ? t('auth.login') : t('auth.createAccount')}
              </button>

              {error && (
                <p className="text-red-400 text-[0.85rem] text-center mt-xs">{error}</p>
              )}
            </form>

            <div className="text-center mt-md pt-md border-t border-glass-border">
              {mode === 'login' ? (
                <p className="text-secondary text-[0.9rem] m-0">
                  {t('auth.newHere')}{' '}
                  <button
                    type="button"
                    className="bg-transparent border-none text-accent-purple text-[0.9rem] font-semibold cursor-pointer no-underline transition-opacity duration-200 hover:opacity-80"
                    onClick={() => switchMode('join')}
                  >
                    {t('auth.join')}
                  </button>
                </p>
              ) : (
                <p className="text-secondary text-[0.9rem] m-0">
                  {t('auth.alreadyAccount')}{' '}
                  <button
                    type="button"
                    className="bg-transparent border-none text-accent-purple text-[0.9rem] font-semibold cursor-pointer no-underline transition-opacity duration-200 hover:opacity-80"
                    onClick={() => switchMode('login')}
                  >
                    {t('auth.login')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal