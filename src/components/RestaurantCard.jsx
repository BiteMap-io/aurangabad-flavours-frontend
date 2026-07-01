import { motion } from 'framer-motion'
import { MapPin, Clock, Star, Navigation } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import MealTimeBadge from './MealTimeBadge'
import CrowdIndicator from './CrowdIndicator'
import { getCurrentMealTime, isSuitableForMealTime, getCrowdLevel } from '../utils/diningUtils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RestaurantCard = ({ restaurant, onClick, onGetDirections }) => {
  const { isTouristMode } = useTouristMode()
  const [dirError, setDirError] = useState('')
  const navigate = useNavigate()

  const currentMealTime = getCurrentMealTime()
  const showMealTimeBadge = isSuitableForMealTime(restaurant, currentMealTime)
  const crowdLevel = getCrowdLevel(restaurant)

  // Build 4-image array for desktop 2×2 grid
  const galleryImages = (() => {
    const imgs = []
    if (restaurant.image) imgs.push(restaurant.image)
    if (Array.isArray(restaurant.gallery)) {
      restaurant.gallery.forEach(g => {
        const url = typeof g === 'string' ? g : g?.url
        if (url && url !== restaurant.image) imgs.push(url)
      })
    }
    const fallback = restaurant.image || ''
    while (imgs.length < 4) imgs.push(fallback)
    return imgs.slice(0, 4)
  })()

  const handleGetDirections = (e) => {
    e.stopPropagation()
    const id = restaurant?._id || restaurant?.id
    const coords = restaurant?.location?.coordinates
    if (!coords || coords.length < 2) {
      setDirError('No location data for this restaurant.')
      return
    }
    navigate(`/place/${id}`)
  }

  // #1 — rating color: green ≥4.5, orange 4.0-4.4, red below
  const ratingColor =
    restaurant.rating >= 4.5
      ? 'bg-green-500 text-white'
      : restaurant.rating >= 4.0
      ? 'bg-orange-500 text-white'
      : 'bg-red-500 text-white'

  return (
    <motion.div
      // #10 — left border hover accent
      className="flex flex-col md:flex-row bg-glass-surface backdrop-blur-[20px] border border-glass-border border-l-[3px] border-l-transparent hover:border-l-accent-purple rounded-[1.5rem] cursor-pointer transition-all duration-300 relative hover:bg-glass-hover hover:shadow-glass overflow-hidden"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -3 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Mobile: single full-width image ── */}
      <div className="relative w-full h-[200px] shrink-0 md:hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" loading="lazy" />
        {/* #3 — gradient overlay with name on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* #4 — IHM ribbon badge */}
        {restaurant.ihmRecommended && (
          <div className="absolute top-2 left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-accent-purple text-white text-[0.7rem] font-bold tracking-wide rounded-r-full shadow-lg">
            ⭐ IHM Pick
          </div>
        )}
        {restaurant.verified && (
          <div className="absolute top-9 left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-green-500 text-white text-[0.7rem] font-bold rounded-r-full shadow-lg">
            ✓ Verified
          </div>
        )}
        {isTouristMode && restaurant.rating >= 4.3 && (
          <div className="absolute top-16 left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-blue-500 text-white text-[0.7rem] font-bold rounded-r-full shadow-lg">
            🗺 Tourist Friendly
          </div>
        )}
      </div>

      {/* ── Desktop: 2×2 image grid — fills full card height ── */}
      <div className="relative hidden md:grid grid-cols-2 grid-rows-2 gap-[2px] w-[360px] self-stretch shrink-0">
        {galleryImages.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={img}
              alt={`${restaurant.name} ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
        {/* #3 — bottom gradient overlay on grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none z-10" />
        {/* #3 — restaurant name over gradient */}
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <p className="text-white font-bold text-[1rem] leading-tight drop-shadow-lg line-clamp-1">{restaurant.name}</p>
          <p className="text-white/80 text-[0.75rem] mt-0.5">{restaurant.cuisine}</p>
        </div>
        {/* #4 — IHM ribbon badge */}
        {restaurant.ihmRecommended && (
          <div className="absolute top-3 left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-accent-purple text-white text-[0.7rem] font-bold tracking-wide rounded-r-full shadow-lg z-20">
            ⭐ IHM Pick
          </div>
        )}
        {restaurant.verified && (
          <div className="absolute top-10 left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-green-500 text-white text-[0.7rem] font-bold rounded-r-full shadow-lg z-20">
            ✓ Verified
          </div>
        )}
        {isTouristMode && restaurant.rating >= 4.3 && (
          <div className="absolute top-[4.5rem] left-0 flex items-center gap-1 pl-3 pr-2 py-1 bg-blue-500 text-white text-[0.7rem] font-bold rounded-r-full shadow-lg z-20">
            🗺 Tourist Friendly
          </div>
        )}
      </div>

      {/* ── Text content — #8 more breathing room ── */}
      <div className="flex-1 flex flex-col gap-sm p-sm md:p-lg">

        {/* #1 — prominent rating badge + name row */}
        <div className="flex justify-between items-start gap-sm">
          <h3 className="text-[1.35rem] font-bold text-primary m-0 leading-tight">{restaurant.name}</h3>
          {restaurant.rating && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[1rem] font-bold whitespace-nowrap shrink-0 shadow-md ${ratingColor}`}>
              <Star size={14} fill="white" color="white" />
              <span>{restaurant.rating}</span>
            </div>
          )}
        </div>

        {/* #2 — cuisine · price on one line */}
        <p className="text-secondary text-[0.95rem] m-0">
          {restaurant.cuisine}{restaurant.priceRange ? <span className="text-tertiary"> · {restaurant.priceRange}</span> : ''}
        </p>

        <div className="flex flex-wrap gap-xs">
          {showMealTimeBadge && <MealTimeBadge mealTime={currentMealTime} />}
          <CrowdIndicator level={crowdLevel} />
          {restaurant.foodType === 'veg' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-green-500/15 text-green-400 border border-green-500/30 leading-none">🟢 Pure Veg</span>}
          {restaurant.foodType === 'non-veg' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-red-500/15 text-red-400 border border-red-500/30 leading-none">🔴 Non-Veg</span>}
          {restaurant.foodType === 'both' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 leading-none">🟡 Veg & Non-Veg</span>}
        </div>

        {restaurant.description && (
          <p className="text-secondary text-[0.9rem] leading-[1.6] line-clamp-2 m-0">
            {restaurant.description.length > 120
              ? `${restaurant.description.substring(0, 120)}...`
              : restaurant.description}
          </p>
        )}

        {/* Highlights */}
        {(restaurant.food?.quality > 0 || restaurant.environment?.ambience > 0 || restaurant.staff?.friendliness > 0) && (
          <div className="flex flex-wrap gap-xs">
            {restaurant.food?.quality > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.72rem] text-secondary">
                🍽️ Food <span className="text-accent-purple font-semibold">{'★'.repeat(restaurant.food.quality)}</span>
              </span>
            )}
            {restaurant.environment?.ambience > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.72rem] text-secondary">
                ✨ Ambience <span className="text-accent-purple font-semibold">{'★'.repeat(restaurant.environment.ambience)}</span>
              </span>
            )}
            {restaurant.staff?.friendliness > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.72rem] text-secondary">
                😊 Service <span className="text-accent-purple font-semibold">{'★'.repeat(restaurant.staff.friendliness)}</span>
              </span>
            )}
            {restaurant.food?.valueForMoney > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.72rem] text-secondary">
                💰 Value <span className="text-accent-purple font-semibold">{'★'.repeat(restaurant.food.valueForMoney)}</span>
              </span>
            )}
          </div>
        )}

        {/* Facilities */}
        {restaurant.extraFacilities && Object.values(restaurant.extraFacilities).some(Boolean) && (
          <div className="flex flex-wrap gap-xs">
            {restaurant.extraFacilities.ac && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">❄️ AC</span>}
            {restaurant.extraFacilities.parking && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🅿️ Parking</span>}
            {restaurant.extraFacilities.washroom && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🚻 Washroom</span>}
            {restaurant.extraFacilities.parcel && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">📦 Parcel</span>}
            {restaurant.extraFacilities.disabilityAccess && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">♿ Accessible</span>}
          </div>
        )}

        {/* Signature dishes */}
        {(restaurant.food?.signatureDishes || restaurant.food?.specialtyDishes) && (
          <p className="text-[0.78rem] text-tertiary line-clamp-1 m-0">
            🍴 {[restaurant.food.signatureDishes, restaurant.food.specialtyDishes].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Pricing info */}
        {(restaurant.avgPricePerPerson > 0 || restaurant.seatingCapacity > 0 || restaurant.staff?.serviceType || restaurant.environment?.uniqueFeatures) && (
          <div className="flex flex-wrap gap-xs">
            {restaurant.avgPricePerPerson > 0 && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">💰 ₹{restaurant.avgPricePerPerson}/person</span>}
            {restaurant.seatingCapacity > 0 && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🪑 {restaurant.seatingCapacity} seats</span>}
            {restaurant.staff?.serviceType && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary capitalize">🍽️ {restaurant.staff.serviceType}</span>}
            {restaurant.environment?.uniqueFeatures && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">✨ {restaurant.environment.uniqueFeatures}</span>}
          </div>
        )}

        {/* #9 — prominent Get Directions + location row */}
        <div className="flex gap-sm mt-auto pt-sm items-center flex-wrap">
          <div className="flex items-center gap-xs text-tertiary text-[0.82rem]">
            <MapPin size={13} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-xs text-tertiary text-[0.82rem]">
            <Clock size={13} />
            <span>{restaurant.travelTime}</span>
          </div>
          {/* #9 — prominent pill button */}
          <button
            className="flex items-center gap-1 ml-auto py-1 px-sm bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/30 hover:border-accent-purple rounded-md text-accent-purple text-[0.8rem] font-semibold cursor-pointer transition-all duration-200"
            onClick={handleGetDirections}
            aria-label={`Get directions to ${restaurant.name}`}
          >
            <Navigation size={13} /> Get Directions
          </button>
          {dirError && (
            <span className="w-full text-[0.75rem] text-red-400 mt-1">{dirError}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantCard
