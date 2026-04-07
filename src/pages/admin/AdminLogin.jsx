import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAdminAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData)

    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }

    setLoading(false)
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .admin-login-card-fx::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 2px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.6;
            pointer-events: none;
          }
        `}
      </style>
      <div className="min-h-screen flex items-center justify-center p-10 max-md:p-6 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.15),transparent_40%),linear-gradient(135deg,#05070f_0%,#0b1020_100%)] data-[theme=light]:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.15),transparent_40%),linear-gradient(135deg,#f8fafc,#e2e8f0)] font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#f8fafc]">
        <div className="w-full max-w-[520px] animate-[fadeUp_0.8s_ease_forwards] [@media(min-width:1600px)]:max-w-[600px] max-lg:max-w-[480px] max-md:max-w-[440px] max-[360px]:max-w-full">
          <motion.div
            className="admin-login-card-fx relative bg-white/5 border border-white/10 rounded-[28px] p-10 max-lg:p-8 max-md:p-6 max-md:rounded-[20px] [@media(min-width:1600px)]:p-12 backdrop-blur-[25px] shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:shadow-[0_30px_60px_rgba(0,0,0,0.15)] group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-[72px] h-[72px] mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white shadow-[0_0_25px_rgba(139,92,246,0.6),0_0_50px_rgba(236,72,153,0.4)] max-md:w-[64px] max-md:h-[64px] max-[480px]:w-[56px] max-[480px]:h-[56px]">
                <Lock size={32} />
              </div>
              <h1 className="text-[1.9rem] font-bold tracking-[0.5px] m-0 mb-1 [@media(min-width:1600px)]:text-[2.2rem] max-lg:text-[1.7rem] max-[480px]:text-[1.4rem] max-[360px]:text-[1.25rem]">Admin Panel</h1>
              <p className="text-[0.95rem] text-slate-400">Aurangabad Flavors Management</p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  className="py-[0.75rem] px-[1rem] rounded-2xl text-center bg-red-500/10 border border-red-500/30 text-red-300 text-[0.85rem] overflow-hidden data-[theme=light]:text-red-600"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] tracking-[0.3px] text-slate-400 data-[theme=light]:text-slate-600" htmlFor="email">Email Address</label>
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="w-full py-[0.9rem] pr-[3rem] pl-[3rem] bg-white/5 border border-white/10 rounded-2xl text-gray-100 text-[0.95rem] transition-all duration-250 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2),0_0_20px_rgba(139,92,246,0.3)] focus:bg-white/5 data-[theme=light]:bg-white/90 data-[theme=light]:text-gray-900 max-[480px]:py-[0.7rem] max-[480px]:px-[2.8rem] placeholder-slate-400/70"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@aurangabadflavors.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] tracking-[0.3px] text-slate-400 data-[theme=light]:text-slate-600" htmlFor="password">Password</label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="w-full py-[0.9rem] pr-[3rem] pl-[3rem] bg-white/5 border border-white/10 rounded-2xl text-gray-100 text-[0.95rem] transition-all duration-250 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2),0_0_20px_rgba(139,92,246,0.3)] focus:bg-white/5 data-[theme=light]:bg-white/90 data-[theme=light]:text-gray-900 max-[480px]:py-[0.7rem] max-[480px]:px-[2.8rem] placeholder-slate-400/70"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-[1rem] top-1/2 -translate-y-1/2 bg-none border-none text-slate-400 bg-transparent cursor-pointer transition-transform duration-200 flex items-center justify-center p-0 hover:text-gray-100 hover:scale-110"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-[0.95rem] rounded-2xl border-none bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[1rem] font-bold tracking-[0.5px] cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(139,92,246,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(236,72,153,0.5)] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none max-[480px]:py-[0.75rem] max-[480px]:text-[0.9rem]"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-[0.8rem] text-center text-blue-300">
                <strong className="block mb-1">Demo Credentials:</strong>
                Email: admin@aurangabadflavors.com<br />
                Password: admin123
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default AdminLogin