import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Clock } from 'lucide-react'
import RestaurantModal from '../components/RestaurantModal'
import EmbeddedMap from '../components/EmbeddedMap'
import { restaurants, areas } from '../data/restaurants'
import './MapView.css'

const MapView = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')

  const filteredRestaurants = selectedArea
    ? restaurants.filter((r) => r.area === selectedArea)
    : restaurants

  const areaStats = areas.map((area) => ({
    name: area,
    count: restaurants.filter((r) => r.area === area).length,
  }))

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  return (
    <div className="map-view-page">
      {/* Hero Section with Background */}
      <section className="map-hero-section">
        <div className="map-hero-overlay" />
        <div className="map-view-header">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Restaurant Map
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore restaurants on the map and by area
          </motion.p>
        </div>
      </section>

      <div className="map-content">
        <div className="areas-filter-section">
          <h2>Filter by Area</h2>
          <div className="areas-filter-grid">
            <motion.div
              className={`area-filter-card ${selectedArea === '' ? 'active' : ''}`}
              onClick={() => setSelectedArea('')}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin size={20} />
              <span>All Areas</span>
              <small>{restaurants.length} restaurants</small>
            </motion.div>
            {areaStats.map((area) => (
              <motion.div
                key={area.name}
                className={`area-filter-card ${selectedArea === area.name ? 'active' : ''}`}
                onClick={() => setSelectedArea(selectedArea === area.name ? '' : area.name)}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin size={20} />
                <span>{area.name}</span>
                <small>{area.count} restaurant{area.count !== 1 ? 's' : ''}</small>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="map-view-container">
          <div className="map-sidebar">
            <h2>
              {selectedArea ? `Restaurants in ${selectedArea}` : 'All Restaurants'}
            </h2>
            <div className="map-restaurants-list">
              {filteredRestaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  className="map-restaurant-item"
                  onClick={() => handleRestaurantClick(restaurant)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="map-restaurant-image">
                    <img src={restaurant.image} alt={restaurant.name} />
                  </div>
                  <div className="map-restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>
                    <div className="map-restaurant-meta">
                      <span>
                        <MapPin size={14} />
                        {restaurant.distance}
                      </span>
                      <span>
                        <Clock size={14} />
                        {restaurant.travelTime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="map-container">
            <EmbeddedMap 
              height="100%" 
              zoom={14}
              restaurants={filteredRestaurants}
            />
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


