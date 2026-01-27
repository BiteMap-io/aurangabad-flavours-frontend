import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LanyardSimple from './components/LanyardSimple'
import WelcomeIntro from './components/WelcomeIntro'
import Home from './pages/Home'
import Explore from './pages/Explore'
import MapView from './pages/MapView'
import Cuisines from './pages/Cuisines'
import TopPicks from './pages/TopPicks'
import Events from './pages/Events'
import FoodCulture from './pages/FoodCulture'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Footer from './components/Footer'

// Admin Components
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import HotelsManagement from './pages/admin/HotelsManagement'
import EventsManagement from './pages/admin/EventsManagement'
import ArticlesManagement from './pages/admin/ArticlesManagement'
import MediaManager from './pages/admin/MediaManager'
import Settings from './pages/admin/Settings'
import ProtectedRoute from './components/admin/ProtectedRoute'
import ToastContainer from './components/admin/Toast'

import { LanguageProvider } from './context/LanguageContext'
import { TouristModeProvider } from './context/TouristModeContext'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <LanguageProvider>
          <TouristModeProvider>
            <Router>
              <div className="app">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="hotels" element={<HotelsManagement />} />
                    <Route path="events" element={<EventsManagement />} />
                    <Route path="articles" element={<ArticlesManagement />} />
                    <Route path="media" element={<MediaManager />} />
                    <Route path="settings" element={<Settings />} />
                    <Route index element={<AdminDashboard />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/*" element={
                    <>
                      <WelcomeIntro />
                      <LanyardSimple />
                      <Navbar />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/explore" element={<Explore />} />
                          <Route path="/map" element={<MapView />} />
                          <Route path="/cuisines" element={<Cuisines />} />
                          <Route path="/top-picks" element={<TopPicks />} />
                          <Route path="/events" element={<Events />} />
                          <Route path="/food-culture" element={<FoodCulture />} />
                          <Route path="/articles" element={<Articles />} />
                          <Route path="/articles/:slug" element={<ArticleDetail />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  } />
                </Routes>
                
                {/* Toast Notifications */}
                <ToastContainer />
              </div>
            </Router>
          </TouristModeProvider>
        </LanguageProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}

export default App

