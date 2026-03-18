import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import FilterBar from '../components/FilterBar'
import { hotelsApi } from '../services/adminApi'
import { getDishRestaurants, getDishById } from '../data/dishes'
import { useTouristMode } from '../context/TouristModeContext'
import { filterForTouristMode } from '../utils/diningUtils'
import './Explore.css'

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
  
  const dishParam = searchParams.get('dish')
  const selectedDish = dishParam ? getDishById(dishParam) : null
  
  const [filters, setFilters] = useState({
    establishmentType: '',
    cuisine: '',
    priceRange: '',
    rating: '',
    facilities: [],
    area: '',
    dish: dishParam || '',
    nearMe: searchParams.get('nearMe') === 'true',
  })

  // Update filters when URL params change
  useEffect(() => {
    const dishFromUrl = searchParams.get('dish')
    if (dishFromUrl && dishFromUrl !== filters.dish) {
      setFilters(prev => ({ ...prev, dish: dishFromUrl }))
    }
  }, [searchParams])

  const clearDishFilter = () => {
    setFilters(prev => ({ ...prev, dish: '' }))
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('dish')
    setSearchParams(newParams)
  }

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants]

    // Apply dish filter first if present
    if (filters.dish) {
      filtered = getDishRestaurants(filters.dish, filtered)
    }

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
  }, [filters, isTouristMode])

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
    <div className="explore-page">
      <div className="explore-header">
        {/* Background Video */}
        <video
          className="explore-header-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=600&fit=crop&q=80"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-restaurant-interior-with-people-dining-9483/1080p.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Dark Overlay */}
        <div className="explore-header-overlay" />
        
        {/* Content */}
        <div className="explore-header-content">
          <h1>Explore Restaurants</h1>
          <p>Discover the best dining experiences in Aurangabad</p>
        </div>
      </div>

      {selectedDish && (
        <motion.div 
          className="dish-filter-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="dish-filter-content">
            <span className="dish-filter-label">Showing restaurants serving:</span>
            <div className="dish-filter-pill">
              <span className="dish-filter-name">{selectedDish.name}</span>
              <button 
                className="dish-filter-clear"
                onClick={clearDishFilter}
                aria-label="Clear dish filter"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        restaurants={restaurants}
      />

      <div className="explore-content">
        <div className="results-header">
          <span className="results-count">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <motion.div
          className="restaurants-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="loading-spinner">Searching for flavours...</div>
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
              <div className="no-results">
                <p>No restaurants found matching your criteria.</p>
                <button
                  className="clear-filters-btn"
                  onClick={() => setFilters({
                    establishmentType: '',
                    cuisine: '',
                    priceRange: '',
                    rating: '',
                    facilities: [],
                    area: '',
                    dish: '',
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


