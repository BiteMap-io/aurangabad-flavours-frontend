import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import { hotelsApi } from '../services/adminApi'

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
    <>
      <style>
        {`
          @keyframes cuisineSlideshow {
            0%, 12.5% { background-image: url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            12.5%, 25% { background-image: url('https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            25%, 37.5% { background-image: url('https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            37.5%, 50% { background-image: url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            50%, 62.5% { background-image: url('https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            62.5%, 75% { background-image: url('https://images.unsplash.com/photo-1563379091339-03246963d51a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            75%, 87.5% { background-image: url('https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
            87.5%, 100% { background-image: url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
          }
          .animate-cuisine-slideshow {
            animation: cuisineSlideshow 40s infinite;
          }
        `}
      </style>
      <div className="min-h-screen relative p-0 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[#1a1a1a] bg-cover bg-center bg-no-repeat bg-fixed animate-cuisine-slideshow filter brightness-[1.1] contrast-[1.2] saturate-[1.1] data-[theme=light]:brightness-[0.9] data-[theme=light]:contrast-[1.1] data-[theme=light]:saturate-[1.2] data-[theme=light]:bg-[#f8fafc] z-[0]" />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none data-[theme=light]:bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.7)_100%)] z-[1]" />
        
        {/* Main wrapper properly positioned on top of the background */}
        <div className="relative z-[2] max-w-[1400px] mx-auto py-xl px-lg">
          <div className="text-center mb-xl">
            <h1 className="text-[3rem] mb-sm text-primary [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] data-[theme=light]:[text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">Explore by Cuisine</h1>
            <p className="text-[1.1rem] text-secondary [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] data-[theme=light]:[text-shadow:0_1px_4px_rgba(0,0,0,0.2)]">Discover restaurants by their culinary style</p>
          </div>

          <div className="flex flex-wrap gap-sm mb-xl p-lg bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg shadow-glass">
            <button
              className={`py-sm px-md bg-glass-surface border border-glass-border rounded-md text-secondary text-[0.95rem] font-medium cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-white/20 hover:text-primary ${selectedCuisine === '' ? '!bg-accent-purple !border-accent-purple text-white' : ''}`}
              onClick={() => setSelectedCuisine('')}
            >
              All Cuisines
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                className={`py-sm px-md bg-glass-surface border border-glass-border rounded-md text-secondary text-[0.95rem] font-medium cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-white/20 hover:text-primary ${selectedCuisine === cuisine ? '!bg-accent-purple !border-accent-purple text-white' : ''}`}
                onClick={() => setSelectedCuisine(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>

          <div className="mt-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-xl bg-glass-surface border border-glass-border rounded-lg text-secondary text-center gap-md min-h-[200px]">
                <Loader className="animate-spin text-accent-purple w-8 h-8" />
                <span>Finding the best flavours...</span>
              </div>
            ) : (
              <>
                {selectedCuisine && (
                  <h2 className="text-[2rem] mb-lg text-primary font-semibold">
                    {filteredRestaurants.length} {selectedCuisine} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
                  </h2>
                )}

                <div className="flex flex-col gap-md">
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
                    <div className="flex flex-col items-center justify-center p-xl bg-glass-surface border border-glass-border rounded-lg text-secondary text-center gap-md min-h-[200px]">
                      <p>No restaurants found for this cuisine.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <RestaurantModal
          restaurant={selectedRestaurant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  )
}

export default Cuisines
