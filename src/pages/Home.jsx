import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import MasonryGallery from '../components/MasonryGallery'
import { hotelsApi } from '../services/adminApi'

const Home = () => {
  const { t } = useTranslation()
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hotelsApi.getAll()
        if (response.success || Array.isArray(response)) {
          const data = response.data || response
          setRestaurants(data)
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const topRated = [...restaurants]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  return (
    <div className="min-h-screen pb-xl">
      <section className="relative min-h-[60vh] flex items-center justify-center py-xl px-lg mb-xl overflow-hidden bg-gradient-to-br from-[#050505] to-[#0A0A0A]">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&q=80"
          alt="Culinary spread"
          className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-[0.7] saturate-[1.1]"
        />
        
        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/65 z-10" />
        
        {/* Content */}
        <motion.div
          className="relative z-20 text-center max-w-[800px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[2.25rem] md:text-[2.5rem] xl:text-[3.5rem] font-bold mb-md text-[#F8FAFC] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-[1.2]">
            Discover Aurangabad's Culinary Treasures
          </h1>
          <p className="text-[1rem] md:text-[1.1rem] xl:text-[1.25rem] text-[#F8FAFC] mb-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] opacity-95">
            Curated by Institute of Hotel Management, MGM University
          </p>
          <Link to="/explore" className="inline-block py-sm px-lg bg-white/10 backdrop-blur-[10px] border border-white/20 rounded-pill text-[#F8FAFC] font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:border-[#8A2BE2] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] hover:-translate-y-[2px]">
            Explore Restaurants
          </Link>
        </motion.div>
      </section>

      <div className="max-w-[1400px] mx-auto px-lg">
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-lg mb-xl">
          <motion.div
            className="col-span-1 bg-[#0a0a0a]/85 backdrop-blur-[24px] border border-white/10 rounded-[2rem] p-lg transition-all duration-400 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)] hover:bg-[#0f0f0f]/90 hover:border-white/20 hover:-translate-y-[6px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_24px_rgba(138,43,226,0.1),0_0_0_1px_rgba(255,255,255,0.05)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/5 data-[theme=light]:shadow-[0_8px_32px_rgba(0,0,0,0.08)] data-[theme=light]:hover:bg-white/95 data-[theme=light]:hover:border-black/10 data-[theme=light]:hover:shadow-[0_16px_48px_rgba(0,0,0,0.12),0_0_24px_rgba(138,43,226,0.08)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-sm mb-lg pb-md border-b border-white/10 data-[theme=light]:border-black/10">
              <Star size={24} fill="#FFD700" color="#FFD700" />
              <h2 className="font-sans text-[1.1rem] md:text-[1.25rem] xl:text-[1.4rem] font-semibold text-primary m-0 tracking-[-0.01em]">Top 5 Highest Rated</h2>
            </div>
            <div className="flex flex-col gap-md">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-secondary">Loading best picks...</div>
              ) : (
                topRated.length > 0 ? (
                  topRated.map((restaurant) => (
                    <div
                      key={restaurant._id || restaurant.id}
                      className="group flex gap-md p-md rounded-[1.5rem] cursor-pointer transition-all duration-300 border border-transparent hover:bg-white/5 hover:border-white/10 hover:translate-x-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] data-[theme=light]:hover:bg-black/5 data-[theme=light]:hover:border-black/10"
                      onClick={() => handleRestaurantClick(restaurant)}
                    >
                      <img src={restaurant.image} alt={restaurant.name} className="w-[80px] h-[80px] rounded-[1.5rem] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]" />
                      <div className="flex-1 flex flex-col justify-center gap-1">
                        <h4 className="font-sans text-[1rem] font-semibold text-primary m-0 tracking-[-0.01em] leading-[1.3]">{restaurant.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} fill="#FFD700" color="#FFD700" />
                          <span className="font-sans text-[0.9rem] font-semibold text-primary tracking-[0.01em]">{restaurant.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-secondary text-center">No rated restaurants yet</div>
                )
              )}
            </div>
          </motion.div>

          <motion.div
            className="col-span-1 p-md min-h-[300px] md:min-h-[400px] xl:min-h-[500px] bg-[#0a0a0a]/85 backdrop-blur-[24px] border border-white/10 rounded-[2rem] transition-all duration-400 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)] hover:bg-[#0f0f0f]/90 hover:border-white/20 hover:-translate-y-[6px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_24px_rgba(138,43,226,0.1),0_0_0_1px_rgba(255,255,255,0.05)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/5 data-[theme=light]:shadow-[0_8px_32px_rgba(0,0,0,0.08)] data-[theme=light]:hover:bg-white/95 data-[theme=light]:hover:border-black/10 data-[theme=light]:hover:shadow-[0_16px_48px_rgba(0,0,0,0.12),0_0_24px_rgba(138,43,226,0.08)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MasonryGallery />
          </motion.div>
        </section>

        <section className="mt-xl">
          <h2 className="font-sans text-[1.5rem] md:text-[1.75rem] xl:text-[2rem] font-bold mb-lg text-primary tracking-[-0.02em] leading-[1.2]">Featured Restaurants</h2>
          <div className="flex flex-col gap-md">
            {loading ? (
              <div className="text-secondary text-center py-xl">Discovering restaurants...</div>
            ) : (
              restaurants.length > 0 ? (
                restaurants.slice(0, 6).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id || restaurant.id}
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))
              ) : (
                <div className="text-secondary text-center py-xl">No restaurants found currently</div>
              )
            )}
          </div>
        </section>
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Home
