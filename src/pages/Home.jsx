import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Route } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantModal from '../components/RestaurantModal'
import FoodTrailCard from '../components/FoodTrailCard'
import DishesCarousel from '../components/DishesCarousel'
import MasonryGallery from '../components/MasonryGallery'
import { restaurants } from '../data/restaurants'
import { foodTrails } from '../data/foodTrails'
import './Home.css'

const Home = () => {
  const { t } = useTranslation()
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const topRated = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
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
    <div className="home-page">
      <section className="hero-section">
        {/* Background Video */}
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&q=80"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-cooking-food-in-a-pan-6412/1080p.mp4"
            type="video/mp4"
          />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        
        {/* Dark Overlay */}
        <div className="hero-overlay" />
        
        {/* Content */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-title">Discover Aurangabad's Culinary Treasures</h1>
          <p className="hero-subtitle">
            Curated by Institute of Hotel Management, MGM University
          </p>
          <Link to="/explore" className="hero-cta">
            Explore Restaurants
          </Link>
        </motion.div>
      </section>

      <div className="home-content">
        <section className="bento-grid">
          <motion.div
            className="bento-card large"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bento-header">
              <Star size={24} fill="#FFD700" color="#FFD700" />
              <h2>Top 5 Highest Rated</h2>
            </div>
            <div className="bento-restaurants">
              {topRated.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bento-restaurant-item"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <img src={restaurant.image} alt={restaurant.name} />
                  <div className="bento-restaurant-info">
                    <h4>{restaurant.name}</h4>
                    <div className="bento-rating">
                      <Star size={14} fill="#FFD700" color="#FFD700" />
                      <span>{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bento-card masonry-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MasonryGallery />
          </motion.div>
        </section>

        <DishesCarousel />

        <section className="food-trails-section">
          <div className="section-header">
            <Route size={28} />
            <h2 className="section-title">Curated Food Trails</h2>
          </div>
          <p className="section-subtitle">
            Explore Aurangabad through themed culinary journeys
          </p>
          <div className="food-trails-grid">
            {foodTrails.map((trail) => (
              <FoodTrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </section>

        <section className="featured-section">
          <h2 className="section-title">Featured Restaurants</h2>
          <div className="restaurants-grid">
            {restaurants.slice(0, 6).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => handleRestaurantClick(restaurant)}
              />
            ))}
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


