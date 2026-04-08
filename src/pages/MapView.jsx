import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader } from 'lucide-react'
import RestaurantModal from '../components/RestaurantModal'
import EmbeddedMap from '../components/EmbeddedMap'
import { hotelsApi } from '../services/adminApi'

const MapView = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
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
        console.error('Failed to fetch restaurants for map:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const areaStats = useMemo(() => {
    const stats = {}
    restaurants.forEach(r => {
      if (r.area) {
        stats[r.area] = (stats[r.area] || 0) + 1
      }
    })
    return Object.entries(stats).map(([name, count]) => ({ name, count }))
  }, [restaurants])

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const filteredRestaurants = selectedArea
    ? restaurants.filter((r) => r.area === selectedArea)
    : restaurants

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative min-h-[50vh] max-md:min-h-[40vh] flex items-center justify-center py-xl px-lg max-md:px-md mb-xl overflow-hidden bg-[url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&q=80')] bg-cover bg-center max-md:bg-top bg-no-repeat light:brightness-[0.9]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-[1] light:from-black/30 light:via-black/40 light:to-black/50" />
        
        <div className="relative z-[2] text-center max-w-[800px]">
          <motion.h1
            className="text-[3.5rem] max-md:text-[2.5rem] font-bold mb-md text-white drop-shadow-lg leading-[1.2]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Restaurant Map
          </motion.h1>
          <motion.p
            className="text-[1.25rem] max-md:text-[1.1rem] text-white/95 drop-shadow-md opacity-95"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore restaurants on the map and by area
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-lg max-md:px-md">
        <div className="mb-xl">
          <h2 className="text-[1.5rem] mb-lg text-primary text-center">Filter by Area</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-md max-w-[1200px] mx-auto">
            <motion.div
              className={`flex flex-col items-center gap-xs p-lg bg-glass-surface border border-glass-border rounded-lg cursor-pointer transition-all duration-300 text-center hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${selectedArea === '' ? '!bg-glass-hover !border-accent-purple shadow-[0_0_20px_var(--accent-purple)]' : ''}`}
              onClick={() => setSelectedArea('')}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin size={20} />
              <span className="text-[1rem] font-semibold text-primary">All Areas</span>
              <small className="text-[0.85rem] text-secondary">{restaurants.length} restaurants</small>
            </motion.div>
            {areaStats.map((area) => (
              <motion.div
                key={area.name}
                className={`flex flex-col items-center gap-xs p-lg bg-glass-surface border border-glass-border rounded-lg cursor-pointer transition-all duration-300 text-center hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${selectedArea === area.name ? '!bg-glass-hover !border-accent-purple shadow-[0_0_20px_var(--accent-purple)]' : ''}`}
                onClick={() => setSelectedArea(selectedArea === area.name ? '' : area.name)}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin size={20} />
                <span className="text-[1rem] font-semibold text-primary">{area.name}</span>
                <small className="text-[0.85rem] text-secondary">{area.count} restaurant{area.count !== 1 ? 's' : ''}</small>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[400px_1fr] max-lg:grid-cols-1 gap-lg h-[calc(100vh-300px)] min-h-[600px] max-lg:h-auto mb-xl">
          <div className="bg-glass-surface border border-glass-border rounded-lg p-lg overflow-y-auto max-lg:max-h-[400px]">
            <h2 className="text-[1.5rem] mb-lg text-primary pb-md border-b border-glass-border">
              {selectedArea ? `Restaurants in ${selectedArea}` : 'All Restaurants'}
            </h2>
            <div className="flex flex-col gap-md">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-xl text-center gap-sm text-secondary h-[200px]">
                  <Loader className="animate-spin" />
                  <span>Loading restaurants...</span>
                </div>
              ) : filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <motion.div
                    key={restaurant._id || restaurant.id}
                    className="flex gap-md p-md bg-glass-surface border border-glass-border rounded-md cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-white/20"
                    onClick={() => handleRestaurantClick(restaurant)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-[80px] h-[80px] rounded-md overflow-hidden shrink-0">
                      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <h3 className="text-[1rem] text-primary m-0">{restaurant.name}</h3>
                      <p className="text-[0.9rem] text-secondary m-0">{restaurant.cuisine}</p>
                      <div className="flex gap-md mt-2 text-[0.85rem] text-secondary">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {restaurant.area}
                        </span>
                        {restaurant.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {restaurant.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-xl text-center gap-sm text-secondary h-[200px]">
                  <p>No restaurants found in this area.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-glass-surface border border-glass-border rounded-lg overflow-hidden relative h-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-glass-surface text-accent-purple">
                <Loader size={48} className="animate-spin" />
              </div>
            ) : (
              <EmbeddedMap 
                height="100%" 
                zoom={selectedArea ? 15 : 13}
                restaurants={filteredRestaurants}
              />
            )}
          </div>
        </div>
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default MapView
