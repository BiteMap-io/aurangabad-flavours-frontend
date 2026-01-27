import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react'
import DishCard from './DishCard'
import { popularDishes } from '../data/dishes'
import './DishesCarousel.css'

const DishesCarousel = () => {
  const scrollContainerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate dishes for seamless infinite loop
  const duplicatedDishes = [...popularDishes, ...popularDishes, ...popularDishes]

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="dishes-carousel-section">
      <div className="dishes-header">
        <div className="dishes-title-wrapper">
          <UtensilsCrossed size={28} />
          <h2 className="dishes-title">Explore by Dish</h2>
        </div>
        <p className="dishes-subtitle">
          Discover restaurants serving your favorite dishes
        </p>
      </div>

      <div className="dishes-carousel-container">
        <button
          className="carousel-nav-btn carousel-nav-left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          className="dishes-scroll-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div 
            className="dishes-grid-auto"
            animate={{
              x: isPaused ? undefined : [0, -140 * popularDishes.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedDishes.map((dish, index) => (
              <div key={`${dish.id}-${index}`} className="dish-card-wrapper">
                <DishCard dish={dish} />
              </div>
            ))}
          </motion.div>
        </div>

        <button
          className="carousel-nav-btn carousel-nav-right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}

export default DishesCarousel
