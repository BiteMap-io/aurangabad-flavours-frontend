import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Star, Navigation, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapInvalidator = () => {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

const RestaurantModal = ({ restaurant, isOpen, onClose }) => {
  const { t } = useTranslation()
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (userRating > 0) {
      setIsSubmitted(true)
      setTimeout(() => {
        setUserRating(0)
        setFeedback('')
        setIsSubmitted(false)
      }, 2000)
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
                </div>
                <button className="flex items-center gap-1 lg:gap-xs py-1 px-2 md:py-xs md:px-md lg:py-[0.6rem] lg:px-[1.2rem] bg-glass-surface border border-glass-border rounded-md text-primary text-[0.75rem] md:text-[0.85rem] lg:text-[0.9rem] font-semibold cursor-pointer mt-xs lg:mt-sm transition-all duration-300 w-fit relative overflow-hidden hover:bg-glass-hover hover:border-accent-purple hover:shadow-glow hover:-translate-y-[2px] light:bg-white/90 light:border-black/10 light:hover:bg-white light:text-primary light:hover:shadow-glow/20">
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

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('restaurant.menu')}
                  </h2>
                  <div className="flex flex-col gap-xs">
                    {restaurant.menu?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-[0.85rem] lg:p-[1rem] bg-glass-surface/30 border border-glass-border rounded-md transition-all duration-300 hover:bg-glass-hover hover:border-accent-purple/30 hover:translate-x-1 hover:shadow-glow light:bg-white/90 light:border-black/10">
                        <div className="flex flex-col gap-[0.25rem]">
                          <span className="font-medium text-primary text-[0.9rem] lg:text-[1rem] light:text-primary light:font-semibold">{item.name}</span>
                          <span className="text-[0.85rem] text-tertiary">{item.category}</span>
                        </div>
                        <span className="font-semibold text-primary text-[1rem] lg:text-[1.1rem] light:text-primary light:font-bold">₹{item.price}</span>
                      </div>
                    ))}
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
                      className="py-sm px-lg bg-glass-surface border border-glass-border rounded-md text-primary text-[0.95rem] font-medium cursor-pointer transition-all duration-300 self-start font-inherit disabled:opacity-60 disabled:cursor-not-allowed hover:not(:disabled):bg-glass-hover hover:not(:disabled):border-accent-purple hover:not(:disabled):shadow-glow hover:not(:disabled):-translate-y-[2px] active:not(:disabled):translate-y-0 focus:outline-[2px] focus:outline-accent-purple focus:outline-offset-2 light:bg-white/90 light:border-black/10 light:text-primary light:hover:not(:disabled):bg-white light:hover:not(:disabled):border-accent-purple light:hover:not(:disabled):shadow-glow/20"
                      disabled={userRating === 0 || isSubmitted}
                    >
                      {isSubmitted ? t('restaurant.thankYou') : t('restaurant.submitReview')}
                    </button>
                  </form>
                </section>

                <section className="flex flex-col gap-xs lg:gap-xs">
                  <h2 className="text-[1rem] lg:text-[1.15rem] text-primary m-0 pb-xs lg:pb-sm border-b-2 border-transparent font-bold tracking-[-0.01em] uppercase lg:text-[0.85rem] lg:tracking-[0.08em] flex items-center gap-sm light:text-primary light:border-black/10" style={{borderImage: 'linear-gradient(to right, var(--accent-purple), transparent) 1'}}>
                    {t('common.reviews')}
                  </h2>
                  <div className="flex flex-col gap-sm">
                    {restaurant.reviews?.map((review, idx) => (
                      <div key={idx} className="p-sm lg:p-md bg-glass-surface/20 border border-glass-border rounded-md transition-all duration-300 border-l-[3px] border-l-accent-purple/30 hover:bg-glass-hover hover:border-l-accent-purple light:bg-white/90 light:border-black/10">
                        <div className="flex justify-between items-center mb-xs">
                          <span className="font-semibold text-primary light:text-primary light:font-semibold">{typeof review.user === 'object' ? review.user.name : (review.user || 'Anonymous')}</span>
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
                        <p className="text-secondary leading-[1.6] m-0">{review.comment}</p>
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
                  <MapContainer
                    center={restaurant.location?.coordinates ? [restaurant.location.coordinates[1], restaurant.location.coordinates[0]] : [19.8762, 75.3433]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full bg-background-secondary rounded-lg"
                    key={restaurant._id || restaurant.id}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapInvalidator />
                    <Marker position={restaurant.location?.coordinates ? [restaurant.location.coordinates[1], restaurant.location.coordinates[0]] : [19.8762, 75.3433]}>
                      <Popup>
                        <strong>{restaurant.name}</strong>
                        <br />
                        {restaurant.area}
                      </Popup>
                    </Marker>
                  </MapContainer>
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
