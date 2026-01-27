import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useTranslation()
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false
  })

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        acceptTerms: false
      })
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [isOpen, mode])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement actual auth logic
    console.log('Auth submission:', { mode, formData })
    onClose()
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      acceptTerms: false
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="auth-modal-container"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button
            className="auth-modal-close"
            onClick={onClose}
            aria-label={t('accessibility.closeModal')}
          >
            <X size={20} />
          </button>

          <div className="auth-modal-content">
            <div className="auth-modal-header">
              <h2>{mode === 'login' ? t('auth.login') : t('auth.join')}</h2>
              <p>{mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'join' && (
                <div className="form-group">
                  <label htmlFor="name">{t('auth.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('auth.name')}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">{t('auth.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('auth.email')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('auth.password')}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'join' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t('auth.confirmPassword')}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">{t('auth.rememberMe')}</span>
                  </label>
                  <button type="button" className="forgot-password">
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              {mode === 'join' && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkbox-text">
                      {t('auth.terms')}
                    </span>
                  </label>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                {mode === 'login' ? t('auth.login') : t('auth.createAccount')}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'login' ? (
                <p>
                  {t('auth.newHere')}{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => switchMode('join')}
                  >
                    {t('auth.join')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('auth.alreadyAccount')}{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
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