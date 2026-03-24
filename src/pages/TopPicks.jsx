import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Star, TrendingUp } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import { hotelsApi } from '../services/adminApi'
import './TopPicks.css'

const TopPicks = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hotelsApi.getAll()
        const data = response.data || response
        setRestaurants(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch restaurants for Top Picks:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const topRated = [...restaurants]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10)

  const ihmRecommended = restaurants.filter((r) => r.featured || r.ihmRecommended)

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  return (
    <div className="top-picks-page">
      <div className="top-picks-header">
        <h1>Top Picks</h1>
        <p>Curated selection of the best restaurants in Aurangabad</p>
      </div>

      <section className="top-picks-section">
        <div className="section-header">
          <Award size={28} />
          <h2>IHM Recommended</h2>
        </div>
        <div className="restaurants-grid">
          {loading ? (
            <div className="loading-spinner">Loading recommendations...</div>
          ) : (
            ihmRecommended.length > 0 ? (
              ihmRecommended.map((restaurant, index) => (
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
              <div className="no-data">No recommended restaurants yet.</div>
            )
          )}
        </div>
      </section>

      <section className="top-picks-section">
        <div className="section-header">
          <Star size={28} fill="#FFD700" color="#FFD700" />
          <h2>Highest Rated</h2>
        </div>
        <div className="restaurants-grid">
          {loading ? (
            <div className="loading-spinner">Loading top rated...</div>
          ) : (
            topRated.length > 0 ? (
              topRated.map((restaurant, index) => (
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
              <div className="no-data">No rated restaurants yet.</div>
            )
          )}
        </div>
      </section>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default TopPicks


