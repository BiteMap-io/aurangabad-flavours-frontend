import { Clock } from 'lucide-react'
import { getMealTimeLabel, getMealTimeEmoji } from '../utils/diningUtils'
import './MealTimeBadge.css'

const MealTimeBadge = ({ mealTime }) => {
  if (!mealTime) return null

  return (
    <div className="meal-time-badge">
      <span className="meal-time-emoji">{getMealTimeEmoji(mealTime)}</span>
      <Clock size={12} />
      <span className="meal-time-text">{getMealTimeLabel(mealTime)}</span>
    </div>
  )
}

export default MealTimeBadge
