import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { X, SearchX, Search } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import FilterBar from '../components/FilterBar'
import { SkeletonList } from '../components/SkeletonCard'
import { hotelsApi, galleryApi, dishesApi } from '../services/adminApi'
import { useTouristMode } from '../context/TouristModeContext'
import { filterForTouristMode, normalizeForSearch } from '../utils/diningUtils'
import useSEO from '../hooks/useSEO'

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  useSEO({
    title: 'Explore Restaurants',
    description: 'Browse and filter all restaurants in Aurangabad by cuisine, price, rating and more. Find your perfect dining experience.',
    url: '/explore',
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [dishNamesByRestaurant, setDishNamesByRestaurant] = useState({})
  const [heroImage, setHeroImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const { isTouristMode } = useTouristMode()

  // Sync search query from URL on mount and when URL changes
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || ''
    setSearchQuery(qFromUrl)
  }, [searchParams.get('q')])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, galleryRes, dishesRes] = await Promise.all([
          hotelsApi.getAll(),
          galleryApi.getAll('explore'),
          dishesApi.getAll().catch(() => null)
        ])

        const hotelsData = hotelsRes.data || hotelsRes
        setRestaurants(Array.isArray(hotelsData) ? hotelsData : [])

        const galleryData = galleryRes.data || galleryRes
        if (Array.isArray(galleryData) && galleryData.length > 0) {
          setHeroImage(galleryData[0].url)
        }

        const dishesData = dishesRes?.data || dishesRes
        if (Array.isArray(dishesData)) {
          const grouped = {}
          dishesData.forEach((dish) => {
            const rid = dish.restaurantId
            if (!rid) return
            if (!grouped[rid]) grouped[rid] = []
            if (dish.name) grouped[rid].push(dish.name)
          })
          setDishNamesByRestaurant(grouped)
        }
      } catch (error) {
        console.error('Failed to fetch explore data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  
  const [filters, setFilters] = useState({
    establishmentType: '',
    cuisine: '',
    priceRange: '',
    rating: '',
    facilities: [],
    area: '',
    nearMe: searchParams.get('nearMe') === 'true',
  })

  // Update filters when URL params change
  useEffect(() => {
    const nearMeFromUrl = searchParams.get('nearMe') === 'true'
    if (nearMeFromUrl !== filters.nearMe) {
      setFilters(prev => ({ ...prev, nearMe: nearMeFromUrl }))
    }
  }, [searchParams])

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants]

    // Apply tourist mode filter
    if (isTouristMode) {
      filtered = filterForTouristMode(filtered)
    }

    // Search across multiple fields — case-insensitive and whitespace-forgiving,
    // so "7Apple", "7 apple", "7 APPLE" and "apple" all match "7 Apple".
    if (searchQuery.trim()) {
      const q = normalizeForSearch(searchQuery)
      filtered = filtered.filter((r) => {
        const rid = r._id || r.id
        const dishNames = dishNamesByRestaurant[rid] || []
        return (
          normalizeForSearch(r.name).includes(q) ||
          normalizeForSearch(r.cuisine).includes(q) ||
          normalizeForSearch(r.establishmentType).includes(q) ||
          normalizeForSearch(r.area).includes(q) ||
          normalizeForSearch(r.description).includes(q) ||
          normalizeForSearch(r.foodType).includes(q) ||
          normalizeForSearch(r.food?.signatureDishes).includes(q) ||
          normalizeForSearch(r.food?.specialtyDishes).includes(q) ||
          normalizeForSearch(r.environment?.uniqueFeatures).includes(q) ||
          normalizeForSearch(r.priceRange).includes(q) ||
          dishNames.some((name) => normalizeForSearch(name).includes(q))
        )
      })
    }

    if (filters.establishmentType) {
      const want = filters.establishmentType.trim().toLowerCase()
      filtered = filtered.filter((r) => r.establishmentType?.trim().toLowerCase() === want)
    }

    if (filters.cuisine) {
      // r.cuisine can be a comma-separated list (e.g. "Multi-cuisine, Continental"),
      // so match against each trimmed token rather than the whole string.
      const want = filters.cuisine.trim().toLowerCase()
      filtered = filtered.filter((r) =>
        (r.cuisine || '').split(',').some((c) => c.trim().toLowerCase() === want)
      )
    }

    if (filters.priceRange) {
      filtered = filtered.filter((r) => r.priceRange === filters.priceRange)
    }

    if (filters.rating) {
      const ratingMap = {
        'Good': 3.5,
        'Very Good': 4.0,
        'Exceptional': 4.5,
        'World Class': 4.8,
        'Local Gems': 4.0,
      }
      const minRating = ratingMap[filters.rating] || 0
      filtered = filtered.filter((r) => r.rating >= minRating)
    }

    if (filters.facilities.length > 0) {
      filtered = filtered.filter((r) =>
        filters.facilities.every((facility) => r.facilities?.includes(facility))
      )
    }

    if (filters.area) {
      const want = filters.area.trim().toLowerCase()
      filtered = filtered.filter((r) => r.area?.trim().toLowerCase() === want)
    }

    if (filters.nearMe) {
      // Sort by distance (closest first)
      filtered.sort((a, b) => {
        const distA = parseFloat(a.distance)
        const distB = parseFloat(b.distance)
        return distA - distB
      })
    }

    return filtered
  }, [filters, isTouristMode, restaurants, searchQuery, dishNamesByRestaurant])

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleGetDirections = (restaurant) => {
    // Open modal — the modal will auto-trigger directions via its own hook
    setSelectedRestaurant({ ...restaurant, _autoDirections: true })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="min-h-screen py-xl px-sm md:px-lg max-w-[1400px] mx-auto">
      <div className="relative text-center mb-xl py-xl px-lg min-h-[200px] flex items-center justify-center overflow-hidden rounded-[2rem] bg-background-secondary border border-glass-border">
        {/* Background Image */}
        {heroImage && (
          <img
            src={heroImage}
            alt="Explore background"
            className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-[0.5] saturate-[0.8] light:brightness-[0.6]"
          />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10 light:bg-black/40" />
        
        {/* Content */}
        <div className="relative z-20 text-center">
          <h1 className="text-[3rem] mb-sm text-white drop-shadow-lg">
            Explore Restaurants
          </h1>
          <p className="text-[1.1rem] text-white/95 drop-shadow-md opacity-95">
            Discover the best dining experiences in Aurangabad
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-md">
        <div className="flex items-center gap-sm bg-glass-surface border border-glass-border rounded-[1rem] px-md py-sm shadow-glass transition-all duration-300 focus-within:border-accent-purple/50 focus-within:shadow-glow">
          <Search size={20} className="text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Search by name, cuisine, type, area, dishes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              // Update URL param so it's shareable
              if (e.target.value) {
                setSearchParams(prev => { prev.set('q', e.target.value); return prev })
              } else {
                setSearchParams(prev => { prev.delete('q'); return prev })
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-primary text-[0.95rem] placeholder:text-tertiary"
            aria-label="Search restaurants"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchParams(prev => { prev.delete('q'); return prev })
              }}
              className="text-tertiary hover:text-primary transition-colors duration-200 shrink-0"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-tertiary text-[0.8rem] mt-xs ml-xs">
            Searching for "<span className="text-accent-purple font-medium">{searchQuery}</span>"
          </p>
        )}
      </div>

      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        restaurants={restaurants}
      />

      <div className="mt-xl">
        <div className="mb-lg pb-md border-b border-glass-border flex items-center justify-between flex-wrap gap-xs">
          <span className="text-secondary text-[0.95rem]">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
            {searchQuery && <span className="text-accent-purple font-medium"> for "{searchQuery}"</span>}
          </span>
          {(searchQuery || Object.values(filters).some(v => v && v !== false && (Array.isArray(v) ? v.length > 0 : true))) && (
            <button
              onClick={() => { setSearchQuery(''); setFilters({ establishmentType: '', cuisine: '', priceRange: '', rating: '', facilities: [], area: '', nearMe: false }) }}
              className="flex items-center gap-1 text-[0.8rem] text-tertiary hover:text-accent-purple transition-colors duration-200"
            >
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <SkeletonList count={4} />
          ) : (
            filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id || restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant)}
                    onGetDirections={handleGetDirections}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center text-center p-xl bg-glass-surface border border-glass-border rounded-[1.5rem] gap-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center">
                  <SearchX size={32} className="text-accent-purple" />
                </div>
                <div>
                  <p className="text-primary text-[1.2rem] font-semibold mb-xs">No restaurants found</p>
                  <p className="text-secondary text-[0.95rem]">Try adjusting your filters or searching in a different area.</p>
                </div>
                <button
                  className="py-sm px-lg bg-accent-purple/10 border border-accent-purple/50 text-accent-purple rounded-pill text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:bg-accent-purple/20 hover:border-accent-purple hover:shadow-glow hover:-translate-y-[2px]"
                  onClick={() => setFilters({
                    establishmentType: '',
                    cuisine: '',
                    priceRange: '',
                    rating: '',
                    facilities: [],
                    area: '',
                    nearMe: false,
                  })}
                >
                  Clear all filters
                </button>
              </motion.div>
            )
          )}
        </motion.div>
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Explore
