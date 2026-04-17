import { motion } from 'framer-motion'
import { MapPin, Clock, Star, Navigation, Loader } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import MealTimeBadge from './MealTimeBadge'
import CrowdIndicator from './CrowdIndicator'
import { getCurrentMealTime, isSuitableForMealTime, getCrowdLevel } from '../utils/diningUtils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RestaurantCard = ({ restaurant, onClick, onGetDirections }) => {
  const { isTouristMode } = useTouristMode()
  const [dirLoading, setDirLoading] = useState(false)
  const [dirError, setDirError] = useState('')
  const navigate = useNavigate()

  const currentMealTime = getCurrentMealTime()
  const showMealTimeBadge = isSuitableForMealTime(restaurant, currentMealTime)
  const crowdLevel = getCrowdLevel(restaurant)

  const handleGetDirections = (e) => {
    e.stopPropagation()
    const id = restaurant?._id || restaurant?.id
    const coords = restaurant?.location?.coordinates
    if (!coords || coords.length < 2) {
      setDirError('No location data for this restaurant.')
      return
    }
    // Navigate to map page — MapView will auto-trigger routing
    navigate(`/map?directTo=${id}`)
  }

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-md p-md bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-[1.5rem] cursor-pointer transition-all duration-300 relative hover:bg-glass-hover hover:border-accent-purple/20 hover:shadow-glass"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full md:w-[200px] h-[200px] md:h-[150px] rounded-md overflow-hidden shrink-0">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.ihmRecommended && (
          <div className="absolute top-xs left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-accent-purple/80">IHM Recommended</div>
        )}
        {restaurant.verified && (
          <div className="absolute top-[2.5rem] left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-green-500/70">Verified</div>
        )}
        {isTouristMode && restaurant.rating >= 4.3 && (
          <div className="absolute top-[4.5rem] left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-blue-500/70">Tourist Friendly</div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-xs">
        <div className="flex justify-between items-start gap-sm">
          <h3 className="text-xl font-semibold text-primary m-0">{restaurant.name}</h3>
          <div className="flex items-center gap-1 px-2 py-1 bg-glass-surface border border-glass-border rounded-[0.5rem] text-sm font-semibold whitespace-nowrap">
            <Star size={14} fill="var(--accent-purple)" color="var(--accent-purple)" className="drop-shadow-glow" />
            <span className="text-primary">{restaurant.rating}</span>
          </div>
        </div>

        <p className="text-secondary text-[0.9rem] m-0">{restaurant.cuisine}</p>
        <p className="text-primary text-[0.9rem] font-medium m-0">{restaurant.priceRange}</p>
        
        <div className="flex flex-wrap gap-xs my-sm">
          {showMealTimeBadge && <MealTimeBadge mealTime={currentMealTime} />}
          <CrowdIndicator level={crowdLevel} />
          {/* Food type badge */}
          {restaurant.foodType === 'veg' && <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-green-500/15 text-green-400 border border-green-500/30">🟢 Pure Veg</span>}
          {restaurant.foodType === 'non-veg' && <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">🔴 Non-Veg</span>}
          {restaurant.foodType === 'both' && <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">🟡 Veg & Non-Veg</span>}
        </div>
        
        {restaurant.description && (
          <p className="text-secondary text-[0.85rem] leading-[1.4] my-xs line-clamp-2">
            {restaurant.description.length > 100 
              ? `${restaurant.description.substring(0, 100)}...` 
              : restaurant.description}
          </p>
        )}

        {/* ── Highlights row ── */}
        {(restaurant.food?.quality > 0 || restaurant.environment?.ambience > 0 || restaurant.staff?.friendliness > 0) && (
          <div className="flex flex-wrap gap-xs mt-xs">
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

        {/* ── Extra facilities pills ── */}
        {restaurant.extraFacilities && Object.values(restaurant.extraFacilities).some(Boolean) && (
          <div className="flex flex-wrap gap-xs mt-xs">
            {restaurant.extraFacilities.ac && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">❄️ AC</span>}
            {restaurant.extraFacilities.parking && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🅿️ Parking</span>}
            {restaurant.extraFacilities.washroom && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🚻 Washroom</span>}
            {restaurant.extraFacilities.parcel && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">📦 Parcel</span>}
            {restaurant.extraFacilities.disabilityAccess && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">♿ Accessible</span>}
          </div>
        )}

        {/* ── Signature / Specialty dishes ── */}
        {(restaurant.food?.signatureDishes || restaurant.food?.specialtyDishes) && (
          <p className="text-[0.78rem] text-tertiary mt-xs line-clamp-1">
            🍴 {[restaurant.food.signatureDishes, restaurant.food.specialtyDishes].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* ── Pricing & info row ── */}
        {(restaurant.avgPricePerPerson > 0 || restaurant.seatingCapacity > 0 || restaurant.staff?.serviceType || restaurant.environment?.uniqueFeatures) && (
          <div className="flex flex-wrap gap-xs mt-xs">
            {restaurant.avgPricePerPerson > 0 && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">💰 ₹{restaurant.avgPricePerPerson}/person</span>}
            {restaurant.seatingCapacity > 0 && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">🪑 {restaurant.seatingCapacity} seats</span>}
            {restaurant.staff?.serviceType && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary capitalize">🍽️ {restaurant.staff.serviceType}</span>}
            {restaurant.environment?.uniqueFeatures && <span className="px-2 py-0.5 bg-glass-surface border border-glass-border rounded-full text-[0.7rem] text-secondary">✨ {restaurant.environment.uniqueFeatures}</span>}
          </div>
        )}

        <div className="flex gap-md mt-auto pt-sm items-center flex-wrap">
          <div className="flex items-center gap-1 text-tertiary text-[0.85rem]">
            <MapPin size={14} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1 text-tertiary text-[0.85rem]">
            <Clock size={14} />
            <span>{restaurant.travelTime}</span>
          </div>
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
