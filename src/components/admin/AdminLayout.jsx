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
  Sparkles,
  PanelLeft
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

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
    { path: '/admin/pages', label: 'Pages', icon: PanelLeft, section: 'content' },
    { path: '/admin/gallery', label: 'Gallery', icon: Image, section: 'content' },
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
      <div className="flex items-center gap-2.5 py-5 pr-3.5 pl-4 border-b border-white/5 min-h-[70px] overflow-hidden relative">
        <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-[10px] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(168,85,247,0.4)]">
          <Sparkles size={22} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="flex flex-col overflow-hidden whitespace-nowrap flex-1"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[0.95rem] font-bold text-gray-100 tracking-tight">Aurangabad</span>
              <span className="text-[0.72rem] text-gray-500 font-normal">Admin Panel</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className="w-6 h-6 shrink-0 ml-auto bg-white/5 border border-white/10 rounded-md text-gray-500 flex items-center justify-center cursor-pointer transition-all hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/30 max-[900px]:hidden"
          onClick={() => setCollapsed(c => !c)}
          aria-label="Toggle sidebar"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
        <div className="mb-1">
          {!collapsed && <span className="block text-[0.68rem] font-semibold tracking-wider uppercase text-gray-600 pt-2 px-3 pb-1 whitespace-nowrap">Menu</span>}
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-500 no-underline transition-all relative mb-[2px] overflow-hidden whitespace-nowrap hover:bg-white/5 hover:text-gray-300 ${active ? '!bg-purple-500/10 !text-purple-400' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center transition-colors ${active ? 'text-purple-500' : ''}`}>
                  <Icon size={19} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="text-[0.9rem] font-medium overflow-hidden text-ellipsis"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-purple-500 rounded-l-sm shadow-[-2px_0_8px_rgba(168,85,247,0.5)]" />}
              </Link>
            )
          })}
        </div>

        <div className="h-px bg-white/5 mx-3 my-2" />

        <div className="mb-1">
          {!collapsed && <span className="block text-[0.68rem] font-semibold tracking-wider uppercase text-gray-600 pt-2 px-3 pb-1 whitespace-nowrap">System</span>}
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-500 no-underline transition-all relative mb-[2px] overflow-hidden whitespace-nowrap hover:bg-white/5 hover:text-gray-300 ${active ? '!bg-purple-500/10 !text-purple-400' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center transition-colors ${active ? 'text-purple-500' : ''}`}>
                  <Icon size={19} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="text-[0.9rem] font-medium overflow-hidden text-ellipsis"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-purple-500 rounded-l-sm shadow-[-2px_0_8px_rgba(168,85,247,0.5)]" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="py-3 px-2 border-t border-white/5 flex flex-col gap-1.5">
        <div className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 overflow-hidden ${collapsed ? 'justify-center p-2.5' : ''}`}>
          <div className="w-[30px] h-[30px] shrink-0 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-700/30 border border-purple-500/30 flex items-center justify-center text-purple-500">
            <User size={16} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="flex flex-col overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-[0.85rem] font-semibold text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis">{adminUser?.name || 'Super Admin'}</span>
                <span className="text-[0.72rem] text-gray-500">Administrator</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-transparent border border-red-500/20 text-gray-400 text-sm font-medium cursor-pointer transition-all overflow-hidden whitespace-nowrap hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
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
    <div className="flex min-h-screen bg-[#0a0a0f] font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Desktop Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-screen flex flex-col z-[200] overflow-hidden bg-[#0e0e16] border-r border-purple-500/10 shadow-[4px_0_30px_rgba(0,0,0,0.4)] max-[900px]:hidden ${collapsed ? 'w-[68px]' : 'w-[256px]'}`}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-screen w-[256px] flex flex-col z-[200] overflow-hidden bg-[#0e0e16] border-r border-purple-500/10 shadow-[4px_0_30px_rgba(0,0,0,0.4)]"
              initial={{ x: -270 }}
              animate={{ x: 0 }}
              exit={{ x: -270 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <button className="absolute top-4 right-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 w-8 h-8 flex items-center justify-center cursor-pointer z-10" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <motion.div
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out border-l border-transparent max-[900px]:!ml-0"
        animate={{ marginLeft: collapsed ? 68 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Topbar */}
        <header className="flex items-center justify-between h-[60px] px-6 bg-[#0e0e16]/85 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100] shrink-0 max-[480px]:px-4">
          <div className="flex items-center gap-3.5">
            <button className="hidden max-[900px]:flex bg-white/5 border border-white/10 rounded-lg text-gray-400 w-9 h-9 items-center justify-center cursor-pointer transition-all hover:bg-purple-500/10 hover:text-purple-500" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-600">Admin</span>
              <span className="text-gray-700">/</span>
              <span className="text-gray-200 font-semibold">{currentPageLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 py-1.5 pr-3 pl-1.5 bg-white/5 border border-white/10 rounded-full">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-700/40 flex items-center justify-center text-purple-500 border border-purple-500/30">
                <User size={15} />
              </div>
              <span className="text-[0.85rem] text-gray-300 font-medium max-[480px]:hidden">{adminUser?.name || 'Super Admin'}</span>
            </div>
            <button className="w-9 h-9 bg-transparent border border-red-500/20 rounded-xl text-gray-500 flex items-center justify-center cursor-pointer transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" onClick={handleLogout} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-7 overflow-y-auto max-[480px]:p-4">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}

export default AdminLayout