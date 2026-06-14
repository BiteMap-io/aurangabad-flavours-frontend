import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Star, Navigation, ChevronLeft, ChevronRight, Heart, Loader } from 'lucide-react'
import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { useGoogleMapsLoaded } from '../context/GoogleMapsContext'
import { useDirections } from '../hooks/useDirections'
import { useUserAuth } from '../context/UserAuthContext'
import api from '../services/api'
import { dishesApi } from '../services/adminApi'

const modalMapStyle = { width: '100%', height: '100%' }

// Inline SVG shown when an image is missing or fails to load — keeps the layout
// from collapsing into a broken-image icon.
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%25' height='100%25' fill='%231a1626'/><g fill='none' stroke='%237c6f9c' stroke-width='2'><circle cx='400' cy='270' r='46'/><path d='M384 270a16 16 0 0 1 32 0'/></g><text x='50%25' y='62%25' fill='%237c6f9c' font-family='Inter,sans-serif' font-size='26' text-anchor='middle'>No photo available</text></svg>"

const onImgError = (e) => {
  if (e.currentTarget.src !== PLACEHOLDER_IMG) e.currentTarget.src = PLACEHOLDER_IMG
}

const USER_ICON = {
  path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
  fillColor: '#4285F4',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 1,
}

const ModalMap = memo(({ position, title, directions, userLocation }) => {
  const isLoaded = useGoogleMapsLoaded()
  const mapRef = useRef(null)

  const onLoad = useCallback((m) => {
    mapRef.current = m
    // Fire resize after modal open animation completes so map fills container
    setTimeout(() => {
      if (!m) return
      window.google.maps.event.trigger(m, 'resize')
      m.setCenter(position)
      m.setZoom(15)
    }, 350)
  }, [position])

  const onUnmount = useCallback(() => { mapRef.current = null }, [])

  // Fit bounds when route arrives, re-center when cleared
  useEffect(() => {
    if (!mapRef.current) return
    if (directions) {
      mapRef.current.fitBounds(directions.routes[0].bounds)
    } else {
      window.google.maps.event.trigger(mapRef.current, 'resize')
      mapRef.current.setCenter(position)
      mapRef.current.setZoom(15)
    }
  }, [directions, position])

  if (!isLoaded) return (
    <div className="w-full h-full flex items-center justify-center text-secondary text-xs">Loading map…</div>
  )

  return (
    <GoogleMap
      mapContainerStyle={modalMapStyle}
      center={position}
      zoom={15}
      options={{ disableDefaultUI: true, scrollwheel: false }}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={position} title={title} />
      {userLocation && <Marker position={userLocation} title="You are here" icon={USER_ICON} />}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#8b5cf6', strokeWeight: 5, strokeOpacity: 0.9 },
          }}
        />
      )}
    </GoogleMap>
  )
})

// Small reusable section heading — replaces the long, repeated h2 class strings.
const Section = ({ title, children }) => (
  <section className="flex flex-col gap-sm">
    <h2 className="text-[0.78rem] font-bold tracking-[0.1em] uppercase text-tertiary m-0">{title}</h2>
    {children}
  </section>
)

