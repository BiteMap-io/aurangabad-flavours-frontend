import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, Calendar, FileText, Eye, Plus, TrendingUp, 
  Loader, ArrowUpRight, Activity, Sparkles, Star, Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminDashboard.css'

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

  return (
    <div className="adb-root">
      {/* Header */}
      <div className="adb-header">
        <div>
          <p className="adb-greeting">{getGreeting()}, {adminUser?.name || 'Admin'} 👋</p>
          <h1 className="adb-title">Dashboard Overview</h1>
        </div>
        <div className="adb-header-badge">
          <Sparkles size={14} />
          <span>Live</span>
        </div>
      </div>

      {loading ? (
        <div className="adb-loading">
          <Loader size={40} className="adb-spinner" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="adb-stats-grid">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  className="adb-stat-card"
                  style={{ '--card-color': card.color, '--card-glow': card.glow }}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  custom={i}
                >
                  <div className="adb-stat-icon">
                    <Icon size={20} />
                  </div>
                  <div className="adb-stat-body">
                    <span className="adb-stat-value">{card.value}</span>
                    <span className="adb-stat-label">{card.label}</span>
                  </div>
                  <div className="adb-stat-footer">
                    <TrendingUp size={12} />
                    <span>{card.change}</span>
                    {card.link && (
                      <Link to={card.link} className="adb-stat-link">
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Body Grid */}
          <div className="adb-body-grid">
            {/* Quick Actions */}
            <motion.div
              className="adb-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div className="adb-panel-header">
                <h2>Quick Actions</h2>
                <p>Jump to common tasks</p>
              </div>
              <div className="adb-actions-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="adb-action-card"
                      style={{ '--action-color': action.color }}
                    >
                      <div className="adb-action-icon">
                        <Icon size={20} />
                      </div>
                      <span>{action.label}</span>
                      <ArrowUpRight size={14} className="adb-action-arrow" />
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="adb-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="adb-panel-header">
                <h2>Recent Activity</h2>
                <p>Latest updates across the platform</p>
              </div>
              <div className="adb-activity-list">
                {recentActivities.length === 0 ? (
                  <div className="adb-activity-empty">
                    <Clock size={32} />
                    <p>No recent activity yet.</p>
                  </div>
                ) : (
                  recentActivities.slice(0, 8).map((item, i) => (
                    <div key={item._id || item.id || i} className="adb-activity-item">
                      <div className="adb-activity-icon" data-type={item.type}>
                        {activityIcon(item.type)}
                      </div>
                      <div className="adb-activity-content">
                        <span className="adb-activity-title">{item.title || item.name}</span>
                        <span className="adb-activity-action">{item.action}</span>
                      </div>
                      <span className="adb-activity-time">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Info row */}
          <motion.div
            className="adb-info-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="adb-info-card">
              <Star size={18} style={{ color: '#f59e0b' }} />
              <div>
                <h4>IHM Recommended</h4>
                <p>Featured restaurants are shown on the homepage top picks section.</p>
              </div>
            </div>
            <div className="adb-info-card">
              <Activity size={18} style={{ color: '#a855f7' }} />
              <div>
                <h4>Content is Live</h4>
                <p>Changes to restaurants, events, and articles are reflected publicly immediately.</p>
              </div>
            </div>
            <div className="adb-info-card">
              <FileText size={18} style={{ color: '#22d3ee' }} />
              <div>
                <h4>Draft Articles</h4>
                <p>Set article status to "published" to make them visible to visitors.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
