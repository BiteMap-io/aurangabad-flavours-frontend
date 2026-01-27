export const foodTrails = [
  {
    id: 'royal-mughal',
    name: 'Royal Mughal Trail',
    description: 'Experience the rich flavors of Mughal cuisine in Aurangabad',
    icon: '👑',
    color: '#8B4513',
    estimatedTime: '3-4 hours',
    distance: '8 km',
    restaurantIds: [1, 3, 5, 7], // Will match with actual restaurant IDs
    highlights: [
      'Authentic Mughlai dishes',
      'Historic ambiance',
      'Royal dining experience'
    ]
  },
  {
    id: 'street-food',
    name: 'Street Food Trail',
    description: 'Discover the vibrant street food culture of Aurangabad',
    icon: '🍢',
    color: '#f59e0b',
    estimatedTime: '2-3 hours',
    distance: '5 km',
    restaurantIds: [2, 4, 6, 8],
    highlights: [
      'Local favorites',
      'Budget-friendly',
      'Authentic flavors'
    ]
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian Trail',
    description: 'Pure vegetarian delights across the city',
    icon: '🥗',
    color: '#10b981',
    estimatedTime: '3 hours',
    distance: '6 km',
    restaurantIds: [1, 2, 5, 9],
    highlights: [
      'Pure veg options',
      'Traditional recipes',
      'Healthy choices'
    ]
  },
  {
    id: 'heritage',
    name: 'Heritage Dining Trail',
    description: 'Dine at restaurants with historical significance',
    icon: '🏛️',
    color: '#8b5cf6',
    estimatedTime: '4-5 hours',
    distance: '10 km',
    restaurantIds: [1, 3, 7, 10],
    highlights: [
      'Historic locations',
      'Traditional ambiance',
      'Cultural experience'
    ]
  }
]

export const getTrailById = (id) => {
  return foodTrails.find(trail => trail.id === id)
}

export const getTrailRestaurants = (trail, allRestaurants) => {
  return allRestaurants.filter(r => trail.restaurantIds.includes(r.id))
}
