import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Star, Navigation, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './RestaurantModal.css'

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

  // Create image gallery from restaurant data
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
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{
              opacity: 1,
              scale: 1,
              x: '-50%',
              y: '-50%'
            }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
            }}
          >
            <button className="modal-close" onClick={onClose} aria-label={t('accessibility.closeModal')}>
              <X size={24} />
            </button>

            {/* Photo Gallery Header */}
            <div className="modal-gallery">
              <div className="gallery-main">
                <img
                  src={images[currentImageIndex]}
                  alt={`${restaurant.name} - Image ${currentImageIndex + 1}`}
                  className="gallery-main-image"
                />

                {images.length > 1 && (
                  <>
                    <button className="gallery-nav gallery-prev" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="gallery-nav gallery-next" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <button
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? '#ff4757' : 'none'} />
                </button>

                <div className="gallery-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {restaurant.ihmRecommended && (
                  <div className="modal-badge ihm-badge">{t('restaurant.ihmRecommended')}</div>
                )}
              </div>

              {images.length > 1 && (
                <div className="gallery-thumbnails">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Restaurant Info Header */}
            <div className="modal-header">
              <div className="modal-info">
                <h1>{restaurant.name}</h1>
                <p className="modal-cuisine">{restaurant.cuisine}</p>
                <div className="modal-meta">
                  <div className="rating-display">
                    <Star size={18} fill="#FFD700" color="#FFD700" />
                    <span className="rating-value">{averageRating}</span>
                    <span className="rating-count">
                      ({restaurant.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <div className="price-display">{restaurant.priceRange}</div>
                </div>
                <div className="modal-location">
                  <MapPin size={16} />
                  <span>{restaurant.area}</span>
                  <span className="separator">•</span>
                  <span>{restaurant.distance}</span>
                  <span className="separator">•</span>
                  <Clock size={16} />
                  <span>{restaurant.travelTime}</span>
                </div>
                <button className="directions-btn">
                  <Navigation size={16} />
                  <span>{t('common.directions')}</span>
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-main">
                <section className="modal-section">
                  <h2>{t('restaurant.about')}</h2>
                  <p>{restaurant.description}</p>
                </section>

                <section className="modal-section">
                  <h2>{t('restaurant.facilities')}</h2>
                  <div className="facilities-grid">
                    {restaurant.facilities?.map((facility, idx) => (
                      <div key={idx} className="facility-tag">
                        {facility}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="modal-section">
                  <h2>{t('restaurant.menu')}</h2>
                  <div className="menu-list">
                    {restaurant.menu?.map((item, idx) => (
                      <div key={idx} className="menu-item">
                        <div className="menu-item-info">
                          <span className="menu-item-name">{item.name}</span>
                          <span className="menu-item-category">{item.category}</span>
                        </div>
                        <span className="menu-item-price">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="modal-section">
                  <h2>{t('restaurant.rateReview')}</h2>
                  <form className="rate-review-form" onSubmit={handleSubmit}>
                    <div className="rating-input-container">
                      <label htmlFor="rating-input" className="rating-label">
                        {t('restaurant.yourRating')}
                      </label>
                      <div
                        className="star-rating"
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
                              className="star-button"
                              onClick={() => handleStarClick(star)}
                              onMouseEnter={() => handleStarHover(star)}
                              onFocus={() => handleStarHover(star)}
                              onBlur={handleStarLeave}
                              aria-label={`Rate ${star} out of 5 stars`}
                              aria-pressed={star <= userRating}
                            >
                              <Star
                                size={28}
                                fill={isFilled ? '#FFD700' : 'transparent'}
                                color={isFilled ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'}
                                strokeWidth={isFilled ? 0 : 1.5}
                              />
                            </button>
                          )
                        })}
                        {userRating > 0 && (
                          <span className="rating-selected-text">
                            {userRating} star{userRating !== 1 ? 's' : ''} selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="feedback-input-container">
                      <label htmlFor="feedback-textarea" className="feedback-label">
                        {t('restaurant.yourFeedback')}
                      </label>
                      <textarea
                        id="feedback-textarea"
                        className="feedback-textarea"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('restaurant.feedbackPlaceholder')}
                        rows={4}
                        aria-label="Write your feedback"
                      />
                    </div>

                    <button
                      type="submit"
                      className="submit-review-btn"
                      disabled={userRating === 0 || isSubmitted}
                    >
                      {isSubmitted ? t('restaurant.thankYou') : t('restaurant.submitReview')}
                    </button>
                  </form>
                </section>

                <section className="modal-section">
                  <h2>{t('common.reviews')}</h2>
                  <div className="reviews-list">
                    {restaurant.reviews?.map((review, idx) => (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <span className="review-user">{typeof review.user === 'object' ? review.user.name : (review.user || 'Anonymous')}</span>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? '#FFD700' : 'transparent'}
                                color={i < review.rating ? '#FFD700' : '#666'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="modal-sidebar">
                <span className="map-label">
                  <MapPin size={14} />
                  Location
                </span>
                <div className="map-container">
                    <MapContainer
                      center={restaurant.location?.coordinates ? [restaurant.location.coordinates[1], restaurant.location.coordinates[0]] : [19.8762, 75.3433]}
                      zoom={13}
                      scrollWheelZoom={false}
                      style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-lg)' }}
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
        </>
      )}
    </AnimatePresence>
  )
}

export default RestaurantModal

