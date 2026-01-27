// Time-based dining suggestions
export const getCurrentMealTime = () => {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 16) return 'lunch'
  if (hour >= 16 && hour < 22) return 'dinner'
  return 'late-night'
}

export const getMealTimeLabel = (mealTime) => {
  const labels = {
    breakfast: 'Good for Breakfast Now',
    lunch: 'Good for Lunch Now',
    dinner: 'Good for Dinner Now',
    'late-night': 'Open Late Night'
  }
  return labels[mealTime] || ''
}

export const getMealTimeEmoji = (mealTime) => {
  const emojis = {
    breakfast: '☕',
    lunch: '🍽️',
    dinner: '🌙',
    'late-night': '🌃'
  }
  return emojis[mealTime] || ''
}

// Crowd level indicator
export const getCrowdLevel = (restaurant) => {
  const hour = new Date().getHours()
  const rating = restaurant.rating || 0
  const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)
  
  // High-rated restaurants during peak hours
  if (rating >= 4.5 && isPeakHour) return 'busy'
  
  // Popular restaurants during peak hours
  if (rating >= 4.0 && isPeakHour) return 'moderate'
  
  // Off-peak or lower-rated
  if (!isPeakHour || rating < 4.0) return 'calm'
  
  return 'moderate'
}

export const getCrowdLevelColor = (level) => {
  const colors = {
    calm: '#10b981',
    moderate: '#f59e0b',
    busy: '#ef4444'
  }
  return colors[level] || colors.moderate
}

export const getCrowdLevelLabel = (level) => {
  const labels = {
    calm: 'Calm',
    moderate: 'Moderate',
    busy: 'Busy'
  }
  return labels[level] || 'Moderate'
}

// Tourist mode filtering
export const filterForTouristMode = (restaurants) => {
  return restaurants
    .filter(r => r.rating >= 4.0) // High-rated only
    .filter(r => r.ihmRecommended || r.rating >= 4.3) // IHM recommended or very high rated
    .sort((a, b) => b.rating - a.rating) // Sort by rating
}

// Check if restaurant is suitable for current meal time
export const isSuitableForMealTime = (restaurant, mealTime) => {
  const suitability = {
    breakfast: ['Cafe', 'Bakery', 'Continental', 'South Indian'],
    lunch: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Mughlai'],
    dinner: ['North Indian', 'Mughlai', 'Chinese', 'Continental', 'Street Food'],
    'late-night': ['Street Food', 'Fast Food', 'Chinese']
  }
  
  const cuisineTypes = suitability[mealTime] || []
  return cuisineTypes.some(type => 
    restaurant.cuisine?.toLowerCase().includes(type.toLowerCase())
  )
}
