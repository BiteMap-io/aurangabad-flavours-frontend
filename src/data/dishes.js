export const popularDishes = [
  {
    id: 'biryani',
    name: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
    category: 'Main Course'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
    category: 'Fast Food'
  },
  {
    id: 'burger',
    name: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    category: 'Fast Food'
  },
  {
    id: 'cake',
    name: 'Cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    category: 'Dessert'
  },
  {
    id: 'shawarma',
    name: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop',
    category: 'Street Food'
  },
  {
    id: 'noodles',
    name: 'Noodles',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop',
    category: 'Chinese'
  },
  {
    id: 'pav-bhaji',
    name: 'Pav Bhaji',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop',
    category: 'Street Food'
  },
  {
    id: 'kebab',
    name: 'Kebab',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop',
    category: 'Mughlai'
  },
  {
    id: 'paratha',
    name: 'Paratha',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&h=400&fit=crop',
    category: 'North Indian'
  },
  {
    id: 'dosa',
    name: 'Dosa',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=400&fit=crop',
    category: 'South Indian'
  },
  {
    id: 'pasta',
    name: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
    category: 'Continental'
  },
  {
    id: 'idli',
    name: 'Idli',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=400&fit=crop',
    category: 'South Indian'
  },
  {
    id: 'jalebi',
    name: 'Jalebi',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop',
    category: 'Dessert'
  },
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=400&fit=crop',
    category: 'North Indian'
  }
]

// Map dishes to restaurants (based on cuisine/menu matching)
export const getDishRestaurants = (dishId, allRestaurants) => {
  const dishToCuisineMap = {
    'biryani': ['North Indian', 'Mughlai', 'Hyderabadi'],
    'pizza': ['Continental', 'Italian', 'Fast Food'],
    'burger': ['Fast Food', 'Continental', 'American'],
    'cake': ['Bakery', 'Cafe', 'Continental'],
    'shawarma': ['Street Food', 'Middle Eastern', 'Fast Food'],
    'noodles': ['Chinese', 'Asian', 'Fast Food'],
    'pav-bhaji': ['Street Food', 'North Indian', 'Fast Food'],
    'kebab': ['Mughlai', 'North Indian', 'Street Food'],
    'paratha': ['North Indian', 'Punjabi', 'Street Food'],
    'dosa': ['South Indian', 'Cafe'],
    'pasta': ['Continental', 'Italian', 'Cafe'],
    'idli': ['South Indian', 'Cafe'],
    'jalebi': ['Street Food', 'North Indian', 'Dessert'],
    'paneer-tikka': ['North Indian', 'Punjabi', 'Mughlai']
  }

  const relevantCuisines = dishToCuisineMap[dishId] || []
  
  return allRestaurants.filter(restaurant => {
    // Check if restaurant cuisine matches dish cuisines
    const cuisineMatch = relevantCuisines.some(cuisine => 
      restaurant.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
    )
    
    // Check if restaurant menu includes the dish
    const menuMatch = restaurant.menu?.some(item =>
      item.name?.toLowerCase().includes(dishId.replace('-', ' '))
    )
    
    return cuisineMatch || menuMatch
  })
}

export const getDishById = (dishId) => {
  return popularDishes.find(dish => dish.id === dishId)
}
