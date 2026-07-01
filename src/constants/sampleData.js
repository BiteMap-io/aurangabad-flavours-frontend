// Sample hotel data — shown on homepage when no data is returned from the API
export const SAMPLE_HOTELS = [
  {
    id: 'sample-1',
    name: 'Naivedyam Restaurant',
    cuisine: 'Maharashtrian · North Indian',
    priceRange: '₹₹',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    description:
      'A celebrated heritage dining spot in Aurangabad known for its authentic Marathwada thali, warm hospitality, and traditional recipes passed down through generations.',
    distance: '1.2 km',
    travelTime: '5 min',
    ihmRecommended: true,
    verified: true,
    foodType: 'veg',
    avgPricePerPerson: 350,
    seatingCapacity: 80,
    extraFacilities: {
      ac: true,
      parking: true,
      washroom: true,
      parcel: true,
      disabilityAccess: false,
    },
    food: { quality: 5, signatureDishes: 'Marathwada Thali, Puran Poli', valueForMoney: 4 },
    environment: { ambience: 4, uniqueFeatures: 'Heritage décor' },
    staff: { friendliness: 5, serviceType: 'table service' },
    location: { type: 'Point', coordinates: [75.3433, 19.8762] },
  },
  {
    id: 'sample-2',
    name: 'Tandoor Restaurant',
    cuisine: 'Mughlai · Tandoor · Biryani',
    priceRange: '₹₹₹',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
    description:
      'One of Aurangabad\'s most iconic restaurants, famous for its slow-cooked dum biryani, sizzling tandoori platters, and rich Mughlai gravies in a regal setting.',
    distance: '2.5 km',
    travelTime: '10 min',
    ihmRecommended: true,
    verified: true,
    foodType: 'both',
    avgPricePerPerson: 600,
    seatingCapacity: 120,
    extraFacilities: {
      ac: true,
      parking: true,
      washroom: true,
      parcel: true,
      disabilityAccess: true,
    },
    food: { quality: 5, signatureDishes: 'Dum Biryani, Tandoori Platter', valueForMoney: 4 },
    environment: { ambience: 5, uniqueFeatures: 'Regal Mughal ambience' },
    staff: { friendliness: 4, serviceType: 'table service' },
    location: { type: 'Point', coordinates: [75.3219, 19.8956] },
  },
]

// Fallback hero image for homepage when no gallery image is available from the API
export const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop'
