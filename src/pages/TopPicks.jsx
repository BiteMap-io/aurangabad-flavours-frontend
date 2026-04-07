import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Star } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import { hotelsApi } from '../services/adminApi'

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
    <div className="min-h-screen py-xl px-lg max-w-[1400px] mx-auto">
      <div className="text-center mb-xl">
        <h1 className="text-[3rem] mb-sm text-primary font-bold">Top Picks</h1>
        <p className="text-[1.1rem] text-secondary">Curated selection of the best restaurants in Aurangabad</p>
      </div>

      <section className="mb-xl">
        <div className="flex items-center gap-md mb-lg pb-md border-b border-glass-border">
          <Award size={28} className="text-primary" />
          <h2 className="text-[2rem] text-primary m-0 font-semibold">IHM Recommended</h2>
        </div>
        <div className="flex flex-col gap-md">
          {loading ? (
            <div className="text-secondary py-xl text-center">Loading recommendations...</div>
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
              <div className="text-secondary py-xl text-center">No recommended restaurants yet.</div>
            )
          )}
        </div>
      </section>

      <section className="mb-xl">
        <div className="flex items-center gap-md mb-lg pb-md border-b border-glass-border">
          <Star size={28} fill="#FFD700" color="#FFD700" />
          <h2 className="text-[2rem] text-primary m-0 font-semibold">Highest Rated</h2>
        </div>
        <div className="flex flex-col gap-md">
          {loading ? (
            <div className="text-secondary py-xl text-center">Loading top rated...</div>
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
              <div className="text-secondary py-xl text-center">No rated restaurants yet.</div>
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
