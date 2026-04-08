import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, Calendar, FileText, Eye, Plus, TrendingUp, 
  Loader, ArrowUpRight, Activity, Sparkles, Star, Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } })
}

const AdminDashboard = () => {
  const { adminUser } = useAdminAuth()
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboardData() }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRaw, activitiesRaw] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivity()
      ])

      if (statsRaw.status === 'fulfilled' && statsRaw.value) {
        const d = statsRaw.value.data || statsRaw.value
        setStats({
          restaurants: d.totalRestaurants ?? d.totalHotels ?? 0,
          events: d.totalEvents ?? d.activeEvents ?? 0,
          articles: d.totalArticles ?? d.publishedArticles ?? 0,
          views: d.monthlyViews ?? d.totalViews ?? 0,
        })
      }

      if (activitiesRaw.status === 'fulfilled' && Array.isArray(activitiesRaw.value?.data || activitiesRaw.value)) {
        setRecentActivities(activitiesRaw.value?.data || activitiesRaw.value)
      }
    } catch (_) {
      // silently fail — stats are cosmetic
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Restaurants',
      value: stats?.restaurants ?? '—',
      icon: Building2,
      color: '#a855f7',
      glow: 'rgba(168,85,247,0.15)',
      link: '/admin/hotels',
      change: '+3 this month'
    },
    {
      label: 'Events',
      value: stats?.events ?? '—',
      icon: Calendar,
      color: '#22d3ee',
      glow: 'rgba(34,211,238,0.15)',
      link: '/admin/events',
      change: '+2 this month'
    },
    {
      label: 'Articles',
      value: stats?.articles ?? '—',
      icon: FileText,
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.15)',
      link: '/admin/articles',
      change: '+12 this month'
    },
    {
      label: 'Monthly Views',
      value: stats?.views ? stats.views.toLocaleString() : '—',
      icon: Eye,
      color: '#10b981',
      glow: 'rgba(16,185,129,0.15)',
      link: null,
      change: '+8.2%'
    }
  ]

  const quickActions = [
    { label: 'Add Restaurant', icon: Building2, to: '/admin/hotels/add', color: '#a855f7' },
    { label: 'Create Event', icon: Calendar, to: '/admin/events/add', color: '#22d3ee' },
    { label: 'Write Article', icon: FileText, to: '/admin/articles/add', color: '#f59e0b' },
    { label: 'Upload Media', icon: Plus, to: '/admin/media', color: '#10b981' },
  ]

  const activityIcon = (type) => {
    if (type === 'restaurant' || type === 'hotel') return <Building2 size={14} />
    if (type === 'event') return <Calendar size={14} />
    if (type === 'article') return <FileText size={14} />
    return <Activity size={14} />
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getIconClasses = (type) => {
    if (type === 'event') return 'bg-[rgba(34,211,238,0.1)] text-[#22d3ee]'
    if (type === 'article') return 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]'
    return 'bg-[rgba(168,85,247,0.1)] text-[#a855f7]'
  }

  return (
    <div className="p-0 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[0.9rem] text-gray-500 m-0 mb-1">{getGreeting()}, {adminUser?.name || 'Admin'} 👋</p>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 tracking-[-0.02em]">Dashboard Overview</h1>
        </div>
        <div className="flex items-center gap-1.5 py-[0.35rem] px-[0.9rem] bg-green-500/10 border border-green-500/25 rounded-full text-[0.8rem] text-green-400 font-semibold">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-[pulse_2s_infinite_ease-in-out]" />
          <span>Live</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[300px] gap-4 text-gray-500">
          <Loader size={40} className="animate-spin text-purple-500" />
          <p className="m-0">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-5 mb-8 max-xl:grid-cols-2 max-[600px]:grid-cols-1">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  className="bg-[#111118] border border-white/5 rounded-[1.25rem] p-6 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:-translate-y-[3px] group"
                  style={{ '--card-color': card.color, '--card-glow': card.glow }}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  custom={i}
                >
                  <div className="absolute inset-0 bg-[var(--card-glow)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" 
                    style={{ boxShadow: '0 8px 30px var(--card-glow)' }}
                  />
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border relative z-10" style={{ background: card.glow, borderColor: card.color, color: card.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex flex-col gap-[0.2rem] relative z-10">
                    <span className="text-[2rem] font-extrabold text-gray-100 leading-none tracking-[-0.02em]">{card.value}</span>
                    <span className="text-[0.82rem] text-gray-500 font-medium">{card.label}</span>
                  </div>
                  <div className="flex items-center gap-[0.35rem] text-[0.78rem] text-green-400 mt-auto relative z-10">
                    <TrendingUp size={12} />
                    <span>{card.change}</span>
                    {card.link && (
                      <Link to={card.link} className="ml-auto flex flex-shrink-0 items-center no-underline transition-opacity duration-200 opacity-70 hover:opacity-100" style={{ color: card.color }}>
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Body Grid */}
          <div className="grid grid-cols-2 gap-5 mb-8 max-[900px]:grid-cols-1">
            {/* Quick Actions */}
            <motion.div
              className="bg-[#111118] border border-white/5 rounded-[1.25rem] p-6 flex flex-col gap-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div>
                <h2 className="text-[1rem] font-bold text-gray-100 m-0 mb-[0.2rem]">Quick Actions</h2>
                <p className="text-[0.8rem] text-gray-500 m-0">Jump to common tasks</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="group flex items-center gap-3 py-[0.9rem] px-4 bg-white/5 border border-white/10 rounded-[0.875rem] no-underline text-gray-300 text-[0.875rem] font-medium transition-all duration-[0.18s] relative overflow-hidden focus:outline-none"
                      style={{ '--action-color': action.color }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = action.color
                        e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.04)'
                        e.currentTarget.style.color = '#f3f4f6'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.color = '#d1d5db'
                        e.currentTarget.style.transform = 'none'
                      }}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-white/5 flex items-center justify-center shrink-0 transition-colors" style={{ color: action.color }}>
                        <Icon size={20} />
                      </div>
                      <span>{action.label}</span>
                      <ArrowUpRight size={14} className="ml-auto opacity-0 transition-opacity duration-[0.18s] group-hover:opacity-100" style={{ color: action.color }} />
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-[#111118] border border-white/5 rounded-[1.25rem] p-6 flex flex-col gap-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div>
                <h2 className="text-[1rem] font-bold text-gray-100 m-0 mb-[0.2rem]">Recent Activity</h2>
                <p className="text-[0.8rem] text-gray-500 m-0">Latest updates across the platform</p>
              </div>
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-8 text-gray-700 text-[0.875rem]">
                    <Clock size={32} />
                    <p className="m-0">No recent activity yet.</p>
                  </div>
                ) : (
                  recentActivities.slice(0, 8).map((item, i) => (
                    <div key={item._id || item.id || i} className="flex items-center gap-[0.875rem] py-[0.625rem] px-3 rounded-xl transition-colors duration-150 hover:bg-white/5">
                      <div className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center shrink-0 ${getIconClasses(item.type)}`}>
                        {activityIcon(item.type)}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[0.85rem] text-gray-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.title || item.name}</span>
                        <span className="text-[0.75rem] text-gray-500">{item.action}</span>
                      </div>
                      <span className="text-[0.72rem] text-gray-600 shrink-0">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Info row */}
          <motion.div
            className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="flex items-start gap-[0.875rem] p-5 bg-[#111118] border border-white/5 rounded-2xl">
              <Star size={18} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 className="text-[0.875rem] font-semibold text-gray-200 m-0 mb-[0.3rem]">IHM Recommended</h4>
                <p className="text-[0.8rem] text-gray-500 m-0 leading-relaxed">Featured restaurants are shown on the homepage top picks section.</p>
              </div>
            </div>
            <div className="flex items-start gap-[0.875rem] p-5 bg-[#111118] border border-white/5 rounded-2xl">
              <Activity size={18} style={{ color: '#a855f7', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 className="text-[0.875rem] font-semibold text-gray-200 m-0 mb-[0.3rem]">Content is Live</h4>
                <p className="text-[0.8rem] text-gray-500 m-0 leading-relaxed">Changes to restaurants, events, and articles are reflected publicly immediately.</p>
              </div>
            </div>
            <div className="flex items-start gap-[0.875rem] p-5 bg-[#111118] border border-white/5 rounded-2xl">
              <FileText size={18} style={{ color: '#22d3ee', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 className="text-[0.875rem] font-semibold text-gray-200 m-0 mb-[0.3rem]">Draft Articles</h4>
                <p className="text-[0.8rem] text-gray-500 m-0 leading-relaxed">Set article status to "published" to make them visible to visitors.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
