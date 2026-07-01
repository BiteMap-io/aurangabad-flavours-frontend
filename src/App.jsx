import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Loader } from 'lucide-react'
import Navbar from './components/Navbar'
import LanyardSimple from './components/LanyardSimple'
import WelcomeIntro from './components/WelcomeIntro'
import Home from './pages/Home'
import Footer from './components/Footer'

// Admin Components (eager — tiny wrappers used on every admin view)
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedRoute from './components/admin/ProtectedRoute'
import ToastContainer from './components/admin/Toast'
import OwnerProtectedRoute from './components/partner/OwnerProtectedRoute'

// Code-split everything else so first-time visitors don't download the whole
// admin panel + every page up front. Each becomes its own lazily-loaded chunk.
const Explore = lazy(() => import('./pages/Explore'))
const MapView = lazy(() => import('./pages/MapView'))
const PlaceMap = lazy(() => import('./pages/PlaceMap'))
const Cuisines = lazy(() => import('./pages/Cuisines'))
const TopPicks = lazy(() => import('./pages/TopPicks'))
const Events = lazy(() => import('./pages/Events'))
const FoodCulture = lazy(() => import('./pages/FoodCulture'))
const Articles = lazy(() => import('./pages/Articles'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const HotelsManagement = lazy(() => import('./pages/admin/HotelsManagement'))
const EventsManagement = lazy(() => import('./pages/admin/EventsManagement'))
const ArticlesManagement = lazy(() => import('./pages/admin/ArticlesManagement'))
const MediaManager = lazy(() => import('./pages/admin/MediaManager'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const HotelForm = lazy(() => import('./pages/admin/HotelForm'))
const EventForm = lazy(() => import('./pages/admin/EventForm'))
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'))
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'))
const DishesManagement = lazy(() => import('./pages/admin/DishesManagement'))
const FoodTrailsManagement = lazy(() => import('./pages/admin/FoodTrailsManagement'))
const FoodTrailForm = lazy(() => import('./pages/admin/FoodTrailForm'))

const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin'))
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'))
const PartnerRestaurantManage = lazy(() => import('./pages/partner/PartnerRestaurantManage'))

import { LanguageProvider } from './context/LanguageContext'
import { TouristModeProvider } from './context/TouristModeContext'
import { ThemeProvider } from './context/ThemeContext'
import { GoogleMapsProvider } from './context/GoogleMapsContext'
import { UserAuthProvider } from './context/UserAuthContext'

// Lightweight fallback shown while a route chunk loads.
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <Loader className="animate-spin text-accent-purple" size={40} />
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <GoogleMapsProvider>
      <UserAuthProvider>
      <AdminAuthProvider>
        <LanguageProvider>
          <TouristModeProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-background-primary">
                <Routes>
                  {/* Partner (Restaurant Owner) Routes */}
                  <Route path="/partner" element={<Suspense fallback={<PageLoader />}><PartnerLogin /></Suspense>} />
                  <Route path="/partner/dashboard" element={
                    <OwnerProtectedRoute>
                      <Suspense fallback={<PageLoader />}><PartnerDashboard /></Suspense>
                    </OwnerProtectedRoute>
                  } />
                  <Route path="/partner/hotels/new" element={
                    <OwnerProtectedRoute>
                      <Suspense fallback={<PageLoader />}><HotelForm ownerMode /></Suspense>
                    </OwnerProtectedRoute>
                  } />
                  <Route path="/partner/hotels/:id/edit" element={
                    <OwnerProtectedRoute>
                      <Suspense fallback={<PageLoader />}><HotelForm ownerMode /></Suspense>
                    </OwnerProtectedRoute>
                  } />
                  <Route path="/partner/hotels/:id/manage" element={
                    <OwnerProtectedRoute>
                      <Suspense fallback={<PageLoader />}><PartnerRestaurantManage /></Suspense>
                    </OwnerProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
                  <Route path="/admin/*" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AdminLayout />
                      </Suspense>
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="hotels" element={<HotelsManagement />} />
                    <Route path="hotels/add" element={<HotelForm />} />
                    <Route path="hotels/edit/:id" element={<HotelForm />} />
                    
                    <Route path="events" element={<EventsManagement />} />
                    <Route path="events/add" element={<EventForm />} />
                    <Route path="events/edit/:id" element={<EventForm />} />
                    
                    <Route path="articles" element={<ArticlesManagement />} />
                    <Route path="articles/add" element={<ArticleForm />} />
                    <Route path="articles/edit/:id" element={<ArticleForm />} />

                    <Route path="dishes" element={<DishesManagement />} />

                    <Route path="food-trails" element={<FoodTrailsManagement />} />
                    <Route path="food-trails/add" element={<FoodTrailForm />} />
                    <Route path="food-trails/edit/:id" element={<FoodTrailForm />} />

                    <Route path="media" element={<MediaManager />} />
                    <Route path="settings" element={<Settings />} />
                    {/* Pages content is now a tab inside Settings; keep the old path working */}
                    <Route path="pages" element={<Settings />} />
                    <Route path="gallery" element={<GalleryManagement />} />
                    <Route index element={<AdminDashboard />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/*" element={
                    <>
                      <WelcomeIntro />
                      <LanyardSimple />
                      <Navbar />
                      <main className="flex-1 w-full">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/map" element={<MapView />} />
                            <Route path="/place/:id" element={<PlaceMap />} />
                            <Route path="/cuisines" element={<Cuisines />} />
                            <Route path="/top-picks" element={<TopPicks />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/food-culture" element={<FoodCulture />} />
                            <Route path="/articles" element={<Articles />} />
                            <Route path="/articles/:slug" element={<ArticleDetail />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                          </Routes>
                        </Suspense>
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
      </UserAuthProvider>
      </GoogleMapsProvider>
    </ThemeProvider>
  )
}

export default App

