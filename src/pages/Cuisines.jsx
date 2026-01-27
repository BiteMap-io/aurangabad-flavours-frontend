import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import { restaurants, cuisines } from '../data/restaurants'
import './Cuisines.css'

const Cuisines = () => {
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredRestaurants = selectedCuisine
    ? restaurants.filter((r) => r.cuisine === selectedCuisine)
    : restaurants

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
        {selectedCuisine && (
          <h2 className="section-title">
            {filteredRestaurants.length} {selectedCuisine} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </h2>
        )}

        <div className="restaurants-grid">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <RestaurantCard
                restaurant={restaurant}
                onClick={() => handleRestaurantClick(restaurant)}
              />
            </motion.div>
          ))}
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

export default Cuisines


