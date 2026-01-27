import { motion } from 'framer-motion'
import { MapPin, Clock, Star } from 'lucide-react'
import { useTouristMode } from '../context/TouristModeContext'
import MealTimeBadge from './MealTimeBadge'
import CrowdIndicator from './CrowdIndicator'
import { getCurrentMealTime, isSuitableForMealTime, getCrowdLevel } from '../utils/diningUtils'
import './RestaurantCard.css'

const RestaurantCard = ({ restaurant, onClick }) => {
  const { isTouristMode } = useTouristMode()
  
  const currentMealTime = getCurrentMealTime()
  const showMealTimeBadge = isSuitableForMealTime(restaurant, currentMealTime)
  const crowdLevel = getCrowdLevel(restaurant)

  return (
    <motion.div
      className="restaurant-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="restaurant-card-image">
        <img src={restaurant.image} alt={restaurant.name} />
        {restaurant.ihmRecommended && (
          <div className="badge ihm-badge">IHM Recommended</div>
        )}
        {restaurant.verified && (
          <div className="badge verified-badge">Verified</div>
        )}
        {isTouristMode && restaurant.rating >= 4.3 && (
          <div className="badge tourist-badge">Tourist Friendly</div>
        )}
      </div>

      <div className="restaurant-card-content">
        <div className="restaurant-card-header">
          <h3>{restaurant.name}</h3>
          <div className="rating-badge">
            <Star size={14} fill="#FFD700" color="#FFD700" />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        <p className="restaurant-cuisine">{restaurant.cuisine}</p>
        <p className="restaurant-price">{restaurant.priceRange}</p>
        
        <div className="restaurant-badges-row">
          {showMealTimeBadge && <MealTimeBadge mealTime={currentMealTime} />}
          <CrowdIndicator level={crowdLevel} />
        </div>
        
        {restaurant.description && (
          <p className="restaurant-description">
            {restaurant.description.length > 100 
              ? `${restaurant.description.substring(0, 100)}...` 
              : restaurant.description}
          </p>
        )}

        <div className="restaurant-card-footer">
          <div className="location-info">
            <MapPin size={14} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="time-info">
            <Clock size={14} />
            <span>{restaurant.travelTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantCard

