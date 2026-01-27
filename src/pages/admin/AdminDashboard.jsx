import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Calendar, 
  FileText, 
  Eye,
  Plus,
  BarChart3,
  Loader
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivity()
      ])

      if (statsResponse.success) {
        const statsData = [
          {
            title: 'Total Hotels',
            value: statsResponse.data.totalHotels.toString(),
            change: '+3',
            changeType: 'positive',
            icon: Building2,
            color: 'blue'
          },
          {
            title: 'Active Events',
            value: statsResponse.data.activeEvents.toString(),
            change: '+2',
            changeType: 'positive',
            icon: Calendar,
            color: 'green'
          },
          {
            title: 'Published Articles',
            value: statsResponse.data.publishedArticles.toString(),
            change: '+12',
            changeType: 'positive',
            icon: FileText,
            color: 'purple'
          },
          {
            title: 'Monthly Views',
            value: statsResponse.data.monthlyViews,
            change: '+8.2%',
            changeType: 'positive',
            icon: Eye,
            color: 'orange'
          }
        ]
        setStats(statsData)
      }

      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data)
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Add New Hotel',
      description: 'Add a new restaurant or hotel',
      icon: Building2,
      link: '/admin/hotels/add',
      color: 'blue'
    },
    {
      title: 'Create Event',
      description: 'Create a new event',
      icon: Calendar,
      link: '/admin/events/add',
      color: 'green'
    },
    {
      title: 'Write Article',
      description: 'Publish a new article',
      icon: FileText,
      link: '/admin/articles/add',
      color: 'purple'
    },
    {
      title: 'Upload Media',
      description: 'Manage media files',
      icon: Plus,
      link: '/admin/media',
      color: 'orange'
    }
  ]

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your website.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {stats?.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  className={`stat-card ${stat.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="stat-icon">
                    <Icon size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                    <span className={`stat-change ${stat.changeType}`}>
                      {stat.change}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="dashboard-grid">
            {/* Quick Actions */}
            <motion.div
              className="dashboard-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="card-header">
                <h2>Quick Actions</h2>
                <p>Common tasks and shortcuts</p>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.title}
                      to={action.link}
                      className={`quick-action ${action.color}`}
                    >
                      <div className="action-icon">
                        <Icon size={20} />
                      </div>
                      <div className="action-content">
                        <h4>{action.title}</h4>
                        <p>{action.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="dashboard-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="card-header">
                <h2>Recent Activity</h2>
                <p>Latest updates and changes</p>
              </div>
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-type ${activity.type}`}>
                      {activity.type === 'hotel' && <Building2 size={16} />}
                      {activity.type === 'article' && <FileText size={16} />}
                      {activity.type === 'event' && <Calendar size={16} />}
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>{activity.title}</strong> was {activity.action}
                      </p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/activity" className="view-all-btn">
                View All Activity
              </Link>
            </motion.div>
          </div>

          {/* Analytics Overview */}
          <motion.div
            className="dashboard-card analytics-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="card-header">
              <h2>Analytics Overview</h2>
              <p>Website performance metrics</p>
            </div>
            <div className="analytics-content">
              <div className="analytics-placeholder">
                <BarChart3 size={48} />
                <h3>Analytics Dashboard</h3>
                <p>Detailed analytics and reporting will be available here</p>
                <button className="btn-secondary">View Analytics</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard