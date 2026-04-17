import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Star, Navigation, ChevronLeft, ChevronRight, Heart, Route, Loader } from 'lucide-react'
import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { useGoogleMapsLoaded } from '../context/GoogleMapsContext'
import { useDirections } from '../hooks/useDirections'
import { useUserAuth } from '../context/UserAuthContext'
import api from '../services/api'

const modalMapStyle = { width: '100%', height: '100%' }

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
    <div className="w-full h-full flex items-center justify-center text-secondary text-xs">Loading…</div>
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

  // Reset route when modal closes or restaurant changes
  useEffect(() => {
    clearRoute()
    setCurrentImageIndex(0)
    setReviewError('')
    setReviewSuccess(false)
    setLocalReviews(restaurant?.reviews || [])
  }, [restaurant, isOpen, clearRoute])

  // Auto-trigger directions if card's "Get Directions" was clicked
  useEffect(() => {
    if (isOpen && restaurant?._autoDirections) {
      getDirections(restaurant)
    }
  }, [isOpen, restaurant, getDirections])

  if (!restaurant) return null

  const images = restaurant.gallery || [restaurant.image]

  const handleStarClick = (rating) => {
    setUserRating(rating)
  }

  const handleStarHover = (rating) => {
    setHoveredRating(rating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const averageRating = restaurant.reviews?.length
    ? (restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) / restaurant.reviews.length).toFixed(1)
    : restaurant.rating

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-auto p-sm md:p-md lg:p-xl">
          <motion.div
            className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-[8px] z-[-1] transition-all duration-300 light:bg-white/80 light:backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-[1100px] h-full max-h-[100vh] md:h-auto md:max-h-[85vh] bg-background-primary/95 border border-glass-border md:rounded-xl overflow-y-auto overflow-x-hidden flex flex-col shadow-glass light:bg-background-primary light:border-glass-border light:shadow-glass"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button 
              className="fixed top-sm right-sm md:absolute md:top-md md:right-md w-10 h-10 bg-black/60 backdrop-blur-md border border-glass-border rounded-full flex items-center justify-center cursor-pointer z-50 transition-all duration-300 hover:rotate-90 light:bg-white/90 light:border-black/10 light:text-primary light:hover:bg-white light:hover:shadow-glass" 
              onClick={onClose} 
              aria-label={t('accessibility.closeModal')}
            >
              <X size={20} className="text-white light:text-primary" />
            </button>

            {/* Photo Gallery Header */}
            <div className="relative w-full bg-background-secondary border-b border-glass-border light:bg-background-primary light:border-glass-border/10">
              <div className="relative w-full h-[240px] md:h-[240px] lg:h-[280px] light:lg:h-[300px] overflow-hidden rounded-none">
                <img
                  src={images[currentImageIndex]}
                  alt={`${restaurant.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                {images.length > 1 && (
                  <>
                    <button 
                      className="absolute top-1/2 -translate-y-1/2 left-xs md:left-sm lg:left-md w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-black/50 border border-white/10 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-300 backdrop-blur-[10px] hover:bg-black/70 hover:border-accent-purple hover:shadow-glow light:bg-white/80 light:border-black/10 light:text-primary" 
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className="absolute top-1/2 -translate-y-1/2 right-xs md:right-sm lg:right-md w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-black/50 border border-white/10 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-300 backdrop-blur-[10px] hover:bg-black/70 hover:border-accent-purple hover:shadow-glow light:bg-white/80 light:border-black/10 light:text-primary" 
                      onClick={nextImage}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <button
                  className={`absolute top-sm md:top-md right-[calc(1rem+46px)] md:right-[calc(1rem+50px)] lg:right-[calc(1rem+60px)] w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-black/50 border border-white/10 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-300 backdrop-blur-[10px] hover:bg-black/70 light:bg-white/80 ${isFavorite ? '!bg-[#ff4757] !border-[#ff4757] !text-white' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? '#ffffff' : 'none'} className={isFavorite ? 'text-white' : ''} />
                </button>

                <div className="absolute bottom-xs md:bottom-sm lg:bottom-md right-xs md:right-sm lg:right-md py-1 px-2 md:py-2 md:px-3 bg-black/50 border border-white/10 rounded-md text-white text-[0.75rem] md:text-[0.8rem] lg:text-[0.875rem] font-medium backdrop-blur-[10px] z-10 light:bg-white/80 light:border-black/10 light:text-primary">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {restaurant.ihmRecommended && (
                  <div className="absolute bottom-xs lg:bottom-sm left-xs bg-gradient-to-br from-accent-purple to-[#9b59b6] text-white border border-white/20 rounded-sm px-2 py-1 text-[0.75rem] font-semibold backdrop-blur-[10px] z-10">
                    {t('restaurant.ihmRecommended')}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-xs p-xs md:p-sm lg:p-md bg-background-secondary overflow-x-auto scrollbar-none light:bg-background-primary border-t border-glass-border/10">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      className={`shrink-0 w-[45px] h-[34px] md:w-[50px] md:h-[38px] lg:w-[60px] lg:h-[45px] border-2 border-transparent rounded-sm overflow-hidden cursor-pointer transition-all duration-300 bg-transparent p-0 ${index === currentImageIndex ? '!border-accent-purple shadow-glow/40' : 'opacity-60 hover:opacity-100'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Restaurant Info Header */}
            <div className="relative flex flex-col p-md md:p-md lg:p-lg border-b border-glass-border shrink-0 min-h-auto items-start light:border-black/10 lg:p-lg">
              <div className="flex-1 flex flex-col gap-xs lg:gap-sm min-w-0 justify-start py-1 lg:py-xs">
                <h1 className="text-[1.1rem] md:text-[1.3rem] lg:text-[2rem] m-0 text-primary leading-[1.1] font-bold tracking-[-0.02em] bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent inline-block light:text-primary light:!bg-none">{restaurant.name}</h1>
                <p className="text-[0.85rem] md:text-[0.95rem] lg:text-[1rem] text-secondary m-0 font-medium">{restaurant.cuisine}</p>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-xs md:gap-sm lg:gap-md mt-xs flex-wrap">
                  <div className="flex items-center gap-1 lg:gap-2">
                    <Star size={18} fill="var(--accent-purple)" color="var(--accent-purple)" />
                    <span className="text-[1rem] md:text-[1.1rem] lg:text-[1.2rem] font-bold text-primary">{averageRating}</span>
                    <span className="text-[0.8rem] lg:text-[0.9rem] text-tertiary">
                      ({restaurant.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <div className="text-[0.9rem] md:text-[1rem] lg:text-[1.1rem] font-semibold text-accent-purple">{restaurant.priceRange}</div>
                </div>
                <div className="flex items-center gap-1 lg:gap-xs text-secondary text-[0.75rem] md:text-[0.85rem] lg:text-[0.9rem] mt-xs flex-wrap">
                  <MapPin size={16} />
                  <span>{restaurant.area}</span>
                  <span className="opacity-50 mx-[0.125rem] lg:mx-1">•</span>
                  <span>{restaurant.distance}</span>
                  <span className="opacity-50 mx-[0.125rem] lg:mx-1">•</span>
                  <Clock size={16} />
                  <span>{restaurant.travelTime}</span>
                  {restaurant.foodType && (
                    <>
                      <span className="opacity-50 mx-[0.125rem] lg:mx-1">•</span>
                      <span className={`font-semibold ${restaurant.foodType === 'veg' ? 'text-green-400' : restaurant.foodType === 'non-veg' ? 'text-red-400' : 'text-purple-400'}`}>
                        {restaurant.foodType === 'veg' ? '🟢 Pure Veg' : restaurant.foodType === 'non-veg' ? '🔴 Non-Veg' : '🟡 Veg & Non-Veg'}
                      </span>
                    </>
                  )}
                </div>
                <button className="flex items-center gap-1 lg:gap-xs py-1 px-2 md:py-xs md:px-md lg:py-[0.6rem] lg:px-[1.2rem] bg-glass-surface border border-glass-border rounded-md text-primary text-[0.75rem] md:text-[0.85rem] lg:text-[0.9rem] font-semibold cursor-pointer mt-xs lg:mt-sm transition-all duration-300 w-fit relative overflow-hidden hover:bg-glass-hover hover:border-accent-purple hover:shadow-glow hover:-translate-y-[2px] light:bg-white/90 light:border-black/10 light:hover:bg-white light:text-primary light:hover:shadow-glow/20"
                  onClick={() => {
                    const id = restaurant?._id || restaurant?.id
                    onClose()
                    navigate(`/map?directTo=${id}`)
                  }}
                >
                  <Navigation size={16} />
                  <span>{t('common.directions')}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-md p-sm md:p-sm lg:p-md xl:p-lg shrink-0 h-auto min-h-min">
              <div className="flex-[2] flex flex-col gap-sm md:gap-sm lg:gap-md min-w-0 h-auto">
                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('restaurant.about')}
                  </h2>
                  <p className="text-secondary leading-[1.6] m-0 text-[0.9rem] lg:text-[1rem]">{restaurant.description}</p>
                </section>

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('restaurant.facilities')}
                  </h2>
                  <div className="flex flex-wrap gap-sm">
                    {restaurant.facilities?.map((facility, idx) => (
                      <div key={idx} className="py-[0.4rem] px-[0.9rem] bg-glass-surface border border-glass-border rounded-pill text-[0.8rem] text-secondary font-medium transition-all duration-300 cursor-default hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary hover:-translate-y-[2px] hover:shadow-glow light:bg-white/90 light:border-black/10 light:text-primary">
                        {facility}
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Highlights (ratings) ── */}
                {(restaurant.food?.quality > 0 || restaurant.staff?.friendliness > 0 || restaurant.environment?.ambience > 0) && (
                  <section className="flex flex-col gap-xs">
                    <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs border-b-2 border-transparent font-bold uppercase lg:text-[0.85rem] lg:tracking-[0.08em] light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                      Highlights
                    </h2>
                    <div className="grid grid-cols-2 gap-xs max-md:grid-cols-1">
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
                        <div key={h.label} className="flex items-center justify-between p-xs bg-glass-surface/30 border border-glass-border rounded-md">
                          <span className="text-[0.8rem] text-secondary">{h.label}</span>
                          <span className="text-[0.8rem] font-semibold text-accent-purple">{'⭐'.repeat(h.val)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Extra Facilities ── */}
                {restaurant.extraFacilities && Object.values(restaurant.extraFacilities).some(Boolean) && (
                  <section className="flex flex-col gap-xs">
                    <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs border-b-2 border-transparent font-bold uppercase lg:text-[0.85rem] lg:tracking-[0.08em] light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                      Amenities
                    </h2>
                    <div className="flex flex-wrap gap-xs">
                      {restaurant.extraFacilities.ac && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">❄️ AC</span>}
                      {restaurant.extraFacilities.disabilityAccess && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">♿ Disability Access</span>}
                      {restaurant.extraFacilities.washroom && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🚻 Washroom</span>}
                      {restaurant.extraFacilities.parking && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🅿️ Parking</span>}
                      {restaurant.extraFacilities.parcel && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">📦 Parcel</span>}
                    </div>
                  </section>
                )}

                {/* ── Special Dishes ── */}
                {(restaurant.food?.signatureDishes || restaurant.food?.specialtyDishes) && (
                  <section className="flex flex-col gap-xs">
                    <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs border-b-2 border-transparent font-bold uppercase lg:text-[0.85rem] lg:tracking-[0.08em] light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                      Special Dishes
                    </h2>
                    <div className="flex flex-col gap-xs">
                      {restaurant.food?.signatureDishes && (
                        <div className="flex items-start gap-sm p-xs bg-glass-surface/30 border border-glass-border rounded-md">
                          <span className="text-[0.75rem] text-tertiary font-semibold uppercase shrink-0 mt-0.5">Signature</span>
                          <span className="text-[0.85rem] text-primary">{restaurant.food.signatureDishes}</span>
                        </div>
                      )}
                      {restaurant.food?.specialtyDishes && (
                        <div className="flex items-start gap-sm p-xs bg-glass-surface/30 border border-glass-border rounded-md">
                          <span className="text-[0.75rem] text-tertiary font-semibold uppercase shrink-0 mt-0.5">Specialty</span>
                          <span className="text-[0.85rem] text-primary">{restaurant.food.specialtyDishes}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ── Pricing & Info ── */}
                {(restaurant.avgPricePerPerson > 0 || restaurant.seatingCapacity > 0 || restaurant.staff?.serviceType || restaurant.environment?.uniqueFeatures || restaurant.sustainabilityPractices) && (
                  <section className="flex flex-col gap-xs">
                    <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs border-b-2 border-transparent font-bold uppercase lg:text-[0.85rem] lg:tracking-[0.08em] light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                      Info & Pricing
                    </h2>
                    <div className="flex flex-wrap gap-xs">
                      {restaurant.avgPricePerPerson > 0 && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">💰 ₹{restaurant.avgPricePerPerson}/person</span>}
                      {restaurant.seatingCapacity > 0 && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🪑 {restaurant.seatingCapacity} seats</span>}
                      {restaurant.staff?.serviceType && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary capitalize">🍽️ {restaurant.staff.serviceType}</span>}
                      {restaurant.environment?.uniqueFeatures && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">✨ {restaurant.environment.uniqueFeatures}</span>}
                      {restaurant.sustainabilityPractices && <span className="py-1 px-sm bg-glass-surface border border-glass-border rounded-pill text-[0.78rem] text-secondary">🌱 {restaurant.sustainabilityPractices}</span>}
                    </div>
                  </section>
                )}

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('restaurant.menu')}
                  </h2>
                  <div className="flex flex-col gap-xs">
                    {/* menuItems from Excel upload */}
                    {restaurant.menuItems?.length > 0 ? (
                      (() => {
                        const categories = [...new Set(restaurant.menuItems.map(i => i.category || 'Other'))]
                        return categories.map(cat => (
                          <div key={cat} className="mb-sm">
                            {cat && <p className="text-[0.75rem] text-tertiary uppercase tracking-wide mb-xs font-semibold">{cat}</p>}
                            {restaurant.menuItems.filter(i => (i.category || 'Other') === cat).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-[0.75rem] bg-glass-surface/30 border border-glass-border rounded-md mb-1 hover:bg-glass-hover transition-all duration-200 light:bg-white/90 light:border-black/10">
                                <div className="flex items-center gap-sm">
                                  <span className="text-[0.7rem]">{item.isVeg ? '🟢' : '🔴'}</span>
                                  <span className="font-medium text-primary text-[0.88rem]">{item.name}</span>
                                </div>
                                <span className="font-semibold text-primary text-[0.9rem]">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        ))
                      })()
                    ) : restaurant.menu?.length > 0 ? (
                      restaurant.menu.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-[0.85rem] lg:p-[1rem] bg-glass-surface/30 border border-glass-border rounded-md transition-all duration-300 hover:bg-glass-hover hover:border-accent-purple/30 hover:translate-x-1 hover:shadow-glow light:bg-white/90 light:border-black/10">
                          <div className="flex flex-col gap-[0.25rem]">
                            <span className="font-medium text-primary text-[0.9rem] lg:text-[1rem] light:text-primary light:font-semibold">{item.name}</span>
                            <span className="text-[0.85rem] text-tertiary">{item.category}</span>
                          </div>
                          <span className="font-semibold text-primary text-[1rem] lg:text-[1.1rem] light:text-primary light:font-bold">₹{item.price}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[0.85rem] text-tertiary italic">No menu available.</p>
                    )}
                  </div>
                </section>

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('restaurant.rateReview')}
                  </h2>
                  <form className="flex flex-col gap-sm p-sm bg-glass-surface border border-glass-border rounded-md light:bg-white/90 light:border-black/10" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-sm">
                      <label htmlFor="rating-input" className="text-[0.9rem] font-medium text-primary light:text-primary light:font-semibold">
                        {t('restaurant.yourRating')}
                      </label>
                      <div
                        className="flex items-center gap-xs flex-wrap"
                        role="group"
                        aria-label="Rate this restaurant"
                        onMouseLeave={handleStarLeave}
                      >
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (hoveredRating || userRating)
                          return (
                            <button
                              key={star}
                              type="button"
                              className="bg-transparent border-none p-1 cursor-pointer transition-all duration-300 flex items-center justify-center rounded-sm outline-none hover:scale-110 focus:outline-[2px] focus:outline-accent-purple focus:outline-offset-2"
                              onClick={() => handleStarClick(star)}
                              onMouseEnter={() => handleStarHover(star)}
                              onFocus={() => handleStarHover(star)}
                              onBlur={handleStarLeave}
                              aria-label={`Rate ${star} out of 5 stars`}
                              aria-pressed={star <= userRating}
                            >
                              <Star
                                size={28}
                                fill={isFilled ? 'var(--accent-purple)' : 'transparent'}
                                color={isFilled ? 'var(--accent-purple)' : 'var(--text-tertiary)'}
                                strokeWidth={isFilled ? 0 : 1.5}
                              />
                            </button>
                          )
                        })}
                        {userRating > 0 && (
                          <span className="ml-sm text-[0.875rem] text-tertiary italic">
                            {userRating} star{userRating !== 1 ? 's' : ''} selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label htmlFor="feedback-textarea" className="text-[0.9rem] font-medium text-primary light:text-primary light:font-semibold">
                        {t('restaurant.yourFeedback')}
                      </label>
                      <textarea
                        id="feedback-textarea"
                        className="w-full p-sm bg-background-secondary border border-glass-border rounded-md text-primary text-[0.9rem] font-inherit leading-[1.5] resize-y transition-all duration-300 outline-none placeholder:text-tertiary focus:border-accent-purple focus:shadow-glow light:bg-white/90 light:border-black/10 light:text-primary light:placeholder:text-tertiary light:focus:border-accent-purple light:focus:shadow-glow/20"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('restaurant.feedbackPlaceholder')}
                        rows={4}
                        aria-label="Write your feedback"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-sm px-lg bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] font-medium cursor-pointer transition-all duration-300 self-start font-inherit disabled:opacity-60 disabled:cursor-not-allowed hover:not(:disabled):bg-glass-hover hover:not(:disabled):border-accent-purple hover:not(:disabled):shadow-glow hover:not(:disabled):-translate-y-[2px] active:not(:disabled):translate-y-0 focus:outline-[2px] focus:outline-accent-purple focus:outline-offset-2 light:bg-white/90 light:border-black/10 light:text-primary light:hover:not(:disabled):bg-white light:hover:not(:disabled):border-accent-purple light:hover:not(:disabled):shadow-glow/20 flex items-center gap-sm"
                      disabled={userRating === 0 || isSubmitted || reviewLoading}
                    >
                      {reviewLoading && <Loader size={14} className="animate-spin" />}
                      {isSubmitted ? t('restaurant.thankYou') : t('restaurant.submitReview')}
                    </button>
                    {!isLoggedIn && (
                      <p className="text-[0.82rem] text-secondary mt-xs">
                        Please <button type="button" className="text-accent-purple underline bg-transparent border-none cursor-pointer" onClick={() => { onClose(); }}>log in</button> to submit a review.
                      </p>
                    )}
                    {reviewError && <p className="text-[0.82rem] text-red-400 mt-xs">{reviewError}</p>}
                  </form>
                </section>

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('common.reviews')}
                  </h2>
                  <div className="flex flex-col gap-sm">
                    {localReviews.length === 0 && (
                      <p className="text-[0.85rem] text-tertiary italic">No reviews yet. Be the first!</p>
                    )}
                    {localReviews.map((review, idx) => (
                      <div key={idx} className="p-sm lg:p-md bg-glass-surface/20 border border-glass-border rounded-md transition-all duration-300 border-l-[3px] border-l-accent-purple/30 hover:bg-glass-hover hover:border-l-accent-purple light:bg-white/90 light:border-black/10">
                        <div className="flex justify-between items-center mb-xs">
                          <span className="font-semibold text-primary light:text-primary light:font-semibold text-[0.9rem]">
                            {review.userName || (typeof review.user === 'object' ? review.user?.name : review.user) || 'Anonymous'}
                          </span>
                          <div className="flex gap-[0.25rem]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? 'var(--accent-purple)' : 'transparent'}
                                color={i < review.rating ? 'var(--accent-purple)' : 'var(--text-tertiary)'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-secondary leading-[1.6] m-0 text-[0.88rem]">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="flex-1 w-full md:w-[280px] md:flex-[0_0_280px] flex flex-col gap-sm md:align-self-stretch lg:self-start md:static lg:sticky lg:top-0">
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-tertiary flex items-center gap-xs">
                  <MapPin size={14} />
                  Location
                </span>
                <div className="relative h-[120px] md:h-[130px] lg:h-[180px] bg-background-secondary border border-glass-border rounded-lg overflow-hidden w-full shadow-glass transition-all duration-300 lg:hover:-translate-y-[2px] lg:hover:shadow-glow lg:hover:border-accent-purple/40 light:bg-white/90 light:border-black/10">
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

                {/* Full Address — shown directly below map */}
                <div className="mt-sm p-sm bg-glass-surface/30 border border-glass-border rounded-lg">
                  <p className="text-[0.72rem] text-tertiary uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin size={11} /> Full Address
                  </p>
                  <p className="text-[0.82rem] text-secondary leading-[1.5] m-0">
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
