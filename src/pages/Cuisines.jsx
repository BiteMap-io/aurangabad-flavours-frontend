import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import { hotelsApi } from '../services/adminApi'
import './Cuisines.css'

const Cuisines = () => {
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await hotelsApi.getAll()
        const data = response.data || response
        setRestaurants(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch restaurants for cuisines:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const cuisines = useMemo(() => {
    const cuisineSet = new Set()
    restaurants.forEach(r => {
      if (r.cuisine) {
        // Handle comma-separated cuisines
        r.cuisine.split(',').forEach(c => cuisineSet.add(c.trim()))
      }
    })
    return Array.from(cuisineSet).sort()
  }, [restaurants])

  const filteredRestaurants = useMemo(() => {
    if (!selectedCuisine) return restaurants
    return restaurants.filter((r) => 
      r.cuisine && r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())
    )
  }, [selectedCuisine, restaurants])

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  return (
    <div className="cuisines-page">
      <div className="cuisines-header">
        <h1>Explore by Cuisine</h1>
        <p>Discover restaurants by their culinary style</p>
      </div>

      <div className="cuisines-filter">
        <button
          className={`cuisine-btn ${selectedCuisine === '' ? 'active' : ''}`}
          onClick={() => setSelectedCuisine('')}
        >
          All Cuisines
        </button>
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            className={`cuisine-btn ${selectedCuisine === cuisine ? 'active' : ''}`}
            onClick={() => setSelectedCuisine(cuisine)}
          >
            {cuisine}
          </button>
        ))}
      </div>

      <div className="cuisines-content">
        {loading ? (
          <div className="cuisines-loading">
            <Loader className="spinner" />
            <span>Finding the best flavours...</span>
          </div>
        ) : (
          <>
            {selectedCuisine && (
              <h2 className="section-title">
                {filteredRestaurants.length} {selectedCuisine} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
              </h2>
            )}

            <div className="restaurants-grid">
              {filteredRestaurants.length > 0 ? (
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
                  <p>No restaurants found for this cuisine.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Cuisines


