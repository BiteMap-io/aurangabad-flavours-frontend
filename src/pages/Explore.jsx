import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import FilterBar from '../components/FilterBar'
import { hotelsApi } from '../services/adminApi'
import { useTouristMode } from '../context/TouristModeContext'
import { filterForTouristMode } from '../utils/diningUtils'

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const { isTouristMode } = useTouristMode()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hotelsApi.getAll()
        const data = response.data || response
        setRestaurants(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch restaurants:', error)
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

    if (filters.establishmentType) {
      filtered = filtered.filter((r) => r.establishmentType === filters.establishmentType)
    }

    if (filters.cuisine) {
      filtered = filtered.filter((r) => r.cuisine === filters.cuisine)
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
      filtered = filtered.filter((r) => r.area === filters.area)
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
  }, [filters, isTouristMode, restaurants])

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
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
    <div className="min-h-screen py-xl px-lg max-w-[1400px] mx-auto">
      <div className="relative text-center mb-xl py-xl px-lg min-h-[200px] flex items-center justify-center overflow-hidden rounded-[2rem] bg-background-secondary">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=600&fit=crop&q=80"
          alt="Restaurant interior"
          className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-[0.45] saturate-[0.75] md:brightness-[0.5] md:saturate-[0.8] data-[theme=light]:brightness-[0.45] data-[theme=light]:saturate-[0.75] md:data-[theme=light]:brightness-[0.5] md:data-[theme=light]:saturate-[0.8]"
        />
        
        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/65 md:bg-black/60 z-10 data-[theme=light]:bg-black/65 md:data-[theme=light]:bg-black/60" />
        
        {/* Content */}
        <div className="relative z-20 text-center">
          <h1 className="text-[3rem] mb-sm text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] data-[theme=light]:text-[#F8FAFC]">
            Explore Restaurants
          </h1>
          <p className="text-[1.1rem] text-primary drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] md:drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] opacity-95 data-[theme=light]:text-[#F8FAFC]">
            Discover the best dining experiences in Aurangabad
          </p>
        </div>
      </div>

      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        restaurants={restaurants}
      />

      <div className="mt-xl">
        <div className="mb-lg pb-md border-b border-glass-border">
          <span className="text-secondary text-[0.95rem]">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <motion.div
          className="flex flex-col gap-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="text-center text-secondary py-xl">Searching for flavours...</div>
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
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center p-xl bg-glass-surface border border-glass-border rounded-[1.5rem]">
                <p className="text-secondary text-[1.1rem] mb-md">No restaurants found matching your criteria.</p>
                <button
                  className="py-sm px-lg bg-glass-surface border border-glass-border rounded-[0.5rem] text-primary text-[1rem] font-medium cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-[#8A2BE2] hover:shadow-[0_0_15px_#8A2BE2]"
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
                  Clear Filters
                </button>
              </div>
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
