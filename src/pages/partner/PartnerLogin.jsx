import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, Eye, EyeOff, Loader, Camera, Tag, BookOpen, Share2 } from 'lucide-react'
import { useUserAuth } from '../../context/UserAuthContext'

const PERKS = [
  { icon: BookOpen, text: 'Add your menu card and signature dishes' },
  { icon: Camera, text: 'Upload photos with our food-photography tips' },
  { icon: Tag, text: 'Run offers — student discounts, spend-based deals' },
  { icon: Share2, text: 'Get a shareable page with a rich preview card' },
]

const PartnerLogin = () => {
  const navigate = useNavigate()
  const { login, signup, isLoggedIn, isOwner } = useUserAuth()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    if (isLoggedIn && isOwner) navigate('/partner/dashboard', { replace: true })
  }, [isLoggedIn, isOwner, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    }

    setLoading(true)
    try {
      const result = mode === 'login'
        ? await login(form.email, form.password)
        : await signup(form.name, form.email, form.password, 'restaurant_owner')

      if (result.success) {
        navigate('/partner/dashboard')
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-primary">
      {/* ── Pitch side ── */}
      <div className="lg:w-1/2 flex flex-col justify-center px-md md:px-xl py-xl lg:py-0 bg-gradient-to-br from-accent-purple/15 via-background-primary to-background-primary">
        <div className="max-w-[480px] mx-auto lg:mx-0 lg:ml-auto lg:mr-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-glass-surface border border-glass-border text-accent-purple text-[0.85rem] font-semibold mb-md">
            <Store size={16} /> For Restaurant Owners
          </div>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-primary mb-sm font-['Playfair_Display',serif] leading-tight">
            List your restaurant on Aurangabad Flavours
          </h1>
          <p className="text-secondary text-[1.05rem] leading-relaxed mb-lg">
            Reach diners across the city. Submit your listing, get approved by our team, then manage everything from your own dashboard.
          </p>
          <div className="flex flex-col gap-sm">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-sm p-sm bg-glass-surface border border-glass-border rounded-md">
                <div className="w-9 h-9 rounded-md bg-accent-purple/15 flex items-center justify-center text-accent-purple shrink-0">
                  <perk.icon size={18} />
                </div>
                <span className="text-secondary text-[0.9rem]">{perk.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className="lg:w-1/2 flex items-center justify-center px-md py-xl">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-[1.5rem] font-bold text-primary mb-xs">
            {mode === 'login' ? 'Partner Login' : 'Create Your Partner Account'}
          </h2>
          <p className="text-secondary text-[0.95rem] mb-lg">
            {mode === 'login' ? 'Sign in to manage your restaurant' : 'Get started in a couple of minutes'}
          </p>

          <form className="flex flex-col gap-sm" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="flex flex-col gap-xs">
                <label className="text-[0.9rem] font-medium text-primary">Restaurant owner name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange} required
                  placeholder="Your full name"
                  className="p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                />
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="text-[0.9rem] font-medium text-primary">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@restaurant.com"
                className="p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-[0.9rem] font-medium text-primary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                />
                <button type="button" className="absolute right-md top-1/2 -translate-y-1/2 bg-transparent border-none text-secondary cursor-pointer p-0 flex items-center justify-center hover:text-primary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-xs">
                <label className="text-[0.9rem] font-medium text-primary">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full p-md bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-accent-purple focus:shadow-glow placeholder:text-secondary"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full p-md bg-accent-purple border-none rounded-pill text-white text-[1rem] font-semibold cursor-pointer transition-all duration-300 mt-xs hover:bg-accent-purple/90 hover:shadow-glow disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading && <Loader size={16} className="animate-spin" />}
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>

            {error && <p className="text-red-400 text-[0.85rem] text-center mt-xs">{error}</p>}
          </form>

          <div className="text-center mt-md pt-md border-t border-glass-border">
            {mode === 'login' ? (
              <p className="text-secondary text-[0.9rem] m-0">
                New here?{' '}
                <button type="button" className="bg-transparent border-none text-accent-purple font-semibold cursor-pointer" onClick={() => { setMode('signup'); setError('') }}>
                  List your restaurant
                </button>
              </p>
            ) : (
              <p className="text-secondary text-[0.9rem] m-0">
                Already a partner?{' '}
                <button type="button" className="bg-transparent border-none text-accent-purple font-semibold cursor-pointer" onClick={() => { setMode('login'); setError('') }}>
                  Log in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PartnerLogin
