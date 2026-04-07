import { motion } from 'framer-motion'
import { MapPin, Clock, Star } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import MealTimeBadge from './MealTimeBadge'
import CrowdIndicator from './CrowdIndicator'
import { getCurrentMealTime, isSuitableForMealTime, getCrowdLevel } from '../utils/diningUtils'

const RestaurantCard = ({ restaurant, onClick }) => {
  const { isTouristMode } = useTouristMode()
  
  const currentMealTime = getCurrentMealTime()
  const showMealTimeBadge = isSuitableForMealTime(restaurant, currentMealTime)
  const crowdLevel = getCrowdLevel(restaurant)

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-md p-md bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-[1.5rem] cursor-pointer transition-all duration-300 relative hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full md:w-[200px] h-[200px] md:h-[150px] rounded-md overflow-hidden shrink-0">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.ihmRecommended && (
          <div className="absolute top-xs left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-[#8A2BE2]/70">IHM Recommended</div>
        )}
        {restaurant.verified && (
          <div className="absolute top-[2.5rem] left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-[#22c55e]/70">Verified</div>
        )}
        {isTouristMode && restaurant.rating >= 4.3 && (
          <div className="absolute top-[4.5rem] left-xs px-2 py-1 rounded-[0.5rem] text-xs font-semibold backdrop-blur-[10px] text-white bg-[#3b82f6]/70">Tourist Friendly</div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-xs">
        <div className="flex justify-between items-start gap-sm">
          <h3 className="text-xl font-semibold text-primary m-0">{restaurant.name}</h3>
          <div className="flex items-center gap-1 px-2 py-1 bg-glass-surface border border-glass-border rounded-[0.5rem] text-sm font-semibold whitespace-nowrap">
            <Star size={14} fill="#FFD700" color="#FFD700" />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        <p className="text-secondary text-[0.9rem] m-0">{restaurant.cuisine}</p>
        <p className="text-primary text-[0.9rem] font-medium m-0">{restaurant.priceRange}</p>
        
        <div className="flex flex-wrap gap-xs my-sm">
          {showMealTimeBadge && <MealTimeBadge mealTime={currentMealTime} />}
          <CrowdIndicator level={crowdLevel} />
        </div>
        
        {restaurant.description && (
          <p className="text-secondary text-[0.85rem] leading-[1.4] my-xs line-clamp-2">
            {restaurant.description.length > 100 
              ? `${restaurant.description.substring(0, 100)}...` 
              : restaurant.description}
          </p>
        )}

        <div className="flex gap-md mt-auto pt-sm">
          <div className="flex items-center gap-1 text-secondary text-[0.85rem]">
            <MapPin size={14} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1 text-secondary text-[0.85rem]">
            <Clock size={14} />
            <span>{restaurant.travelTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantCard
