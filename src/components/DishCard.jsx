import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './DishCard.css'

const DishCard = ({ dish }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/explore?dish=${dish.id}`)
  }

  return (
    <motion.div
      className="dish-card"
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="dish-image-wrapper">
        <img src={dish.image} alt={dish.name} className="dish-image" />
        <div className="dish-overlay" />
      </div>
      <span className="dish-name">{dish.name}</span>
    </motion.div>
  )
}

export default DishCard
