import { Clock } from 'lucide-react'
import { getMealTimeLabel, getMealTimeEmoji } from '../utils/diningUtils'

const MealTimeBadge = ({ mealTime }) => {
  if (!mealTime) return null

  return (
    <div className="inline-flex items-center gap-[0.375rem] px-[0.5rem] py-[0.3rem] md:px-[0.625rem] md:py-[0.375rem] bg-[#8a2be2]/15 border border-[#8a2be2]/30 rounded-md text-[0.7rem] md:text-[0.75rem] font-medium text-primary backdrop-blur-[10px]">
      <span className="text-[0.85rem]">{getMealTimeEmoji(mealTime)}</span>
      <Clock size={12} />
      <span className="whitespace-nowrap">{getMealTimeLabel(mealTime)}</span>
    </div>
  )
}

export default MealTimeBadge