const RestaurantModal = ({ restaurant, isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const { userLocation, directions, routeInfo, loading: dirLoading, error: dirError, getDirections, clear: clearRoute } = useDirections()
  const { user, isLoggedIn } = useUserAuth()
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [localReviews, setLocalReviews] = useState([])
  const [dishes, setDishes] = useState([])

  const touchStartX = useRef(null)

  // Reset route when modal closes or restaurant changes
  useEffect(() => {
    clearRoute()
    setCurrentImageIndex(0)
    setReviewError('')
    setReviewSuccess(false)
    setLocalReviews(restaurant?.reviews || [])
  }, [restaurant, isOpen, clearRoute])

  // Fetch the restaurant's signature dishes (separate Dish entities)
  useEffect(() => {
    const id = restaurant?._id || restaurant?.id
    if (!isOpen || !id) { setDishes([]); return }
    dishesApi.getByRestaurant(id)
      .then(data => setDishes(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => setDishes([]))
  }, [restaurant, isOpen])

  // Auto-trigger directions if card's "Get Directions" was clicked
  useEffect(() => {
    if (isOpen && restaurant?._autoDirections) {
      getDirections(restaurant)
    }
  }, [isOpen, restaurant, getDirections])

  // Cover image + gallery, de-duped and with blanks removed. The cover lives in
  // `image`; the extra photos live in `gallery`. (Previously this used
  // `gallery || [image]`, which dropped the cover and showed "1 / 0" when the
  // gallery was an empty array.)
  const images = useMemo(() => {
    const list = [restaurant?.image, ...(restaurant?.gallery || [])]
      .filter(img => typeof img === 'string' && img.trim())
    return Array.from(new Set(list))
  }, [restaurant])

  const hasImages = images.length > 0
  const safeIndex = hasImages ? Math.min(currentImageIndex, images.length - 1) : 0

  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null || images.length < 2) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) nextImage()
    else if (dx > 40) prevImage()
    touchStartX.current = null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (userRating === 0) return
    if (!isLoggedIn) { setReviewError('Please log in to submit a review.'); return }

    setReviewLoading(true)
    setReviewError('')
    try {
      const id = restaurant._id || restaurant.id
      const updated = await api.post(`/restaurants/${id}/reviews`, {
        rating: userRating,
        comment: feedback,
      })
      setLocalReviews(updated.reviews || [])
      setIsSubmitted(true)
      setTimeout(() => {
        setUserRating(0)
        setFeedback('')
        setIsSubmitted(false)
      }, 2000)
    } catch (err) {
      setReviewError(err?.error || 'Failed to submit review. Please try again.')
    } finally {
      setReviewLoading(false)
    }
  }

  if (!restaurant) return null

  const reviewCount = localReviews.length
  const averageRating = reviewCount
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : restaurant.rating

  const foodTypeLabel = restaurant.foodType === 'veg' ? '🟢 Pure Veg'
    : restaurant.foodType === 'non-veg' ? '🔴 Non-Veg'
    : restaurant.foodType === 'both' ? '🟡 Veg & Non-Veg' : null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center md:p-md lg:p-xl">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-[6px] z-[-1] light:bg-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet on phone (slides up), centered card on desktop */}
          <motion.div
            className="relative w-full max-w-[1080px] h-[94vh] md:h-auto md:max-h-[88vh] bg-background-primary border border-glass-border rounded-t-2xl md:rounded-2xl overflow-y-auto overflow-x-hidden flex flex-col shadow-glass light:bg-background-primary"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* ── Hero gallery ── */}
            <div className="relative w-full shrink-0">
              <div
                className="relative w-full h-[230px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-background-secondary"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={hasImages ? images[safeIndex] : PLACEHOLDER_IMG}
                  alt={`${restaurant.name} — photo ${safeIndex + 1}`}
                  onError={onImgError}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {/* Legibility gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                {/* Top controls */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-sm md:p-md">
                  {hasImages && images.length > 1 ? (
                    <span className="py-1 px-2.5 bg-black/55 backdrop-blur-md border border-white/10 rounded-full text-white text-[0.75rem] font-medium">
                      {safeIndex + 1} / {images.length}
                    </span>
                  ) : <span />}

                  <div className="flex items-center gap-xs">
                    <button
                      onClick={() => setIsFavorite(f => !f)}
                      aria-label="Save"
                      className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 ${isFavorite ? 'bg-[#ff4757] border-[#ff4757] text-white' : 'bg-black/55 border-white/10 text-white hover:bg-black/75'}`}
                    >
                      <Heart size={18} fill={isFavorite ? '#fff' : 'none'} />
                    </button>
                    <button
                      onClick={onClose}
                      aria-label={t('accessibility.closeModal')}
                      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-black/75 hover:rotate-90"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Carousel arrows */}
                {hasImages && images.length > 1 && (
                  <>
                    <button onClick={prevImage} aria-label="Previous photo"
                      className="absolute top-1/2 -translate-y-1/2 left-2 md:left-3 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/70">
                      <ChevronLeft size={22} />
                    </button>
                    <button onClick={nextImage} aria-label="Next photo"
                      className="absolute top-1/2 -translate-y-1/2 right-2 md:right-3 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/70">
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-md lg:p-lg flex flex-col gap-1.5">
                  {restaurant.ihmRecommended && (
                    <span className="self-start bg-gradient-to-r from-accent-purple to-[#9b59b6] text-white rounded-full px-2.5 py-1 text-[0.7rem] font-semibold shadow-glow mb-0.5">
                      {t('restaurant.ihmRecommended')}
                    </span>
                  )}
                  <h1 className="text-[1.5rem] sm:text-[1.8rem] lg:text-[2.3rem] leading-[1.05] m-0 font-bold text-white tracking-[-0.02em] drop-shadow-lg">
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-sm flex-wrap text-white/90">
                    <span className="text-[0.9rem] font-medium">{restaurant.cuisine}</span>
                    <span className="flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full px-2 py-0.5">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span className="text-[0.85rem] font-bold text-white">{averageRating}</span>
                      <span className="text-[0.75rem] text-white/70">({reviewCount})</span>
                    </span>
                    {restaurant.priceRange && (
                      <span className="text-[0.9rem] font-semibold text-white">{restaurant.priceRange}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              {hasImages && images.length > 1 && (
                <div className="flex gap-xs p-sm bg-background-secondary overflow-x-auto scrollbar-none border-b border-glass-border/40 light:bg-background-primary">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-[56px] h-[42px] rounded-md overflow-hidden border-2 transition-all duration-200 ${index === safeIndex ? 'border-accent-purple' : 'border-transparent opacity-55 hover:opacity-100'}`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} onError={onImgError} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Meta row + Directions ── */}
            <div className="flex items-center justify-between gap-md flex-wrap px-md lg:px-lg py-sm border-b border-glass-border">
              <div className="flex items-center gap-xs text-secondary text-[0.82rem] flex-wrap">
                <MapPin size={15} className="text-accent-purple" />
                <span>{restaurant.area}</span>
                {restaurant.distance && (<><span className="opacity-40">•</span><span>{restaurant.distance}</span></>)}
                {restaurant.travelTime && (<><span className="opacity-40">•</span><Clock size={14} /><span>{restaurant.travelTime}</span></>)}
                {foodTypeLabel && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className={`font-semibold ${restaurant.foodType === 'veg' ? 'text-green-400' : restaurant.foodType === 'non-veg' ? 'text-red-400' : 'text-purple-400'}`}>
                      {foodTypeLabel}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  const id = restaurant?._id || restaurant?.id
                  onClose()
                  navigate(`/place/${id}`)
                }}
                className="flex items-center gap-xs py-2 px-4 bg-accent-purple text-white rounded-full text-[0.85rem] font-semibold cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-[1px]"
              >
                <Navigation size={16} />
                <span>{t('common.directions')}</span>
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col md:flex-row gap-md lg:gap-lg p-md lg:p-lg">
              {/* Main column */}
              <div className="order-2 md:order-1 flex-[2] flex flex-col gap-lg min-w-0">
                {restaurant.description && (
                  <Section title={t('restaurant.about')}>
                    <p className="text-secondary leading-[1.65] m-0 text-[0.92rem]">{restaurant.description}</p>
                  </Section>
                )}

                {restaurant.facilities?.length > 0 && (
                  <Section title={t('restaurant.facilities')}>
                    <div className="flex flex-wrap gap-sm">
                      {restaurant.facilities.map((facility, idx) => (
                        <span key={idx} className="py-1.5 px-3.5 bg-glass-surface border border-glass-border rounded-pill text-[0.8rem] text-secondary font-medium transition-all duration-200 hover:border-accent-purple/40 hover:text-primary light:bg-white/90 light:border-black/10">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Highlights (IHM ratings) */}
                {(restaurant.food?.quality > 0 || restaurant.staff?.friendliness > 0 || restaurant.environment?.ambience > 0) && (
                  <Section title="Highlights">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                      {[
                        { label: 'Food Quality', val: restaurant.food?.quality },
                        { label: 'Food Hygiene', val: restaurant.food?.hygiene },
                        { label: 'Kitchen Hygiene', val: restaurant.food?.kitchenHygiene },
                        { label: 'Menu Variety', val: restaurant.food?.menuVariety },
                        { label: 'Value for Money', val: restaurant.food?.valueForMoney },
                        { label: 'Staff Friendliness', val: restaurant.staff?.friendliness },
                        { label: 'Staff Appearance', val: restaurant.staff?.appearance },
                        { label: 'Ambience', val: restaurant.environment?.ambience },
                        { label: 'Outside Cleanliness', val: restaurant.environment?.outsideCleanliness },
                      ].filter(h => h.val > 0).map(h => (
                        <div key={h.label} className="flex items-center justify-between gap-sm py-2 px-3 bg-glass-surface/40 border border-glass-border rounded-lg light:bg-white/80 light:border-black/10">
                          <span className="text-[0.82rem] text-secondary">{h.label}</span>
                          <span className="text-[0.8rem] tracking-[-2px]">{'⭐'.repeat(h.val)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Amenities */}
                {restaurant.extraFacilities && Object.values(restaurant.extraFacilities).some(Boolean) && (
                  <Section title="Amenities">
                    <div className="flex flex-wrap gap-xs">
                      {restaurant.extraFacilities.ac && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">❄️ AC</span>}
                      {restaurant.extraFacilities.disabilityAccess && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">♿ Disability Access</span>}
                      {restaurant.extraFacilities.washroom && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🚻 Washroom</span>}
                      {restaurant.extraFacilities.parking && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🅿️ Parking</span>}
                      {restaurant.extraFacilities.parcel && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">📦 Parcel</span>}
                    </div>
                  </Section>
                )}

                {/* Special dishes */}
                {(restaurant.food?.signatureDishes || restaurant.food?.specialtyDishes) && (
                  <Section title="Special Dishes">
                    <div className="flex flex-col gap-xs">
                      {restaurant.food?.signatureDishes && (
                        <div className="flex items-start gap-sm py-2 px-3 bg-glass-surface/40 border border-glass-border rounded-lg">
                          <span className="text-[0.72rem] text-tertiary font-semibold uppercase shrink-0 mt-0.5">Signature</span>
                          <span className="text-[0.85rem] text-primary">{restaurant.food.signatureDishes}</span>
                        </div>
                      )}
                      {restaurant.food?.specialtyDishes && (
                        <div className="flex items-start gap-sm py-2 px-3 bg-glass-surface/40 border border-glass-border rounded-lg">
                          <span className="text-[0.72rem] text-tertiary font-semibold uppercase shrink-0 mt-0.5">Specialty</span>
                          <span className="text-[0.85rem] text-primary">{restaurant.food.specialtyDishes}</span>
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* Popular dishes (Dish entities) */}
                {dishes.length > 0 && (
                  <Section title="Popular Dishes">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                      {dishes.map((dish) => (
                        <div key={dish._id || dish.id} className="flex flex-col bg-glass-surface/40 border border-glass-border rounded-lg overflow-hidden light:bg-white/90 light:border-black/10">
                          <img src={dish.image || PLACEHOLDER_IMG} alt={dish.name} onError={onImgError} loading="lazy" className="w-full h-[88px] object-cover" />
                          <div className="p-2 flex flex-col gap-[0.1rem]">
                            <span className="text-[0.8rem] font-medium text-primary leading-tight">{dish.name}</span>
                            {dish.category && <span className="text-[0.7rem] text-tertiary">{dish.category}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Info & pricing */}
                {(restaurant.avgPricePerPerson > 0 || restaurant.seatingCapacity > 0 || restaurant.staff?.serviceType || restaurant.environment?.uniqueFeatures || restaurant.sustainabilityPractices) && (
                  <Section title="Info & Pricing">
                    <div className="flex flex-wrap gap-xs">
                      {restaurant.avgPricePerPerson > 0 && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">💰 ₹{restaurant.avgPricePerPerson}/person</span>}
                      {restaurant.seatingCapacity > 0 && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🪑 {restaurant.seatingCapacity} seats</span>}
                      {restaurant.staff?.serviceType && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary capitalize">🍽️ {restaurant.staff.serviceType}</span>}
                      {restaurant.environment?.uniqueFeatures && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">✨ {restaurant.environment.uniqueFeatures}</span>}
                      {restaurant.sustainabilityPractices && <span className="py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🌱 {restaurant.sustainabilityPractices}</span>}
                    </div>
                  </Section>
                )}

                {/* Menu */}
                <Section title={t('restaurant.menu')}>
                  <div className="flex flex-col gap-xs">
                    {restaurant.menuItems?.length > 0 ? (
                      (() => {
                        const categories = [...new Set(restaurant.menuItems.map(i => i.category || 'Other'))]
                        return categories.map(cat => (
                          <div key={cat} className="mb-sm">
                            {cat && <p className="text-[0.72rem] text-tertiary uppercase tracking-wide mb-xs font-semibold">{cat}</p>}
                            {restaurant.menuItems.filter(i => (i.category || 'Other') === cat).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center gap-sm py-2.5 px-3 bg-glass-surface/40 border border-glass-border rounded-lg mb-1 hover:bg-glass-hover transition-all duration-200 light:bg-white/90 light:border-black/10">
                                <span className="flex items-center gap-sm min-w-0">
                                  <span className="text-[0.7rem] shrink-0">{item.isVeg ? '🟢' : '🔴'}</span>
                                  <span className="font-medium text-primary text-[0.88rem] truncate">{item.name}</span>
                                </span>
                                <span className="font-semibold text-primary text-[0.9rem] shrink-0">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        ))
                      })()
                    ) : restaurant.menu?.length > 0 ? (
                      restaurant.menu.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-sm py-3 px-3.5 bg-glass-surface/40 border border-glass-border rounded-lg transition-all duration-200 hover:bg-glass-hover light:bg-white/90 light:border-black/10">
                          <div className="flex flex-col gap-[0.15rem] min-w-0">
                            <span className="font-medium text-primary text-[0.92rem] truncate">{item.name}</span>
                            <span className="text-[0.8rem] text-tertiary">{item.category}</span>
                          </div>
                          <span className="font-semibold text-primary text-[1rem] shrink-0">₹{item.price}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[0.85rem] text-tertiary italic m-0">No menu available.</p>
                    )}
                  </div>
                </Section>

                {/* Rate & review */}
                <Section title={t('restaurant.rateReview')}>
                  <form className="flex flex-col gap-sm p-md bg-glass-surface border border-glass-border rounded-xl light:bg-white/90 light:border-black/10" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-xs">
                      <label className="text-[0.88rem] font-medium text-primary">{t('restaurant.yourRating')}</label>
                      <div className="flex items-center gap-xs flex-wrap" role="group" aria-label="Rate this restaurant" onMouseLeave={() => setHoveredRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (hoveredRating || userRating)
                          return (
                            <button
                              key={star}
                              type="button"
                              className="bg-transparent border-none p-0.5 cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onFocus={() => setHoveredRating(star)}
                              onBlur={() => setHoveredRating(0)}
                              aria-label={`Rate ${star} out of 5 stars`}
                              aria-pressed={star <= userRating}
                            >
                              <Star size={30} fill={isFilled ? 'var(--accent-purple)' : 'transparent'} color={isFilled ? 'var(--accent-purple)' : 'var(--text-tertiary)'} strokeWidth={isFilled ? 0 : 1.5} />
                            </button>
                          )
                        })}
                        {userRating > 0 && (
                          <span className="ml-sm text-[0.85rem] text-tertiary italic">{userRating} star{userRating !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label htmlFor="feedback-textarea" className="text-[0.88rem] font-medium text-primary">{t('restaurant.yourFeedback')}</label>
                      <textarea
                        id="feedback-textarea"
                        className="w-full p-sm bg-background-secondary border border-glass-border rounded-lg text-primary text-[0.9rem] leading-[1.5] resize-y transition-all duration-200 outline-none placeholder:text-tertiary focus:border-accent-purple light:bg-white light:border-black/10"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('restaurant.feedbackPlaceholder')}
                        rows={4}
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-accent-purple text-white rounded-lg text-[0.92rem] font-semibold cursor-pointer transition-all duration-200 self-start disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:shadow-glow hover:not-disabled:-translate-y-[1px] flex items-center gap-sm"
                      disabled={userRating === 0 || isSubmitted || reviewLoading}
                    >
                      {reviewLoading && <Loader size={14} className="animate-spin" />}
                      {isSubmitted ? t('restaurant.thankYou') : t('restaurant.submitReview')}
                    </button>
                    {!isLoggedIn && (
                      <p className="text-[0.82rem] text-secondary m-0">
                        Please <button type="button" className="text-accent-purple underline bg-transparent border-none cursor-pointer p-0" onClick={onClose}>log in</button> to submit a review.
                      </p>
                    )}
                    {reviewError && <p className="text-[0.82rem] text-red-400 m-0">{reviewError}</p>}
                  </form>
                </Section>

                {/* Reviews */}
                <Section title={t('common.reviews')}>
                  <div className="flex flex-col gap-sm">
                    {localReviews.length === 0 && (
                      <p className="text-[0.85rem] text-tertiary italic m-0">No reviews yet. Be the first!</p>
                    )}
                    {localReviews.map((review, idx) => (
                      <div key={idx} className="p-sm md:p-md bg-glass-surface/30 border border-glass-border border-l-[3px] border-l-accent-purple/40 rounded-lg transition-all duration-200 hover:bg-glass-hover light:bg-white/90 light:border-black/10">
                        <div className="flex justify-between items-center mb-xs gap-sm">
                          <span className="font-semibold text-primary text-[0.9rem] truncate">
                            {review.userName || (typeof review.user === 'object' ? review.user?.name : review.user) || 'Anonymous'}
                          </span>
                          <div className="flex gap-[0.1rem] shrink-0">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} fill={i < review.rating ? 'var(--accent-purple)' : 'transparent'} color={i < review.rating ? 'var(--accent-purple)' : 'var(--text-tertiary)'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-secondary leading-[1.6] m-0 text-[0.88rem]">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Location sidebar — shows first on phone, sticky on desktop */}
              <div className="order-1 md:order-2 w-full md:w-[280px] md:flex-[0_0_280px] flex flex-col gap-sm md:self-start md:sticky md:top-0">
                <span className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-tertiary flex items-center gap-xs">
                  <MapPin size={14} /> Location
                </span>
                <div className="relative h-[160px] md:h-[180px] bg-background-secondary border border-glass-border rounded-xl overflow-hidden w-full shadow-glass light:bg-white/90 light:border-black/10">
                  {isOpen && (
                    <ModalMap
                      position={
                        restaurant.location?.coordinates
                          ? { lat: restaurant.location.coordinates[1], lng: restaurant.location.coordinates[0] }
                          : { lat: 19.8762, lng: 75.3433 }
                      }
                      title={restaurant.name}
                      directions={directions}
                      userLocation={userLocation}
                    />
                  )}
                </div>
                <div className="p-sm bg-glass-surface/40 border border-glass-border rounded-xl light:bg-white/90 light:border-black/10">
                  <p className="text-[0.72rem] text-tertiary uppercase tracking-wide mb-1 flex items-center gap-1 m-0">
                    <MapPin size={11} /> Full Address
                  </p>
                  <p className="text-[0.84rem] text-secondary leading-[1.5] m-0">
                    {restaurant.address || `${restaurant.area}, Aurangabad`}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default RestaurantModal
