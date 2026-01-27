// Sample restaurant data
export const restaurants = [
  {
    id: 1,
    name: 'The Royal Spice',
    cuisine: 'Indian',
    establishmentType: 'Restaurant',
    priceRange: '₹₹₹',
    rating: 4.8,
    distance: '1.2 km',
    travelTime: '5 min',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&q=80'
    ],
    description: 'Authentic Indian cuisine with a modern twist. Known for their aromatic biryanis and rich curries.',
    facilities: ['Parking', 'Wheelchair access', 'Family friendly', 'Outdoor dining'],
    verified: true,
    ihmRecommended: true,
    area: 'City Center',
    dishes: ['Biryani', 'Butter Chicken', 'Paneer Tikka'],
    menu: [
      { name: 'Chicken Biryani', price: 350, category: 'Main Course' },
      { name: 'Butter Chicken', price: 320, category: 'Main Course' },
      { name: 'Paneer Tikka', price: 280, category: 'Appetizer' },
    ],
    reviews: [
      { user: 'Raj K.', rating: 5, comment: 'Excellent food and service!' },
      { user: 'Priya M.', rating: 4, comment: 'Great ambiance, authentic taste.' },
    ],
  },
  {
    id: 2,
    name: 'La Bella Italia',
    cuisine: 'Italian',
    establishmentType: 'Restaurant',
    priceRange: '₹₹₹₹',
    rating: 4.6,
    distance: '2.5 km',
    travelTime: '10 min',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80'
    ],
    description: 'Fine Italian dining experience with handcrafted pasta and wood-fired pizzas.',
    facilities: ['Parking', 'Wheelchair access', 'Private dining room', 'Separate bar'],
    verified: true,
    ihmRecommended: false,
    area: 'Downtown',
    dishes: ['Margherita Pizza', 'Carbonara', 'Tiramisu'],
    menu: [
      { name: 'Margherita Pizza', price: 450, category: 'Main Course' },
      { name: 'Carbonara', price: 380, category: 'Main Course' },
      { name: 'Tiramisu', price: 220, category: 'Dessert' },
    ],
    reviews: [
      { user: 'Amit S.', rating: 5, comment: 'Best Italian food in town!' },
    ],
  },
  {
    id: 3,
    name: 'Sakura Sushi Bar',
    cuisine: 'Japanese',
    establishmentType: 'Restaurant',
    priceRange: '₹₹₹',
    rating: 4.9,
    distance: '3.1 km',
    travelTime: '12 min',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop&q=80'
    ],
    description: 'Authentic Japanese sushi and sashimi prepared by expert chefs.',
    facilities: ['Counter seating', 'No background music', 'Family friendly'],
    verified: true,
    ihmRecommended: true,
    area: 'East Side',
    dishes: ['Sushi Platter', 'Ramen', 'Tempura'],
    menu: [
      { name: 'Sushi Platter', price: 550, category: 'Main Course' },
      { name: 'Ramen', price: 320, category: 'Main Course' },
      { name: 'Tempura', price: 280, category: 'Appetizer' },
    ],
    reviews: [
      { user: 'Neha P.', rating: 5, comment: 'Fresh and delicious!' },
      { user: 'Vikram R.', rating: 5, comment: 'Authentic Japanese experience.' },
    ],
  },
  {
    id: 4,
    name: 'Café Mocha',
    cuisine: 'Café',
    establishmentType: 'Café',
    priceRange: '₹₹',
    rating: 4.4,
    distance: '0.8 km',
    travelTime: '3 min',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&q=80'
    ],
    description: 'Cozy café serving artisanal coffee, pastries, and light meals.',
    facilities: ['Outdoor dining', 'Dog friendly', 'Family friendly'],
    verified: false,
    ihmRecommended: false,
    area: 'City Center',
    dishes: ['Cappuccino', 'Croissant', 'Sandwich'],
    menu: [
      { name: 'Cappuccino', price: 120, category: 'Beverage' },
      { name: 'Croissant', price: 80, category: 'Pastry' },
      { name: 'Club Sandwich', price: 180, category: 'Main Course' },
    ],
    reviews: [
      { user: 'Anjali D.', rating: 4, comment: 'Great coffee and ambiance.' },
    ],
  },
  {
    id: 5,
    name: 'Spice Garden',
    cuisine: 'South Indian',
    establishmentType: 'Restaurant',
    priceRange: '₹₹',
    rating: 4.7,
    distance: '1.8 km',
    travelTime: '7 min',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80'
    ],
    description: 'Traditional South Indian vegetarian cuisine with authentic flavors.',
    facilities: ['Parking', 'Family friendly', 'Wheelchair access'],
    verified: true,
    ihmRecommended: false,
    area: 'South Side',
    dishes: ['Dosa', 'Idli', 'Vada'],
    menu: [
      { name: 'Masala Dosa', price: 120, category: 'Main Course' },
      { name: 'Idli Sambar', price: 80, category: 'Main Course' },
      { name: 'Vada', price: 60, category: 'Appetizer' },
    ],
    reviews: [
      { user: 'Kiran L.', rating: 5, comment: 'Authentic South Indian taste!' },
    ],
  },
]

export const cuisines = [
  'American', 'Argentinian', 'British', 'Central European', 'Chinese',
  'European', 'Filipino', 'French', 'Greek', 'Indian', 'Indian Vegetarian',
  'Italian', 'Japanese', 'Korean', 'Malaysian', 'Mediterranean', 'Mexican',
  'Middle Eastern', 'Nepalese', 'Pan-Asian', 'Peruvian', 'Polish',
  'Scandinavian', 'Scottish', 'Seafood', 'South African', 'South Indian',
  'Spanish', 'Sri Lankan', 'Taiwanese', 'Thai', 'Turkish', 'Vegan',
  'Vegetarian', 'Vietnamese', 'West African'
]

export const areas = [
  'City Center', 'Downtown', 'East Side', 'West Side', 'North Side', 'South Side'
]

export const establishmentTypes = [
  'Restaurant', 'Pub', 'Café', 'Bakery', 'Other'
]

export const priceRanges = ['₹', '₹₹', '₹₹₹', '₹₹₹₹']

export const ratingCategories = [
  'Good', 'Very Good', 'Exceptional', 'World Class', 'Local Gems'
]

export const facilities = [
  'Parking', 'Wheelchair access', 'Outdoor dining', 'Family friendly',
  'Dog friendly', 'Electric car charging', 'No background music',
  'Private dining room', 'Separate bar', 'Counter seating'
]

