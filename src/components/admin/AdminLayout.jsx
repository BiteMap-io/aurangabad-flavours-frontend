import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronLeft,
  User,
  Sparkles
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminLayout.css'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminUser, logout } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { path: '/admin/hotels', label: 'Hotels & Restaurants', icon: Building2, section: 'main' },
    { path: '/admin/events', label: 'Events', icon: Calendar, section: 'main' },
    { path: '/admin/articles', label: 'Articles', icon: FileText, section: 'main' },
    { path: '/admin/media', label: 'Media Manager', icon: Image, section: 'content' },
    { path: '/admin/settings', label: 'Settings', icon: Settings, section: 'content' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/admin/dashboard' && location.pathname.startsWith(path))

  const currentPageLabel = navigationItems.find(item => isActive(item.path))?.label || 'Admin'

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="al-brand">
        <div className="al-brand-logo">
          <Sparkles size={22} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="al-brand-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="al-brand-name">Aurangabad</span>
              <span className="al-brand-sub">Admin Panel</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className="al-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label="Toggle sidebar"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="al-nav">
        <div className="al-nav-section">
          {!collapsed && <span className="al-nav-section-label">Menu</span>}
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`al-nav-item ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <div className="al-nav-icon">
                  <Icon size={19} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="al-nav-label"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <div className="al-nav-indicator" />}
              </Link>
            )
          })}
        </div>

        <div className="al-nav-divider" />

        <div className="al-nav-section">
          {!collapsed && <span className="al-nav-section-label">System</span>}
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`al-nav-item ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <div className="al-nav-icon">
                  <Icon size={19} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="al-nav-label"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <div className="al-nav-indicator" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="al-user-footer">
        <div className={`al-user-card ${collapsed ? 'collapsed' : ''}`}>
          <div className="al-user-avatar">
            <User size={16} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="al-user-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <span className="al-user-name">{adminUser?.name || 'Super Admin'}</span>
                <span className="al-user-role">Administrator</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          className="al-logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={17} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  )

  return (
    <div className="al-root">
      {/* Desktop Sidebar */}
      <motion.aside
        className={`al-sidebar ${collapsed ? 'al-sidebar--collapsed' : ''}`}
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="al-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="al-sidebar al-sidebar--mobile"
              initial={{ x: -270 }}
              animate={{ x: 0 }}
              exit={{ x: -270 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <button className="al-mobile-close" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <motion.div
        className="al-main"
        animate={{ marginLeft: collapsed ? 68 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Topbar */}
        <header className="al-topbar">
          <div className="al-topbar-left">
            <button className="al-mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="al-breadcrumb">
              <span className="al-breadcrumb-root">Admin</span>
              <span className="al-breadcrumb-sep">/</span>
              <span className="al-breadcrumb-current">{currentPageLabel}</span>
            </div>
          </div>
          <div className="al-topbar-right">
            <div className="al-topbar-user">
              <div className="al-topbar-avatar">
                <User size={15} />
              </div>
              <span className="al-topbar-username">{adminUser?.name || 'Super Admin'}</span>
            </div>
            <button className="al-topbar-logout" onClick={handleLogout} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="al-content">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}

export default AdminLayout