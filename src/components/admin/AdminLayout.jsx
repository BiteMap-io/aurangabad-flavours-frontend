import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  FileText, 
  Image, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import ThemeToggle from '../ThemeToggle'
import './AdminLayout.css'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminUser, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hotels', label: 'Hotels & Restaurants', icon: Building2 },
    { path: '/admin/events', label: 'Events', icon: Calendar },
    { path: '/admin/articles', label: 'Articles', icon: FileText },
    { path: '/admin/media', label: 'Media Manager', icon: Image },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-brand">
            <Building2 size={24} />
            <span>Admin Panel</span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
                           (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-details">
              <span className="user-name">{adminUser?.name}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <h1 className="page-title">
              {navigationItems.find(item => 
                location.pathname === item.path || 
                (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
              )?.label || 'Admin Panel'}
            </h1>
          </div>

          <div className="topbar-right">
            <ThemeToggle />
            <div className="admin-user">
              <span>{adminUser?.name}</span>
              <button className="logout-btn-mobile" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout