import { motion } from 'framer-motion'
import { MapPin, Clock, Star, Navigation, Heart } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import MealTimeBadge from './MealTimeBadge'
import CrowdIndicator from './CrowdIndicator'
import { getCurrentMealTime, isSuitableForMealTime, getCrowdLevel } from '../utils/diningUtils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RestaurantCard = ({ restaurant, onClick }) => {
  const { isTouristMode } = useTouristMode()
  const [dirError, setDirError] = useState('')
  const [liked, setLiked] = useState(false)
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
    navigate(`/place/${id}`)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setLiked(l => !l)
  }

  const ratingColor =
    restaurant.rating >= 4.5
      ? 'bg-green-500'
      : restaurant.rating >= 4.0
      ? 'bg-orange-500'
      : 'bg-red-500'

  return (
    <motion.div
      className="group relative bg-glass-surface border border-glass-border rounded-[1.25rem] overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent-purple/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {restaurant.ihmRecommended && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-purple text-white text-[0.68rem] font-bold rounded-full shadow-lg">
              ⭐ IHM Pick
            </span>
          )}
          {restaurant.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[0.68rem] font-bold rounded-full shadow-lg">
              ✓ Verified
            </span>
          )}
          {isTouristMode && restaurant.rating >= 4.3 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-[0.68rem] font-bold rounded-full shadow-lg">
              🗺 Tourist Friendly
            </span>
          )}
        </div>

        {/* Favourite button top-right */}
        <motion.button
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-black/60"
          onClick={handleLike}
          aria-label="Save restaurant"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Heart size={15} fill={liked ? '#ec4899' : 'none'} color={liked ? '#ec4899' : 'white'} />
        </motion.button>

        {/* Rating bottom-right of image */}
        {restaurant.rating && (
          <div className={`absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 ${ratingColor} text-white text-[0.82rem] font-bold rounded-full shadow-md`}>
            <Star size={12} fill="white" color="white" />
            {restaurant.rating}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-md flex flex-col gap-xs">
        <h3 className="font-serif text-[1.1rem] font-bold text-primary leading-[1.25] line-clamp-1 m-0">
          {restaurant.name}
        </h3>

        <p className="text-secondary text-[0.82rem] m-0 line-clamp-1">
          {[restaurant.cuisine, restaurant.area, restaurant.priceRange].filter(Boolean).join(' · ')}
        </p>

        <div className="flex flex-wrap gap-[0.3rem] mt-[0.1rem]">
          {showMealTimeBadge && <MealTimeBadge mealTime={currentMealTime} />}
          <CrowdIndicator level={crowdLevel} />
          {restaurant.foodType === 'veg' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold bg-green-500/15 text-green-400 border border-green-500/25 leading-none">
              🟢 Pure Veg
            </span>
          )}
          {restaurant.foodType === 'non-veg' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold bg-red-500/15 text-red-400 border border-red-500/25 leading-none">
              🔴 Non-Veg
            </span>
          )}
          {restaurant.foodType === 'both' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 leading-none">
              🟡 Veg & Non-Veg
            </span>
          )}
        </div>

        {(restaurant.food?.signatureDishes || restaurant.food?.specialtyDishes) && (
          <p className="text-[0.75rem] text-tertiary line-clamp-1 m-0">
            🍴 {[restaurant.food.signatureDishes, restaurant.food.specialtyDishes].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="flex items-center gap-sm pt-xs mt-auto border-t border-glass-border/60">
          <div className="flex items-center gap-1 text-tertiary text-[0.78rem]">
            <MapPin size={12} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1 text-tertiary text-[0.78rem]">
            <Clock size={12} />
            <span>{restaurant.travelTime}</span>
          </div>
          <button
            className="ml-auto flex items-center gap-1 py-1 px-sm bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/30 hover:border-accent-purple rounded-md text-accent-purple text-[0.75rem] font-semibold cursor-pointer transition-all duration-200"
            onClick={handleGetDirections}
            aria-label={`Get directions to ${restaurant.name}`}
          >
            <Navigation size={12} /> Directions
          </button>
        </div>

        {dirError && <span className="text-[0.72rem] text-red-400">{dirError}</span>}
      </div>
    </motion.div>
  )
}

export default RestaurantCard
