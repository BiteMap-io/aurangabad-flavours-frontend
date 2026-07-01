import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Navigation, Loader, Clock, Route, ExternalLink, X, Share2 } from 'lucide-react'
import EmbeddedMap from '../components/EmbeddedMap'
import { useDirections } from '../hooks/useDirections'
import { hotelsApi } from '../services/adminApi'
import { showToast } from '../components/admin/Toast'

const CSN_CENTER = [19.8762, 75.3433]

const PlaceMap = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const mapRef = useRef(null)

  const { userLocation, directions, routeInfo, loading: routeLoading, error: routeError, getDirections, clear } = useDirections()

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await hotelsApi.getById(id)
        const data = res?.data || res
        if (!active) return
        if (data && (data._id || data.id)) setRestaurant(data)
        else setNotFound(true)
      } catch {
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  const coords = restaurant?.location?.coordinates
  const center = coords?.length === 2 ? [coords[1], coords[0]] : CSN_CENTER

  const openInGoogleMaps = () => {
    if (coords?.length !== 2) return
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`, '_blank')
  }

  // Shares a server-rendered link (not this SPA URL) so WhatsApp/Facebook/etc.
  // link previews show the restaurant's real name and photo.
  const handleShare = async () => {
    const shareUrl = `${import.meta.env.VITE_API_BASE_URL}/share/restaurant/${id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant.name, text: `Check out ${restaurant.name} on Aurangabad Flavours`, url: shareUrl })
      } catch {
        // User cancelled the native share sheet.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast.success('Link copied', 'Share it with your friends!')
    } catch {
      showToast.error('Error', 'Could not copy the link')
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-secondary gap-3">
        <Loader size={44} className="animate-spin text-accent-purple" />
        <p className="m-0">Loading location…</p>
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-secondary gap-4 px-6 text-center">
        <MapPin size={48} className="opacity-30" />
        <p className="m-0">We couldn't find that place.</p>
        <button onClick={() => navigate('/explore')} className="py-2.5 px-5 bg-accent-purple text-white rounded-pill font-semibold hover:shadow-glow transition-all">
          Back to Explore
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Map fills the page */}
      <EmbeddedMap
        height="100%"
        zoom={16}
        center={center}
        restaurants={[restaurant]}
        userLocation={userLocation}
        directions={directions}
        mapRef={mapRef}
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 py-2 px-4 bg-background-primary/90 backdrop-blur-xl border border-glass-border rounded-pill text-primary text-[0.88rem] font-semibold shadow-glass hover:border-accent-purple transition-all"
      >
        <ArrowLeft size={17} /> Back
      </button>

      {/* Info panel — left card on desktop, bottom sheet on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="absolute z-20 bg-background-primary/95 backdrop-blur-xl border border-glass-border shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden
          left-0 right-0 bottom-0 rounded-t-2xl
          md:left-4 md:top-4 md:bottom-auto md:right-auto md:w-[360px] md:rounded-2xl"
      >
        {/* Cover */}
        <div className="relative h-[150px] md:h-[170px] overflow-hidden">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h1 className="text-white font-bold text-[1.3rem] m-0 leading-tight drop-shadow truncate">{restaurant.name}</h1>
            <p className="text-white/85 text-[0.85rem] m-0 truncate">{restaurant.cuisine}</p>
          </div>
        </div>

        <div className="p-4">
          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap text-[0.82rem] text-secondary mb-3">
            {restaurant.rating && (
              <span className="flex items-center gap-1 text-accent-purple font-bold"><Star size={13} fill="currentColor" /> {restaurant.rating}</span>
            )}
            <span className="flex items-center gap-1"><MapPin size={13} /> {restaurant.area}</span>
            {restaurant.priceRange && <span className="font-semibold text-primary">{restaurant.priceRange}</span>}
          </div>

          <p className="text-[0.82rem] text-tertiary leading-[1.5] m-0 mb-4">
            {restaurant.address || `${restaurant.area}, Aurangabad`}
          </p>

          {/* Route summary */}
          <AnimatePresence>
            {(routeInfo || routeLoading || routeError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 py-2.5 px-3 bg-accent-purple/10 border border-accent-purple/25 rounded-lg text-[0.82rem]">
                  {routeLoading && <><Loader size={15} className="animate-spin text-accent-purple" /> <span className="text-secondary">Finding the best route…</span></>}
                  {routeError && <span className="text-red-400">{routeError}</span>}
                  {routeInfo && (
                    <span className="flex items-center gap-2 text-primary font-semibold">
                      <Route size={15} className="text-accent-purple" />
                      {routeInfo.distance} · <Clock size={13} /> {routeInfo.duration}
                      <button onClick={clear} className="ml-1 text-tertiary hover:text-primary"><X size={14} /></button>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => getDirections(restaurant)}
              disabled={routeLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-accent-purple text-white rounded-xl text-[0.85rem] font-semibold transition-all hover:shadow-glow hover:-translate-y-[1px] disabled:opacity-60"
            >
              <Navigation size={16} /> Get directions
            </button>
            <button
              onClick={openInGoogleMaps}
              title="Open in Google Maps"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-glass-surface border border-glass-border text-secondary rounded-xl text-[0.85rem] font-semibold transition-all hover:border-accent-purple hover:text-primary"
            >
              <ExternalLink size={15} /> <span className="max-md:hidden">Maps</span>
            </button>
            <button
              onClick={handleShare}
              title="Share"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-glass-surface border border-glass-border text-secondary rounded-xl text-[0.85rem] font-semibold transition-all hover:border-accent-purple hover:text-primary"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PlaceMap
